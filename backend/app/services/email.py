import logging
from typing import List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via Brevo (formerly Sendinblue)"""

    def __init__(self):
        self.api_key = settings.BREVO_API_KEY
        self.api_url = "https://api.brevo.com/v3/smtp/email"
        self.from_email = settings.BREVO_FROM_EMAIL
        self.from_name = settings.BREVO_FROM_NAME

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        to_name: Optional[str] = None
    ) -> bool:
        """
        Send an email via Brevo API

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            to_name: Optional recipient name

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not self.api_key:
            logger.warning("Brevo API key not configured, email not sent")
            return False

        headers = {
            "accept": "application/json",
            "api-key": self.api_key,
            "content-type": "application/json"
        }

        payload = {
            "sender": {
                "name": self.from_name,
                "email": self.from_email
            },
            "to": [
                {
                    "email": to_email,
                    "name": to_name or to_email
                }
            ],
            "subject": subject,
            "htmlContent": html_content
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )

                if response.status_code == 201:
                    logger.info(f"Email sent successfully to {to_email}")
                    return True
                else:
                    logger.error(f"Failed to send email: {response.status_code} - {response.text}")
                    return False

        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Send welcome email to new user"""
        subject = f"¡Bienvenido a {settings.APP_NAME}!"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #005792;">¡Hola {user_name}!</h1>
                <p>Bienvenido a Glass Finance, tu secretaria financiera personal.</p>
                <p>Estamos encantados de que te unas a nosotros. Con Glass Finance podrás:</p>
                <ul>
                    <li>Conectar tus cuentas bancarias de forma segura</li>
                    <li>Rastrear tus transacciones automáticamente</li>
                    <li>Detectar cargos sospechosos</li>
                    <li>Gestionar tus suscripciones</li>
                    <li>Automatizar pagos y ahorros</li>
                </ul>
                <p style="margin-top: 30px;">
                    <a href="https://glassfinance.com"
                       style="background-color: #005792; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Comenzar Ahora
                    </a>
                </p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    Si no creaste esta cuenta, por favor ignora este email.
                </p>
            </div>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, user_name)

    async def send_alert_email(
        self,
        to_email: str,
        user_name: str,
        alert_title: str,
        alert_message: str,
        alert_type: str = "info"
    ) -> bool:
        """Send alert notification email"""
        subject = f"Alerta: {alert_title}"

        # Color based on alert type
        colors = {
            "critical": "#dc3545",
            "high": "#fd7e14",
            "medium": "#ffc107",
            "low": "#0dcaf0",
            "info": "#005792"
        }
        color = colors.get(alert_type, "#005792")

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: {color}; color: white; padding: 15px; border-radius: 5px;">
                    <h2 style="margin: 0;">⚠️ {alert_title}</h2>
                </div>
                <div style="padding: 20px; background-color: #f8f9fa; margin-top: 20px; border-radius: 5px;">
                    <p>Hola {user_name},</p>
                    <p>{alert_message}</p>
                </div>
                <p style="margin-top: 30px;">
                    <a href="https://glassfinance.com/alerts"
                       style="background-color: #005792; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Ver Detalles
                    </a>
                </p>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    Este es un email automático de Glass Finance.
                </p>
            </div>
        </body>
        </html>
        """
        return await self.send_email(to_email, subject, html_content, user_name)


# Singleton instance
email_service = EmailService()
