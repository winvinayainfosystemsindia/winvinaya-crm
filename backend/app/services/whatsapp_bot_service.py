"""WhatsApp Bot Service — orchestrates inbound message processing into CRM records."""

import json
import logging
import httpx
from datetime import datetime, date, timedelta
from typing import Optional, Dict, Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.whatsapp_message import WhatsAppMessage, WAProcessingStatus
from app.models.user import User
from app.models.contact import Contact, ContactSource
from app.models.company import Company, CompanyStatus
from app.models.lead import Lead, LeadSource, LeadStatus
from app.models.deal import Deal, DealStage, DealType
from app.models.crm_task import CRMTask, CRMTaskType, CRMTaskPriority, CRMTaskStatus, CRMRelatedToType
from app.models.crm_activity_log import CRMActivityLog, CRMEntityType, CRMActivityType
from app.services.ai_service import AIService
from app.repositories.system_setting_repository import SystemSettingRepository

logger = logging.getLogger(__name__)

# Meta Cloud API base URL
META_API_URL = "https://graph.facebook.com/v19.0"


class WhatsAppBotService:
    """
    Orchestrates the full WhatsApp → CRM ingestion pipeline.
    Called by the webhook endpoint for every inbound message.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.access_token: Optional[str] = None
        self.phone_number_id: Optional[str] = None
        self.bot_user_id: Optional[int] = None

    async def initialize(self) -> None:
        """Load WhatsApp credentials and bot user from System Settings."""
        repo = SystemSettingRepository(self.db)
        settings = await repo.get_all_settings()
        cfg = {s.key: s.value for s in settings}

        self.access_token = (cfg.get("whatsapp_access_token") or "").strip()
        self.phone_number_id = (cfg.get("whatsapp_phone_number_id") or "").strip()
        raw_bot_user = (cfg.get("whatsapp_bot_user_id") or "").strip()
        self.bot_user_id = int(raw_bot_user) if raw_bot_user.isdigit() else None

        if not self.access_token or not self.bot_user_id:
            logger.warning(
                "WhatsAppBotService: Missing whatsapp_access_token or whatsapp_bot_user_id "
                "in System Settings. Messages will be processed but confirmations may not send."
            )

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    async def handle_inbound(self, payload: Dict[str, Any]) -> None:
        """
        Main entry point called from the webhook POST handler.
        Extracts message details, persists the raw record, then routes.
        """
        await self.initialize()

        try:
            entry = payload.get("entry", [{}])[0]
            change = entry.get("changes", [{}])[0].get("value", {})
            messages = change.get("messages", [])
            contacts_meta = change.get("contacts", [])
            wa_phone_number_id = change.get("metadata", {}).get("phone_number_id", "")

            if not messages:
                logger.debug("WhatsApp webhook: no messages in payload, skipping")
                return

            msg = messages[0]
            wa_message_id: str = msg.get("id", "")
            from_phone: str = msg.get("from", "")
            msg_type: str = msg.get("type", "text")
            timestamp_raw = msg.get("timestamp", "")
            received_at = (
                datetime.utcfromtimestamp(int(timestamp_raw))
                if timestamp_raw
                else datetime.utcnow()
            )

            # Extract display name from contacts metadata
            from_name: Optional[str] = None
            if contacts_meta:
                from_name = contacts_meta[0].get("profile", {}).get("name")

            # Extract text body
            message_body: Optional[str] = None
            if msg_type == "text":
                message_body = msg.get("text", {}).get("body")
            else:
                # For non-text messages, log as 'media received'
                message_body = f"[{msg_type.upper()} received]"

            # ── Idempotency check ──────────────────────────────────────
            existing = await self._get_message_by_wa_id(wa_message_id)
            if existing:
                logger.info(f"WhatsApp message {wa_message_id} already processed, skipping")
                return

            # ── Persist raw record ─────────────────────────────────────
            raw_msg = WhatsAppMessage(
                wa_message_id=wa_message_id,
                wa_phone_number_id=wa_phone_number_id,
                from_phone=from_phone,
                from_name=from_name,
                message_body=message_body,
                message_type=msg_type,
                received_at=received_at,
                processing_status=WAProcessingStatus.PENDING,
            )
            self.db.add(raw_msg)
            await self.db.flush()  # get raw_msg.id

            # ── Check if sender is an internal user ────────────────────
            internal_user = await self._find_user_by_phone(from_phone)

            if internal_user:
                return await self._handle_internal_forwarding(internal_user, message_body or "", wa_message_id, from_phone)

            # ── Lookup existing contact ────────────────────────────────
            existing_contact = await self._find_contact_by_phone(from_phone)
            existing_deal = None
            if existing_contact:
                existing_deal = await self._find_active_deal(existing_contact)

            # ── AI classification ──────────────────────────────────────
            intent = await self._classify_intent(
                message_body or "",
                from_name,
                contact_exists=existing_contact is not None,
                deal_exists=existing_deal is not None,
            )

            raw_msg.ai_intent = intent.get("scenario")
            raw_msg.ai_confidence = intent.get("confidence")

            # ── Route to handler ───────────────────────────────────────
            crm_action: Dict[str, Any] = {}
            scenario = intent.get("scenario", "new_person")

            if scenario == "ignore":
                raw_msg.processing_status = WAProcessingStatus.IGNORED
                await self.db.commit()
                logger.info(f"WhatsApp {wa_message_id}: classified as IGNORE, no action")
                return

            try:
                if scenario == "follow_up" and existing_deal:
                    crm_action = await self._handle_follow_up(existing_contact, existing_deal, intent, from_phone)
                elif scenario == "known_contact" and existing_contact:
                    crm_action = await self._handle_known_contact(existing_contact, intent, raw_msg)
                else:
                    # Default to new_person for unknown callers or unmatched scenarios
                    crm_action = await self._handle_new_person(from_phone, from_name, intent)

                raw_msg.crm_action_taken = crm_action
                raw_msg.processing_status = WAProcessingStatus.PROCESSED

                # ── Send WA confirmation ───────────────────────────────
                confirm_msg = crm_action.get("confirmation_message", "Your message has been received.")
                await self._send_confirmation(from_phone, confirm_msg)

            except Exception as e:
                logger.error(f"WhatsApp bot error handling message {wa_message_id}: {e}", exc_info=True)
                raw_msg.processing_status = WAProcessingStatus.FAILED
                raw_msg.error_message = str(e)

            await self.db.commit()

        except Exception as e:
            logger.error(f"WhatsApp handle_inbound critical error: {e}", exc_info=True)
            await self.db.rollback()

    async def _handle_internal_forwarding(
        self,
        user: User,
        message_body: str,
        wa_message_id: str,
        from_phone: str,
    ) -> None:
        """
        Handle a message forwarded by an internal WinVinaya employee.
        Extracts lead info and creates records assigned to that employee.
        """
        raw_msg = await self._get_message_by_wa_id(wa_message_id)
        if not raw_msg:
            return  # Should not happen

        try:
            # 1. AI Analysis of the forwarded text
            ai = AIService(self.db)
            await ai.initialize()
            extracted = await ai.analyze_forwarded_lead(message_body)

            raw_msg.ai_intent = "forwarded_lead"
            raw_msg.ai_confidence = extracted.get("confidence", 0.0)

            enquiry_summary = extracted.get("enquiry_summary", "Forwarded Lead")
            client_name = extracted.get("sender_name") or "Unknown Client"
            company_name = extracted.get("company_name")
            client_phone = extracted.get("phone_number")  # E.164 if found

            # 2. Check if client already exists (if phone found)
            existing_contact = None
            if client_phone:
                existing_contact = await self._find_contact_by_phone(client_phone)

            # 3. Create/Update records
            if existing_contact:
                # Log activity on existing contact
                activity = CRMActivityLog(
                    entity_type=CRMEntityType.CONTACT,
                    entity_id=existing_contact.id,
                    activity_type=CRMActivityType.WHATSAPP_MESSAGE,
                    performed_by=user.id,
                    summary=f"Forwarded enquiry from {user.full_name}: {enquiry_summary[:200]}",
                    extra_data={"forwarded_by": user.id, "original_msg": message_body},
                )
                self.db.add(activity)
                crm_action = {"contact_id": existing_contact.id, "activity_id": "logged"}
                confirm_header = f"📝 *Existing Contact linked: {existing_contact.full_name}*"
            else:
                # Create NEW Lead flow, assigned to the FORWARDER
                # Create Company
                company = None
                if company_name:
                    company = Company(name=company_name, status=CompanyStatus.PROSPECT)
                    self.db.add(company)
                    await self.db.flush()

                # Create Contact
                name_parts = client_name.strip().split(" ", 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else "."

                contact = Contact(
                    first_name=first_name,
                    last_name=last_name,
                    mobile=client_phone if client_phone else f"FWD-{wa_message_id[:10]}",
                    company_id=company.id if company else None,
                    contact_source=ContactSource.WHATSAPP,
                )
                self.db.add(contact)
                await self.db.flush()

                # Create Lead assigned to the forwarder
                lead = Lead(
                    title=f"FWD: {client_name} — {enquiry_summary[:50]}",
                    description=f"Forwarded by {user.full_name}.\n\n{message_body}",
                    lead_source=LeadSource.WHATSAPP,
                    lead_status=LeadStatus.NEW,
                    assigned_to=user.id,  # <--- Assigned to the employee who forwarded it
                    company_id=company.id if company else None,
                    contact_id=contact.id,
                    tags=["forwarded", "whatsapp"],
                )
                self.db.add(lead)
                await self.db.flush()

                # Auto-Task for the forwarder
                task = CRMTask(
                    title=f"Action Forwarded Lead: {client_name}",
                    description=f"You forwarded this lead via WhatsApp.\nEnquiry: {enquiry_summary}",
                    task_type=CRMTaskType.FOLLOW_UP,
                    priority=CRMTaskPriority.HIGH,
                    status=CRMTaskStatus.PENDING,
                    assigned_to=user.id,
                    created_by=user.id,
                    related_to_type=CRMRelatedToType.LEAD,
                    related_to_id=lead.id,
                    due_date=datetime.utcnow() + timedelta(hours=2),
                )
                self.db.add(task)
                crm_action = {"lead_id": lead.id, "contact_id": contact.id, "task_id": "created"}
                confirm_header = f"🚀 *Lead created and assigned to YOU: {client_name}*"

            raw_msg.crm_action_taken = crm_action
            raw_msg.processing_status = WAProcessingStatus.PROCESSED

            # 4. Confirmation back to the EMPLOYEE
            reply = (
                f"{confirm_header}\n"
                f"📋 Summary: {enquiry_summary}\n"
                f"🏢 Company: {company_name or '—'}\n"
                f"Sync successful. View in CRM."
            )
            await self._send_confirmation(from_phone, reply)

            await self.db.commit()

        except Exception as e:
            logger.error(f"Internal forwarding error: {e}", exc_info=True)
            raw_msg.processing_status = WAProcessingStatus.FAILED
            raw_msg.error_message = str(e)
            await self.db.commit()

    async def _find_user_by_phone(self, phone: str) -> Optional[User]:
        """Look up an internal User by their mobile number."""
        stripped = phone.lstrip("91").lstrip("0") if len(phone) > 10 else phone
        stmt = select(User).where(
            User.is_active == True
        ).where(
            User.mobile.like(f"%{stripped}")
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    # ------------------------------------------------------------------
    # AI Classification
    # ------------------------------------------------------------------

    async def _classify_intent(
        self,
        message_body: str,
        from_name: Optional[str],
        contact_exists: bool,
        deal_exists: bool,
    ) -> Dict[str, Any]:
        """Delegate to AIService for intent classification."""
        try:
            ai = AIService(self.db)
            await ai.initialize()
            return await ai.classify_whatsapp_intent(
                message_body=message_body,
                from_name=from_name,
                contact_exists=contact_exists,
                deal_exists=deal_exists,
            )
        except Exception as e:
            logger.error(f"_classify_intent failed: {e}")
            scenario = "known_contact" if contact_exists else "new_person"
            return {
                "scenario": scenario,
                "sender_name": from_name,
                "company_name": None,
                "enquiry_summary": message_body[:100],
                "deal_stage_hint": None,
                "confidence": 0.5,
            }

    # ------------------------------------------------------------------
    # Scenario handlers
    # ------------------------------------------------------------------

    async def _handle_new_person(
        self,
        from_phone: str,
        from_name: Optional[str],
        intent: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        New enquirer — create Company (optional) → Contact → Lead → CRMTask.
        Returns a dict with created record IDs and a confirmation message.
        """
        if not self.bot_user_id:
            raise ValueError("whatsapp_bot_user_id not configured in System Settings")

        enquiry_summary = intent.get("enquiry_summary", "WhatsApp enquiry")
        sender_name = intent.get("sender_name") or from_name or "Unknown"
        company_name = intent.get("company_name")

        # Parse name
        name_parts = sender_name.strip().split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else "."

        # 1. Create Company if a company name was extracted
        company: Optional[Company] = None
        if company_name:
            company = Company(
                name=company_name,
                status=CompanyStatus.PROSPECT,
            )
            self.db.add(company)
            await self.db.flush()
            logger.info(f"WhatsApp bot: created Company '{company_name}' (id={company.id})")

        # 2. Create Contact
        contact = Contact(
            first_name=first_name,
            last_name=last_name,
            mobile=from_phone,
            company_id=company.id if company else None,
            contact_source=ContactSource.WHATSAPP,
            custom_fields={"whatsapp_phone": from_phone},
        )
        self.db.add(contact)
        await self.db.flush()
        logger.info(f"WhatsApp bot: created Contact '{sender_name}' (id={contact.id})")

        # 3. Create Lead
        lead = Lead(
            title=f"WhatsApp Enquiry — {sender_name}",
            description=enquiry_summary,
            lead_source=LeadSource.WHATSAPP,
            lead_status=LeadStatus.NEW,
            assigned_to=self.bot_user_id,
            company_id=company.id if company else None,
            contact_id=contact.id,
            tags=["whatsapp", "auto-created"],
            custom_fields={"wa_from_phone": from_phone},
        )
        self.db.add(lead)
        await self.db.flush()
        logger.info(f"WhatsApp bot: created Lead (id={lead.id})")

        # 4. Log CRM activity on Lead
        activity = CRMActivityLog(
            entity_type=CRMEntityType.LEAD,
            entity_id=lead.id,
            activity_type=CRMActivityType.CREATED,
            performed_by=self.bot_user_id,
            summary=f"Lead auto-created from WhatsApp message by {sender_name}",
            extra_data={"wa_phone": from_phone, "enquiry": enquiry_summary},
        )
        self.db.add(activity)

        # 5. Create follow-up CRMTask
        task = CRMTask(
            title=f"Follow up with {sender_name} (WhatsApp)",
            description=f"Auto-created from WhatsApp.\nEnquiry: {enquiry_summary}",
            task_type=CRMTaskType.FOLLOW_UP,
            priority=CRMTaskPriority.HIGH,
            status=CRMTaskStatus.PENDING,
            assigned_to=self.bot_user_id,
            created_by=self.bot_user_id,
            related_to_type=CRMRelatedToType.LEAD,
            related_to_id=lead.id,
            due_date=datetime.utcnow() + timedelta(hours=4),
        )
        self.db.add(task)
        await self.db.flush()
        logger.info(f"WhatsApp bot: created CRMTask (id={task.id})")

        confirmation = (
            f"✅ *Lead created for {sender_name}*\n"
            f"📋 Enquiry: {enquiry_summary}\n"
            f"🗓 Follow-up task assigned. View in CRM."
        )

        return {
            "scenario": "new_person",
            "contact_id": contact.id,
            "company_id": company.id if company else None,
            "lead_id": lead.id,
            "task_id": task.id,
            "confirmation_message": confirmation,
        }

    async def _handle_known_contact(
        self,
        contact: Contact,
        intent: Dict[str, Any],
        raw_msg: WhatsAppMessage,
    ) -> Dict[str, Any]:
        """
        Known contact — log a WhatsApp message activity on the contact.
        """
        if not self.bot_user_id:
            raise ValueError("whatsapp_bot_user_id not configured in System Settings")

        enquiry_summary = intent.get("enquiry_summary", raw_msg.message_body or "")

        activity = CRMActivityLog(
            entity_type=CRMEntityType.CONTACT,
            entity_id=contact.id,
            activity_type=CRMActivityType.WHATSAPP_MESSAGE,
            performed_by=self.bot_user_id,
            summary=f"WhatsApp message from {contact.full_name}: {enquiry_summary[:200]}",
            extra_data={
                "wa_phone": raw_msg.from_phone,
                "message_body": raw_msg.message_body,
                "wa_message_id": raw_msg.wa_message_id,
            },
        )
        self.db.add(activity)
        await self.db.flush()

        confirmation = (
            f"📝 *Activity logged for {contact.full_name}*\n"
            f"Message received and noted in CRM."
        )

        return {
            "scenario": "known_contact",
            "contact_id": contact.id,
            "activity_id": activity.id,
            "confirmation_message": confirmation,
        }

    async def _handle_follow_up(
        self,
        contact: Contact,
        deal: Deal,
        intent: Dict[str, Any],
        from_phone: str,
    ) -> Dict[str, Any]:
        """
        Follow-up message — advance deal stage if indicated + create follow-up task.
        """
        if not self.bot_user_id:
            raise ValueError("whatsapp_bot_user_id not configured in System Settings")

        enquiry_summary = intent.get("enquiry_summary", "WhatsApp follow-up")
        stage_hint = intent.get("deal_stage_hint")

        # Advance deal stage if AI suggested one and it's a valid progression
        old_stage = deal.deal_stage
        stage_order = [
            DealStage.DISCOVERY,
            DealStage.QUALIFICATION,
            DealStage.PROPOSAL,
            DealStage.NEGOTIATION,
        ]
        if stage_hint:
            try:
                new_stage = DealStage(stage_hint)
                current_idx = stage_order.index(deal.deal_stage) if deal.deal_stage in stage_order else -1
                new_idx = stage_order.index(new_stage) if new_stage in stage_order else -1
                if new_idx > current_idx:
                    deal.deal_stage = new_stage
                    await self.db.flush()
                    logger.info(f"WhatsApp bot: advanced Deal {deal.id} stage {old_stage} → {new_stage}")
            except (ValueError, AttributeError) as e:
                logger.warning(f"Invalid stage_hint '{stage_hint}': {e}")

        # Log activity on deal
        activity = CRMActivityLog(
            entity_type=CRMEntityType.DEAL,
            entity_id=deal.id,
            activity_type=CRMActivityType.WHATSAPP_MESSAGE,
            performed_by=self.bot_user_id,
            summary=f"WhatsApp follow-up from {contact.full_name}: {enquiry_summary[:200]}",
            extra_data={"wa_phone": from_phone, "old_stage": old_stage, "stage_hint": stage_hint},
        )
        self.db.add(activity)

        # Create follow-up task
        task = CRMTask(
            title=f"Follow up: {contact.full_name} re '{deal.title}'",
            description=f"WhatsApp follow-up.\nEnquiry: {enquiry_summary}",
            task_type=CRMTaskType.FOLLOW_UP,
            priority=CRMTaskPriority.HIGH,
            status=CRMTaskStatus.PENDING,
            assigned_to=self.bot_user_id,
            created_by=self.bot_user_id,
            related_to_type=CRMRelatedToType.DEAL,
            related_to_id=deal.id,
            due_date=datetime.utcnow() + timedelta(hours=4),
        )
        self.db.add(task)
        await self.db.flush()

        confirmation = (
            f"🔄 *Deal updated for {contact.full_name}*\n"
            f"Deal: _{deal.title}_\n"
            f"Stage: {deal.deal_stage}\n"
            f"Follow-up task created."
        )

        return {
            "scenario": "follow_up",
            "contact_id": contact.id,
            "deal_id": deal.id,
            "task_id": task.id,
            "activity_id": activity.id,
            "old_stage": str(old_stage),
            "new_stage": str(deal.deal_stage),
            "confirmation_message": confirmation,
        }

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _find_contact_by_phone(self, phone: str) -> Optional[Contact]:
        """Look up a Contact by mobile or phone (E.164 or local format)."""
        # Normalise: strip leading zeros / country code variations
        stripped = phone.lstrip("91").lstrip("0") if len(phone) > 10 else phone
        stmt = (
            select(Contact)
            .where(Contact.is_deleted == False)
            .where(
                Contact.mobile.like(f"%{stripped}")
                | Contact.phone.like(f"%{stripped}")
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def _find_active_deal(self, contact: Contact) -> Optional[Deal]:
        """Find the most recent open (non-closed) deal for a contact."""
        closed_stages = [DealStage.CLOSED_WON, DealStage.CLOSED_LOST]
        stmt = (
            select(Deal)
            .where(Deal.contact_id == contact.id)
            .where(Deal.is_deleted == False)
            .where(Deal.deal_stage.notin_([s.value for s in closed_stages]))
            .order_by(Deal.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def _get_message_by_wa_id(self, wa_message_id: str) -> Optional[WhatsAppMessage]:
        """Idempotency check — returns existing row if already processed."""
        stmt = select(WhatsAppMessage).where(
            WhatsAppMessage.wa_message_id == wa_message_id
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def _send_confirmation(self, to_phone: str, message: str) -> None:
        """
        Send a WhatsApp text message reply via Meta Cloud API.
        Fails gracefully — a send failure does NOT rollback CRM records.
        """
        if not self.access_token or not self.phone_number_id:
            logger.warning("WhatsApp confirmation not sent: missing credentials")
            return

        url = f"{META_API_URL}/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        body = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "text",
            "text": {"body": message},
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, headers=headers, json=body)
                if resp.status_code != 200:
                    logger.warning(
                        f"Meta API reply failed for {to_phone}: "
                        f"{resp.status_code} {resp.text}"
                    )
                else:
                    logger.info(f"WhatsApp confirmation sent to {to_phone}")
        except Exception as e:
            logger.error(f"_send_confirmation error for {to_phone}: {e}")
