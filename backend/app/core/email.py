"""Outbound email, sent through Gmail's SMTP relay.

Deliberately uses Python's built-in smtplib rather than a third-party email
API: Gmail's free SMTP relay (500 emails/day on a personal account) needs no
domain purchase or verification, unlike services such as Resend or
SendGrid, which require a verified sending domain before they'll deliver to
arbitrary recipients. That makes this the practical choice for a small
platform's password-reset volume.

Requires GMAIL_ADDRESS and GMAIL_APP_PASSWORD to be set (see .env.example).
GMAIL_APP_PASSWORD is a 16-character App Password generated from a Google
account with 2-Step Verification enabled — NOT the account's normal
password.
"""

from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import get_settings

settings = get_settings()


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Send a password reset email. Raises if GMAIL_ADDRESS/GMAIL_APP_PASSWORD aren't configured."""
    if not settings.gmail_address or not settings.gmail_app_password:
        raise RuntimeError(
            "Email isn't configured: set GMAIL_ADDRESS and GMAIL_APP_PASSWORD to enable password reset emails."
        )

    message = MIMEMultipart("alternative")
    message["Subject"] = "Reset your NullArchive password"
    message["From"] = settings.gmail_address
    message["To"] = to_email

    text_body = (
        "Someone requested a password reset for your NullArchive account.\n\n"
        f"Reset it here (link expires in 30 minutes): {reset_link}\n\n"
        "If you didn't request this, you can safely ignore this email."
    )
    html_body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1B3A6B;">Reset your password</h2>
      <p>Someone requested a password reset for your NullArchive account.</p>
      <p>
        <a href="{reset_link}" style="background:#1B3A6B; color:white; padding:10px 20px;
           text-decoration:none; border-radius:3px; display:inline-block;">
          Reset password
        </a>
      </p>
      <p style="color:#666; font-size:13px;">This link expires in 30 minutes.
      If you didn't request this, you can safely ignore this email.</p>
    </div>
    """

    message.attach(MIMEText(text_body, "plain"))
    message.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(settings.gmail_address, settings.gmail_app_password)
        server.sendmail(settings.gmail_address, to_email, message.as_string())
