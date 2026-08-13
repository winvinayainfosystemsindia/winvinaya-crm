"""Consent PDF Service — Generates official PDF of Candidate Consent Form and saves to Candidate Document Collection"""

import os
from pathlib import Path
from datetime import datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
	SimpleDocTemplate,
	Paragraph,
	Spacer,
	Table,
	TableStyle,
	HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

from app.models.candidate import Candidate
from app.models.candidate_screening import CandidateScreening
from app.models.candidate_document import CandidateDocument
from app.services.file_storage_service import FileStorageService


class ConsentPDFService:
	"""Service to generate consent form PDF and store in Candidate Documents"""

	@staticmethod
	def generate_pdf_file(
		candidate_name: str,
		candidate_email: str,
		candidate_phone: str | None,
		disability_type: str | None,
		city: str | None,
		public_id: str,
		consent_at: datetime | None,
		consent_ip: str | None,
		output_path: str
	) -> int:
		"""Generate PDF document using ReportLab and save to output_path. Returns file size in bytes."""
		doc = SimpleDocTemplate(
			output_path,
			pagesize=letter,
			rightMargin=40,
			leftMargin=40,
			topMargin=40,
			bottomMargin=40
		)

		styles = getSampleStyleSheet()

		title_style = ParagraphStyle(
			'DocTitle',
			parent=styles['Heading1'],
			fontName='Helvetica-Bold',
			fontSize=18,
			leading=22,
			textColor=colors.HexColor('#1E3A8A'),
			alignment=TA_CENTER
		)

		subtitle_style = ParagraphStyle(
			'DocSubTitle',
			parent=styles['Normal'],
			fontName='Helvetica-Bold',
			fontSize=11,
			leading=14,
			textColor=colors.HexColor('#0D9488'),
			alignment=TA_CENTER
		)

		section_heading = ParagraphStyle(
			'SectionHeading',
			parent=styles['Heading2'],
			fontName='Helvetica-Bold',
			fontSize=12,
			leading=15,
			textColor=colors.HexColor('#1E3A8A'),
			spaceBefore=10,
			spaceAfter=6
		)

		body_style = ParagraphStyle(
			'BodyTextCustom',
			parent=styles['BodyText'],
			fontName='Helvetica',
			fontSize=9.5,
			leading=14,
			textColor=colors.HexColor('#1F2937'),
			alignment=TA_JUSTIFY,
			spaceAfter=8
		)

		label_style = ParagraphStyle(
			'MetaLabel',
			parent=styles['Normal'],
			fontName='Helvetica-Bold',
			fontSize=9,
			textColor=colors.HexColor('#374151')
		)

		value_style = ParagraphStyle(
			'MetaValue',
			parent=styles['Normal'],
			fontName='Helvetica',
			fontSize=9,
			textColor=colors.HexColor('#111827')
		)

		elements = []

		# Header Title & Divider
		elements.append(Paragraph("WINVINAYA FOUNDATION", title_style))
		elements.append(Spacer(1, 4))
		elements.append(Paragraph("CANDIDATE CONSENT & DATA PROCESSING AGREEMENT", subtitle_style))
		elements.append(Spacer(1, 10))
		elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceBefore=4, spaceAfter=12))

		# Candidate Identification Box
		elements.append(Paragraph("Candidate Information", section_heading))
		
		accept_time_str = consent_at.strftime("%d %B %Y at %H:%M:%S UTC") if consent_at else datetime.utcnow().strftime("%d %B %Y at %H:%M:%S UTC")
		ip_str = consent_ip or "Verified Web Session"

		meta_data = [
			[Paragraph("Candidate Name:", label_style), Paragraph(candidate_name or "-", value_style), Paragraph("Registration ID:", label_style), Paragraph(str(public_id)[:8].upper(), value_style)],
			[Paragraph("Email Address:", label_style), Paragraph(candidate_email or "-", value_style), Paragraph("Phone Number:", label_style), Paragraph(candidate_phone or "-", value_style)],
			[Paragraph("City / Location:", label_style), Paragraph(city or "-", value_style), Paragraph("Disability Category:", label_style), Paragraph(disability_type or "N/A", value_style)],
			[Paragraph("Consent Status:", label_style), Paragraph("<font color='#059669'><b>ACCEPTED</b></font>", value_style), Paragraph("Acceptance Date:", label_style), Paragraph(accept_time_str, value_style)]
		]

		meta_table = Table(meta_data, colWidths=[110, 155, 110, 155])
		meta_table.setStyle(TableStyle([
			('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
			('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
			('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#F1F5F9')),
			('TOPPADDING', (0, 0), (-1, -1), 5),
			('BOTTOMPADDING', (0, 0), (-1, -1), 5),
			('LEFTPADDING', (0, 0), (-1, -1), 8),
			('RIGHTPADDING', (0, 0), (-1, -1), 8),
		]))
		elements.append(meta_table)
		elements.append(Spacer(1, 14))

		# Terms & Conditions
		elements.append(Paragraph("Terms of Consent & Authorizations", section_heading))
		
		terms = [
			("1. Personal Information & Data Processing", 
			 "I hereby grant WinVinaya Foundation explicit consent to collect, store, process, and evaluate my personal information, academic credentials, work history, and disability documentation for the purpose of skill development, career counseling, and job placement assistance."),
			
			("2. Sharing Profile with Hiring Partners", 
			 "I authorize WinVinaya Foundation to share my professional profile, resume, assessment scores, and relevant credentials with potential hiring employers, corporate partners, and placement agencies for potential employment and interview opportunities."),
			
			("3. Demographic & Impact Reporting", 
			 "I grant permission to WinVinaya Foundation to utilize my anonymized demographic and disability data for CSR reporting, donor compliance, scholarship evaluation, and organizational impact metrics."),
			
			("4. Candidate Responsibilities", 
			 "I agree to actively participate in scheduled training sessions, counseling assessments, and placement interviews arranged by WinVinaya Foundation, and commit to updating the Foundation team promptly regarding any offer or employment status change.")
		]

		for heading, body in terms:
			elements.append(Paragraph(f"<b>{heading}</b>", ParagraphStyle('TermHead', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#1E3A8A'), spaceAfter=2)))
			elements.append(Paragraph(body, body_style))
			elements.append(Spacer(1, 4))

		elements.append(Spacer(1, 10))

		# Verification & Digital Signature Box
		elements.append(Paragraph("Electronic Verification & Signature", section_heading))

		sig_data = [
			[Paragraph("Digital Signature:", label_style), Paragraph(f"<b>{candidate_name}</b> (Electronically Signed)", value_style)],
			[Paragraph("Verification Status:", label_style), Paragraph("<font color='#059669'><b>VERIFIED & COMPLETED</b></font>", value_style)],
			[Paragraph("IP Address:", label_style), Paragraph(ip_str, value_style)],
			[Paragraph("Timestamp:", label_style), Paragraph(accept_time_str, value_style)]
		]

		sig_table = Table(sig_data, colWidths=[130, 400])
		sig_table.setStyle(TableStyle([
			('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
			('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BBF7D0')),
			('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DCFCE7')),
			('TOPPADDING', (0, 0), (-1, -1), 6),
			('BOTTOMPADDING', (0, 0), (-1, -1), 6),
			('LEFTPADDING', (0, 0), (-1, -1), 10),
			('RIGHTPADDING', (0, 0), (-1, -1), 10),
		]))
		elements.append(sig_table)
		elements.append(Spacer(1, 15))

		# Footer Note
		footer_style = ParagraphStyle(
			'DocFooter',
			parent=styles['Normal'],
			fontName='Helvetica-Oblique',
			fontSize=8,
			textColor=colors.HexColor('#6B7280'),
			alignment=TA_CENTER
		)
		elements.append(Paragraph("This is a computer-generated document stored in the Candidate Document Repository of WinVinaya CRM. No physical signature is required.", footer_style))

		doc.build(elements)
		return os.path.getsize(output_path)

	@staticmethod
	async def create_and_save_consent_pdf(
		db: AsyncSession,
		candidate: Candidate,
		screening: CandidateScreening,
		consent_ip: str | None = None
	) -> CandidateDocument:
		"""
		Generates Consent Form PDF and registers a CandidateDocument record.
		Deactivates previous consent form documents if present.
		"""
		# Prepare directory: uploads/candidates/{safe_name}_{candidate_id}/consent_form/
		safe_name = FileStorageService._sanitize_filename(candidate.name).lower()
		candidate_folder = f"{safe_name}_{candidate.id}"
		folder_path = FileStorageService.BASE_UPLOAD_DIR / candidate_folder / "consent_form"
		folder_path.mkdir(parents=True, exist_ok=True)

		timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
		filename = f"Consent_Form_{safe_name}_{timestamp}.pdf"
		file_path = folder_path / filename

		# Extract metadata
		disability_details = candidate.disability_details or {}
		disability_type = disability_details.get("disability_type") or disability_details.get("type")

		# Generate PDF
		consent_timestamp = (
			screening.consent_at 
			or getattr(screening, "updated_at", None) 
			or getattr(screening, "created_at", None) 
			or getattr(candidate, "created_at", None) 
			or datetime.utcnow()
		)
		file_size = ConsentPDFService.generate_pdf_file(
			candidate_name=candidate.name,
			candidate_email=candidate.email,
			candidate_phone=candidate.phone,
			disability_type=disability_type,
			city=candidate.city,
			public_id=str(candidate.public_id),
			consent_at=consent_timestamp,
			consent_ip=consent_ip or screening.consent_ip or "System Record",
			output_path=str(file_path)
		)

		# Deactivate older consent form documents for this candidate
		doc_query = select(CandidateDocument).where(
			CandidateDocument.candidate_id == candidate.id,
			CandidateDocument.document_type == "consent_form",
			CandidateDocument.is_active == True
		)
		doc_res = await db.execute(doc_query)
		old_docs = doc_res.scalars().all()
		for old_doc in old_docs:
			old_doc.is_active = False

		# Create new document record
		document_record = CandidateDocument(
			candidate_id=candidate.id,
			document_type="consent_form",
			document_name=filename,
			file_path=str(file_path),
			file_size=file_size,
			mime_type="application/pdf",
			description="Signed Candidate Consent Form (PDF)",
			document_source="candidate",
			is_active=True
		)

		db.add(document_record)
		await db.commit()
		await db.refresh(document_record)

		return document_record

	@staticmethod
	async def backfill_all_accepted_candidates(db: AsyncSession) -> int:
		"""
		Finds all candidates who have screening.consent_status == 'Accepted'
		but no active 'consent_form' PDF document in CandidateDocument,
		and generates their consent PDF document.
		"""
		from sqlalchemy.orm import selectinload

		stmt = (
			select(CandidateScreening)
			.where(
				CandidateScreening.consent_status.ilike("accepted"),
				CandidateScreening.is_deleted == False
			)
			.options(selectinload(CandidateScreening.candidate))
		)
		res = await db.execute(stmt)
		screenings = res.scalars().all()

		count = 0
		for sc in screenings:
			if not sc.candidate or sc.candidate.is_deleted:
				continue

			doc_stmt = select(CandidateDocument).where(
				CandidateDocument.candidate_id == sc.candidate_id,
				CandidateDocument.document_type == "consent_form",
				CandidateDocument.is_active == True,
				CandidateDocument.is_deleted == False
			)
			doc_res = await db.execute(doc_stmt)
			existing_doc = doc_res.scalar_one_or_none()

			if not existing_doc:
				try:
					await ConsentPDFService.create_and_save_consent_pdf(
						db=db,
						candidate=sc.candidate,
						screening=sc,
						consent_ip=sc.consent_ip or "System Backfill"
					)
					count += 1
				except Exception as e:
					import logging
					logging.getLogger(__name__).error(f"Error backfilling consent PDF for candidate {sc.candidate_id}: {str(e)}")

		return count
