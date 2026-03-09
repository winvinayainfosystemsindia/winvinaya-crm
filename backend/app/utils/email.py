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
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #16191f;
        margin: 0;
        padding: 0;
        background-color: #f2f3f3;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
    }
    .header {
        background-color: #232f3e;
        color: #ffffff;
        padding: 24px 40px;
        text-align: left;
    }
    .header h1 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }
    .content {
        padding: 40px;
    }
    .content h2 {
        color: #16191f;
        margin-top: 0;
        font-size: 24px;
        font-weight: 600;
    }
    .summary-box {
        background-color: #f8f9fa;
        border-left: 4px solid #ff9900;
        padding: 20px;
        margin: 25px 0;
    }
    .details-table {
        width: 100%;
        border-collapse: collapse;
        margin: 25px 0;
    }
    .details-table th, .details-table td {
        padding: 14px 10px;
        text-align: left;
        border-bottom: 1px solid #eaeded;
    }
    .details-table th {
        color: #545b64;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
        width: 35%;
    }
    .details-table td {
        font-weight: 500;
        color: #16191f;
    }
    .footer {
        background-color: #fafafa;
        padding: 24px 40px;
        text-align: center;
        font-size: 13px;
        color: #545b64;
        border-top: 1px solid #eaeded;
    }
    .button-container {
        text-align: center;
        margin: 35px 0 10px 0;
    }
    .button {
        display: inline-block;
        padding: 12px 32px;
        background-color: #ff9900;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 2px;
        font-weight: 700;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .dsr-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
    }
    .dsr-table th {
        background-color: #f8f9fa;
        color: #545b64;
        font-weight: 700;
        text-align: left;
        padding: 12px;
        border: 1px solid #eaeded;
    }
    .dsr-table td {
        padding: 12px;
        border: 1px solid #eaeded;
        vertical-align: top;
    }
    .dsr-table tr:nth-child(even) {
        background-color: #fafafa;
    }
    .status-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }
    .status-submitted {
        background-color: #fef7e0;
        color: #b06000;
        border: 1px solid #fbbc04;
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
                &copy; 2025 WinVinaya. All rights reserved.<br>
                This is an automated message, please do not reply.
            </div>
        </div>
    </body>
    </html>
    """


def get_sourcing_team_template(candidate: Any) -> str:
    """HTML template for sourcing team notification email"""
    # Extract disability type safely
    disability_type = "N/A"
    if hasattr(candidate, 'disability_details') and candidate.disability_details:
        disability_type = candidate.disability_details.get('disability_type') or "N/A"
    elif isinstance(candidate, dict) and 'disability_details' in candidate:
        disability_type = candidate['disability_details'].get('disability_type') or "N/A"

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
                <h1>NEW CANDIDATE ALERT</h1>
            </div>
            <div class="content">
                <h2>Registration Details</h2>
                <p>A new candidate has successfully registered on the WinVinaya CRM portal.</p>
                
                <div class="summary-box">
                    <strong>Action Required:</strong> Please review the candidacy and initiate the screening/counseling workflow.
                </div>

                <table class="details-table">
                    <tr>
                        <th>Candidate Name</th>
                        <td>{candidate.name}</td>
                    </tr>
                    <tr>
                        <th>Email Address</th>
                        <td>{candidate.email}</td>
                    </tr>
                    <tr>
                        <th>Phone Number</th>
                        <td>{candidate.phone}</td>
                    </tr>
                    <tr>
                        <th>Disability Status</th>
                        <td>{disability_type}</td>
                    </tr>
                </table>
                
                <div class="button-container">
                    <a href="https://crm.winvinaya.com/candidates" class="button">View CRM Dashboard</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2025 WinVinaya | Internal Sourcing Notification
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
    sourcing_team_email = "sourcing@winvinayafoundation.org"
    team_subject = f"New Candidate Registered: {candidate.name}"
    team_html = get_sourcing_team_template(candidate)
    await send_email(sourcing_team_email, team_subject, team_html)


def get_dsr_submission_template(user_name: str, report_date: str, items: List[dict]) -> str:
    """HTML template for DSR submission notification"""
    rows = ""
    for item in items:
        rows += f"""
        <tr>
            <td>{item.get('project_name', 'N/A')}</td>
            <td>{item.get('activity_name', 'N/A')}</td>
            <td>{item.get('description', 'N/A')}</td>
            <td style="text-align: center;">{item.get('hours', 0)}</td>
        </tr>
        """

    total_hours = sum(item.get('hours', 0) for item in items)

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
                <h1>DSR SUBMISSION ALERT</h1>
            </div>
            <div class="content">
                <h2>New DSR Submitted</h2>
                <p>A new Daily Status Report has been submitted on the WinVinaya portal.</p>
                
                <table class="details-table">
                    <tr>
                        <th>Submitted By</th>
                        <td>{user_name}</td>
                    </tr>
                    <tr>
                        <th>Report Date</th>
                        <td>{report_date}</td>
                    </tr>
                    <tr>
                        <th>Total Hours</th>
                        <td><strong>{total_hours} hrs</strong></td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td><span class="status-badge status-submitted">SUBMITTED</span></td>
                    </tr>
                </table>

                <h3>Work Details</h3>
                <table class="dsr-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Activity</th>
                            <th>Description</th>
                            <th>Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
                
                <div class="button-container">
                    <a href="https://crm.winvinaya.com/projects/dsr/admin" class="button">Review Submission</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2025 WinVinaya | DSR Notification System
            </div>
        </div>
    </body>
    </html>
    """


async def send_dsr_submission_email(user_name: str, report_date: str, items: List[dict]):
    """Sends DSR submission notification to info@winvinaya.com"""
    recipient = "dharanidaran.a@winvinaya.com"
    subject = f"DSR Submitted: {user_name} - {report_date}"
    html_content = get_dsr_submission_template(user_name, report_date, items)
    await send_email(recipient, subject, html_content)
