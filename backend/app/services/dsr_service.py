"""DSR Entry Service — core business logic"""

from datetime import date, datetime
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dsr_entry import DSREntry, DSRStatus
from app.models.dsr_permission_request import DSRPermissionRequest, DSRPermissionStatus
from app.models.user import User, UserRole
from app.schemas.dsr_entry import (
    DSREntryCreate,
    DSREntryUpdate,
    DSRGrantPreviousDayPermission,
    DSRSendReminder,
)
from app.schemas.dsr_permission_request import (
    DSRPermissionRequestCreate,
    DSRPermissionRequestUpdate,
)
from app.repositories.dsr_entry_repository import DSREntryRepository
from app.repositories.dsr_project_repository import DSRProjectRepository
from app.repositories.dsr_activity_repository import DSRActivityRepository
from app.repositories.user_repository import UserRepository
from app.repositories.dsr_permission_request_repository import DSRPermissionRequestRepository
from app.services.dsr_notification_service import DSRNotificationService


def _require_admin(current_user: User) -> None:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Admins can perform this action",
        )


class DSRService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DSREntryRepository(db)
        self.project_repo = DSRProjectRepository(db)
        self.activity_repo = DSRActivityRepository(db)
        self.user_repo = UserRepository(db)
        self.permission_repo = DSRPermissionRequestRepository(db)
        self.notifier = DSRNotificationService(db)

    # ------------------------------------------------------------------
    # Item validation helpers
    # ------------------------------------------------------------------

    async def _validate_and_build_items(self, raw_items: list) -> list:
        """
        Validate each line item:
        - Project must exist and be active
        - Activity must exist, be active, and belong to the referenced project
        - Hours auto-computed from start/end time if not set (schema already does it,
          but we store the resolved project/activity info)
        Returns the resolved items list (with internal IDs stripped out for JSON storage).
        """
        project_cache: dict = {}
        activity_cache: dict = {}
        resolved = []

        for idx, item in enumerate(raw_items):
            p_uid = item["project_public_id"] if isinstance(item, dict) else item.project_public_id
            a_uid = item["activity_public_id"] if isinstance(item, dict) else item.activity_public_id

            # Resolve project
            p_key = str(p_uid)
            if p_key not in project_cache:
                project = await self.project_repo.get_by_public_id(p_uid)
                if not project or not project.is_active:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Item {idx + 1}: Project not found or inactive",
                    )
                project_cache[p_key] = project

            project = project_cache[p_key]

            # Resolve activity
            a_key = str(a_uid)
            if a_key not in activity_cache:
                activity = await self.activity_repo.get_by_public_id(a_uid)
                if not activity or not activity.is_active:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Item {idx + 1}: Activity not found or inactive",
                    )
                if activity.project_id != project.id:
                    raise HTTPException(
                        status_code=422,
                        detail=(
                            f"Item {idx + 1}: Activity '{activity.name}' does not "
                            f"belong to project '{project.name}'"
                        ),
                    )
                activity_cache[a_key] = activity

            activity = activity_cache[a_key]

            resolved.append({
                "project_public_id": str(p_uid),
                "project_name": project.name,
                "activity_public_id": str(a_uid),
                "activity_name": activity.name,
                "description": item["description"] if isinstance(item, dict) else item.description,
                "start_time": item["start_time"] if isinstance(item, dict) else item.start_time,
                "end_time": item["end_time"] if isinstance(item, dict) else item.end_time,
                "hours": item["hours"] if isinstance(item, dict) else item.hours,
            })

        return resolved

    def _can_submit_for_past_date(self, entry: DSREntry, current_user: User) -> bool:
        """True if the user is allowed to submit for a past date."""
        if current_user.role == UserRole.ADMIN:
            return True
        return bool(entry and entry.previous_day_permission_granted_by)

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    async def create_entry(self, data: DSREntryCreate, current_user: User) -> DSREntry:
        today = date.today()

        # Future dates not allowed
        if data.report_date > today:
            raise HTTPException(status_code=422, detail="Cannot create a DSR for a future date")

        # Previous-day guard
        if data.report_date < today:
            if current_user.role != UserRole.ADMIN:
                # Check for explicit permission (legacy flag or new request)
                existing = await self.repo.get_by_user_and_date(current_user.id, data.report_date)
                
                has_permission = False
                if existing and existing.previous_day_permission_granted_by:
                    has_permission = True
                else:
                    permission_request = await self.permission_repo.get_granted_permission(current_user.id, data.report_date)
                    if permission_request:
                        has_permission = True

                if not has_permission:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=(
                            f"Submission for {data.report_date} is not allowed. "
                            "Please raise a request for past-day submission."
                        ),
                    )

        # Duplicate check — only one non-deleted entry per user per date
        existing = await self.repo.get_by_user_and_date(current_user.id, data.report_date)
        if existing and existing.status in (DSRStatus.SUBMITTED, DSRStatus.APPROVED):
            raise HTTPException(
                status_code=422,
                detail=f"A DSR for {data.report_date} has already been submitted",
            )

        # If there's already a draft (e.g. permission entry), update it instead of creating new
        items = await self._validate_and_build_items(data.items)

        is_past = data.report_date < today
        if existing and existing.status == DSRStatus.DRAFT:
            updated = await self.repo.update(existing.id, {"items": items, "others": data.others})
            return await self.repo.get_by_public_id(existing.public_id)

        entry_data = {
            "user_id": current_user.id,
            "report_date": data.report_date,
            "status": DSRStatus.DRAFT,
            "is_previous_day_submission": is_past,
            "items": items,
            "others": data.others,
        }
        return await self.repo.create(entry_data)

    async def update_entry(
        self, public_id: UUID, data: DSREntryUpdate, current_user: User
    ) -> DSREntry:
        entry = await self._get_or_404(public_id)
        self._assert_owner_or_admin(entry, current_user)

        if entry.status != DSRStatus.DRAFT:
            raise HTTPException(
                status_code=400,
                detail="Only DRAFT entries can be updated",
            )

        update_data: dict = {}
        if data.items is not None:
            update_data["items"] = await self._validate_and_build_items(data.items)
        if data.others is not None:
            update_data["others"] = data.others

        await self.repo.update(entry.id, update_data)
        return await self._get_or_404(public_id)

    async def submit_entry(self, public_id: UUID, current_user: User) -> DSREntry:
        entry = await self._get_or_404(public_id)
        self._assert_owner_or_admin(entry, current_user)

        if entry.status != DSRStatus.DRAFT:
            raise HTTPException(status_code=400, detail="Only DRAFT entries can be submitted")

        if not entry.items:
            raise HTTPException(status_code=422, detail="Cannot submit an empty DSR. Add at least one work item.")

        await self.repo.update(entry.id, {
            "status": DSRStatus.SUBMITTED,
            "submitted_at": datetime.utcnow(),
        })
        return await self._get_or_404(public_id)

    async def get_my_entries(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 50,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status: Optional[DSRStatus] = None,
    ) -> Tuple[List[DSREntry], int]:
        return await self.repo.get_entries_by_user(
            current_user.id, skip=skip, limit=limit,
            date_from=date_from, date_to=date_to, status=status,
        )

    async def get_all_entries(
        self,
        current_user: User,
        skip: int = 0,
        limit: int = 100,
        user_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        status: Optional[DSRStatus] = None,
    ) -> Tuple[List[DSREntry], int]:
        _require_admin(current_user)
        return await self.repo.get_all_entries(
            skip=skip, limit=limit, user_id=user_id,
            date_from=date_from, date_to=date_to, status=status,
        )

    async def get_entry(self, public_id: UUID, current_user: User) -> DSREntry:
        entry = await self._get_or_404(public_id)
        self._assert_owner_or_admin(entry, current_user)
        return entry

    async def delete_entry(self, public_id: UUID, current_user: User) -> bool:
        entry = await self._get_or_404(public_id)
        if current_user.role != UserRole.ADMIN:
            if entry.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
            if entry.status != DSRStatus.DRAFT:
                raise HTTPException(status_code=400, detail="Only DRAFT entries can be deleted by the owner")
        return await self.repo.delete(entry.id)

    # ------------------------------------------------------------------
    # Admin actions
    # ------------------------------------------------------------------

    async def grant_previous_day_permission(
        self, data: DSRGrantPreviousDayPermission, current_user: User
    ) -> DSREntry:
        """Admin allows a specific user to submit a DSR for a past date."""
        _require_admin(current_user)

        if data.report_date >= date.today():
            raise HTTPException(status_code=422, detail="Permission is only needed for past dates")

        target_users = await self.user_repo.get_by_fields(public_id=data.user_public_id)
        if not target_users:
            raise HTTPException(status_code=404, detail="Target user not found")
        target_user = target_users[0]

        existing = await self.repo.get_by_user_and_date(target_user.id, data.report_date)
        if existing:
            if existing.status in (DSRStatus.SUBMITTED, DSRStatus.APPROVED):
                raise HTTPException(
                    status_code=422,
                    detail="User has already submitted a DSR for this date",
                )
            # Update existing draft with permission
            await self.repo.update(existing.id, {
                "is_previous_day_submission": True,
                "previous_day_permission_granted_by": current_user.id,
            })
            return await self.repo.get_by_public_id(existing.public_id)
        else:
            # Create an empty DRAFT with the permission flag set
            entry_data = {
                "user_id": target_user.id,
                "report_date": data.report_date,
                "status": DSRStatus.DRAFT,
                "is_previous_day_submission": True,
                "previous_day_permission_granted_by": current_user.id,
                "items": [],
                "others": {"permission_note": f"Granted by admin {current_user.username}"},
            }
            return await self.repo.create(entry_data)

    async def get_missing_dsr_users(
        self, report_date: date, current_user: User
    ) -> List[User]:
        """Admin: returns active users who have NOT submitted a DSR for the given date."""
        _require_admin(current_user)

        submitted_ids = set(await self.repo.get_submitted_user_ids_for_date(report_date))

        # Get all active users
        from sqlalchemy import select
        from app.models.user import User as UserModel
        result = await self.db.execute(
            select(UserModel)
            .where(UserModel.is_active == True)
            .where(UserModel.is_deleted == False)
        )
        all_users = result.scalars().all()
        return [u for u in all_users if u.id not in submitted_ids]

    async def send_reminders(
        self, data: DSRSendReminder, current_user: User
    ) -> dict:
        """Admin: send DSR reminders to specified users or all missing users if not specified."""
        _require_admin(current_user)

        # Resolve public_ids → user_ids
        user_ids = []
        if data.user_public_ids:
            for uid in data.user_public_ids:
                users = await self.user_repo.get_by_fields(public_id=uid)
                if users:
                    user_ids.append(users[0].id)
        else:
            # Recompute missing users for this date
            missing_users = await self.get_missing_dsr_users(data.report_date, current_user)
            user_ids = [u.id for u in missing_users]

        if not user_ids:
            return {"message": "No users to remind", "count": 0}

        return await self.notifier.send_dsr_reminder(
            user_ids=user_ids,
            report_date=data.report_date,
            message=data.message,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _get_or_404(self, public_id: UUID) -> DSREntry:
        entry = await self.repo.get_by_public_id(public_id)
        if not entry:
            raise HTTPException(status_code=404, detail="DSR entry not found")
        return entry

    def _assert_owner_or_admin(self, entry: DSREntry, current_user: User) -> None:
        if current_user.role != UserRole.ADMIN and entry.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this DSR entry")

    # ------------------------------------------------------------------
    # Permission Requests
    # ------------------------------------------------------------------

    async def create_permission_request(
        self, data: DSRPermissionRequestCreate, current_user: User
    ) -> DSRPermissionRequest:
        """User requests permission to submit a DSR for a past date."""
        today = date.today()
        if data.report_date >= today:
            raise HTTPException(status_code=422, detail="Permission is only needed for past dates")

        # Check for existing request
        existing = await self.permission_repo.get_by_user_and_date(current_user.id, data.report_date)
        if existing:
            if existing.status == DSRPermissionStatus.PENDING:
                raise HTTPException(status_code=422, detail="You already have a pending request for this date")
            if existing.status == DSRPermissionStatus.GRANTED:
                raise HTTPException(status_code=422, detail="Permission already granted for this date")

        request_data = {
            "user_id": current_user.id,
            "report_date": data.report_date,
            "reason": data.reason,
            "status": DSRPermissionStatus.PENDING,
        }
        return await self.permission_repo.create(request_data)

    async def get_permission_requests(
        self, current_user: User, skip: int = 0, limit: int = 100, user_id: Optional[int] = None, status: Optional[DSRPermissionStatus] = None
    ) -> Tuple[List[DSRPermissionRequest], int]:
        """List permission requests (Users see their own; Admins see all)."""
        target_user_id = user_id
        if current_user.role != UserRole.ADMIN:
            target_user_id = current_user.id
            
        return await self.permission_repo.get_requests(
            user_id=target_user_id, status=status, skip=skip, limit=limit
        )

    async def get_permission_request(self, public_id: UUID) -> DSRPermissionRequest:
        """Get a single permission request by its public ID."""
        request = await self.permission_repo.get_by_public_id(public_id)
        if not request:
            raise HTTPException(status_code=404, detail="Permission request not found")
        return request

    async def handle_permission_request(
        self, public_id: UUID, data: DSRPermissionRequestUpdate, current_user: User
    ) -> DSRPermissionRequest:
        """Admin grants or rejects a permission request."""
        _require_admin(current_user)

        request = await self.permission_repo.get_by_public_id(public_id)
        if not request:
            raise HTTPException(status_code=404, detail="Permission request not found")

        update_data = {
            "status": data.status,
            "admin_notes": data.admin_notes,
            "handled_by": current_user.id,
            "handled_at": datetime.utcnow(),
        }
        return await self.permission_repo.update(request.id, update_data)
