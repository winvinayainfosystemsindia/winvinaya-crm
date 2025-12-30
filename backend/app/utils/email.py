"""Email Utility for sending professional HTML emails"""

import logging
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional, Any
import aiosmtplib
from app.core.config import settings

logger = logging.getLogger(__name__)

# Base Style for AWS-like professional emails
BASE_STYLE = """
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333333;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
    }
    .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    }
    .header {
        background-color: #232f3e;
        color: #ffffff;
        padding: 20px;
        text-align: center;
    }
    .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
    }
    .content {
        padding: 30px;
    }
    .content h2 {
        color: #232f3e;
        margin-top: 0;
    }
    .details-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    }
    .details-table th, .details-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #eeeeee;
    }
    .details-table th {
        background-color: #f8f8f8;
        width: 35%;
        color: #666666;
    }
    .footer {
        background-color: #f4f4f4;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #888888;
        border-top: 1px solid #e0e0e0;
    }
    .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #ff9900;
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        margin-top: 20px;
    }
"""

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
    # Port 465 usually uses implicit TLS (use_tls=True)
    # Port 587 usually uses explicit TLS (start_tls=True)
    use_tls_strategy = smtp_tls and smtp_port == 465
    start_tls_strategy = smtp_tls and smtp_port != 465

    try:
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
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def get_candidate_template(name: str) -> str:
    """HTML template for candidate confirmation email"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            {BASE_STYLE}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>WinVinaya</h1>
            </div>
            <div class="content">
                <h2>Registration Successful</h2>
                <p>Dear <strong>{name}</strong>,</p>
                <p>Congratulations! Your registration with WinVinaya is successful.</p>
                <p>Our sourcing team will review your profile and connect with you soon regarding the next steps in our process.</p>
                <p>If you have any questions in the meantime, please feel free to reach out to us.</p>
                <p>Best regards,<br>The WinVinaya Team</p>
            </div>
            <div class="footer">
                &copy; 2025 WinVinaya Foundation. All rights reserved.<br>
                This is an automated message, please do not reply.
            </div>
        </div>
    </body>
    </html>
    """


def get_sourcing_team_template(candidate: Any) -> str:
    """HTML template for sourcing team notification email"""
    # Extract disability type safely
    disability_type = "Not specified"
    if hasattr(candidate, 'disability_details') and candidate.disability_details:
        disability_type = candidate.disability_details.get('disability_type', "Not specified")
    elif isinstance(candidate, dict) and 'disability_details' in candidate:
        disability_type = candidate['disability_details'].get('disability_type', "Not specified")

    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            {BASE_STYLE}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header" style="background-color: #0073bb;">
                <h1>New Candidate Registration</h1>
            </div>
            <div class="content">
                <h2>Candidate Details</h2>
                <p>A new candidate has just registered on the WinVinaya CRM portal. Here are the details:</p>
                <table class="details-table">
                    <tr>
                        <th>Name</th>
                        <td>{candidate.name}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>{candidate.email}</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>{candidate.phone}</td>
                    </tr>
                    <tr>
                        <th>Disability Type</th>
                        <td>{disability_type}</td>
                    </tr>
                </table>
                <p>Please review the full profile in the CRM dashboard.</p>
                <a href="https://crm.winvinaya.com/candidates" class="button" style="background-color: #0073bb;">View in CRM</a>
            </div>
            <div class="footer">
                &copy; 2025 WinVinaya Foundation | Internal Notification
            </div>
        </div>
    </body>
    </html>
    """


async def send_registration_emails(candidate: Any):
    """Sends both candidate and sourcing team registration confirmation emails"""
    
    # 1. Send to Candidate
    candidate_subject = "Welcome to WinVinaya - Registration Successful"
    candidate_html = get_candidate_template(candidate.name)
    await send_email(candidate.email, candidate_subject, candidate_html)
    
    # 2. Send to Sourcing Team
    sourcing_team_email = "info@winvinayafoundation.org"
    team_subject = f"New Candidate Registered: {candidate.name}"
    team_html = get_sourcing_team_template(candidate)
    await send_email(sourcing_team_email, team_subject, team_html)
