"""Email Utility for sending professional HTML emails"""

import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional, Any
import aiosmtplib
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Jinja2 Environment
# Path is relative to the backend directory where the app runs
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)

async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    cc: Optional[List[str]] = None
) -> bool:
    """Generic function to send HTML emails via SMTP"""
    
    # Configuration with fallbacks
    smtp_host = settings.SMTP_HOST or "s.mail25.info"
    smtp_port = settings.SMTP_PORT or 587
    smtp_user = settings.SMTP_USER or "no-reply@winvinaya.com"
    smtp_password = settings.SMTP_PASSWORD or "Admin##2025@"
    from_email = settings.EMAILS_FROM_EMAIL or "no-reply@winvinaya.com"
    from_name = settings.EMAILS_FROM_NAME or "winvinaya"
    smtp_tls = settings.SMTP_TLS if settings.SMTP_TLS is not None else True

    message = MIMEMultipart("alternative")
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message["Subject"] = subject
    
    if cc:
        message["Cc"] = ", ".join(cc)

    message.attach(MIMEText(html_content, "html"))

    # Determine TLS strategy
    use_tls_strategy = smtp_tls and smtp_port == 465
    start_tls_strategy = smtp_tls and smtp_port != 465

    try:
        # Debug log for credentials (masked)
        pass_hint = f"{smtp_password[:2]}...{smtp_password[-1]}" if len(smtp_password) > 2 else "***"
        logger.info(f"Attempting SMTP send: {smtp_host}:{smtp_port} as {smtp_user} (Pass: {pass_hint})")
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=use_tls_strategy,
            start_tls=start_tls_strategy,
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except aiosmtplib.SMTPAuthenticationError as e:
        logger.error(f"Authentication failed for {smtp_user} at {smtp_host}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


async def send_registration_emails(candidate: Any):
    """Sends both candidate and sourcing team registration confirmation emails"""
    
    try:
        # 1. Send to Candidate
        candidate_subject = "Welcome to WinVinaya - Registration Successful"
        template = jinja_env.get_template("candidate_registration.html")
        candidate_html = template.render(name=candidate.name)
        await send_email(candidate.email, candidate_subject, candidate_html)
        
        # 2. Send to Sourcing Team
        sourcing_team_email = settings.SOURCING_EMAIL
        team_subject = f"New Candidate Registered: {candidate.name}"
        
        # Extract disability type safely
        disability_type = "N/A"
        if hasattr(candidate, 'disability_details') and candidate.disability_details:
            disability_type = candidate.disability_details.get('disability_type') or "N/A"
        elif isinstance(candidate, dict) and 'disability_details' in candidate:
            disability_type = candidate['disability_details'].get('disability_type') or "N/A"
            
        template = jinja_env.get_template("new_candidate_alert.html")
        team_html = template.render(candidate=candidate, disability_type=disability_type)
        await send_email(sourcing_team_email, team_subject, team_html)
        
    except Exception as e:
        logger.error(f"Error in send_registration_emails: {str(e)}")


async def send_dsr_submission_email(user_name: str, report_date: str, items: List[dict]):
    """Sends DSR submission notification to configured recipient"""
    try:
        recipient = settings.TIMESHEET_SUBMISSION_EMAIL
        subject = f"DSR Submitted: {user_name} - {report_date}"
        
        total_hours = sum(item.get('hours', 0) for item in items)
        
        template = jinja_env.get_template("dsr_submission_alert.html")
        html_content = template.render(
            user_name=user_name,
            report_date=report_date,
            items=items,
            total_hours=total_hours
        )
        await send_email(recipient, subject, html_content)
    except Exception as e:
        logger.error(f"Error in send_dsr_submission_email: {str(e)}")


async def send_consent_form_email(candidate_name: str, candidate_email: str, consent_url: str):
    """Sends consent form link to candidate"""
    try:
        subject = "Action Required: Candidate Consent Form - WinVinaya Foundation"
        template = jinja_env.get_template("candidate_consent.html")
        html_content = template.render(
            candidate_name=candidate_name,
            consent_url=consent_url,
            current_year=datetime.now().year
        )
        return await send_email(candidate_email, subject, html_content)
    except Exception as e:
        logger.error(f"Error in send_consent_form_email: {str(e)}")
        return False
