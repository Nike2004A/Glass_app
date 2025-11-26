from belvo.client import Client
from belvo.exceptions import BelvoAPIException
from app.core.config import settings
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class BelvoService:
    """Service for interacting with Belvo API"""

    def __init__(self):
        """Initialize Belvo client"""
        self.client = Client(
            settings.BELVO_SECRET_ID,
            settings.BELVO_SECRET_PASSWORD,
            settings.BELVO_ENVIRONMENT
        )

    def create_link(
        self,
        institution: str,
        username: str,
        password: str,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new Belvo link to connect to a bank

        Args:
            institution: Institution name (e.g., "banorte_mx_retail")
            username: User's bank username
            password: User's bank password
            token: Optional 2FA token

        Returns:
            Link data from Belvo

        Raises:
            BelvoAPIException: If link creation fails
        """
        try:
            link_data = {
                "institution": institution,
                "username": username,
                "password": password,
            }

            if token:
                link_data["token"] = token

            link = self.client.Links.create(**link_data)
            logger.info(f"Created Belvo link: {link['id']}")
            return link

        except BelvoAPIException as e:
            logger.error(f"Failed to create Belvo link: {str(e)}")
            raise

    def get_link(self, link_id: str) -> Dict[str, Any]:
        """
        Get a Belvo link by ID

        Args:
            link_id: Belvo link ID

        Returns:
            Link data from Belvo
        """
        try:
            link = self.client.Links.get(link_id)
            return link
        except BelvoAPIException as e:
            logger.error(f"Failed to get Belvo link {link_id}: {str(e)}")
            raise

    def delete_link(self, link_id: str) -> bool:
        """
        Delete a Belvo link

        Args:
            link_id: Belvo link ID

        Returns:
            True if successful
        """
        try:
            self.client.Links.delete(link_id)
            logger.info(f"Deleted Belvo link: {link_id}")
            return True
        except BelvoAPIException as e:
            logger.error(f"Failed to delete Belvo link {link_id}: {str(e)}")
            raise

    def get_accounts(self, link_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all accounts for a link

        Args:
            link_id: Belvo link ID

        Returns:
            List of account data from Belvo
        """
        try:
            accounts = self.client.Accounts.create(link=link_id)
            logger.info(f"Retrieved {len(accounts)} accounts for link {link_id}")
            return accounts
        except BelvoAPIException as e:
            logger.error(f"Failed to get accounts for link {link_id}: {str(e)}")
            raise

    def get_transactions(
        self,
        link_id: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve transactions for a link

        Args:
            link_id: Belvo link ID
            date_from: Start date in YYYY-MM-DD format (defaults to 90 days ago)
            date_to: End date in YYYY-MM-DD format (defaults to today)

        Returns:
            List of transaction data from Belvo
        """
        try:
            # Set default date range if not provided
            if not date_from:
                date_from = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
            if not date_to:
                date_to = datetime.now().strftime("%Y-%m-%d")

            transactions = self.client.Transactions.create(
                link=link_id,
                date_from=date_from,
                date_to=date_to
            )
            logger.info(f"Retrieved {len(transactions)} transactions for link {link_id}")
            return transactions
        except BelvoAPIException as e:
            logger.error(f"Failed to get transactions for link {link_id}: {str(e)}")
            raise

    def get_balances(self, link_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve account balances for a link

        Args:
            link_id: Belvo link ID

        Returns:
            List of balance data from Belvo
        """
        try:
            balances = self.client.Balances.create(link=link_id)
            logger.info(f"Retrieved balances for link {link_id}")
            return balances
        except BelvoAPIException as e:
            logger.error(f"Failed to get balances for link {link_id}: {str(e)}")
            raise

    def get_owners(self, link_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve account owner information for a link

        Args:
            link_id: Belvo link ID

        Returns:
            List of owner data from Belvo
        """
        try:
            owners = self.client.Owners.create(link=link_id)
            logger.info(f"Retrieved owners for link {link_id}")
            return owners
        except BelvoAPIException as e:
            logger.error(f"Failed to get owners for link {link_id}: {str(e)}")
            raise

    def list_institutions(self, country_code: str = "MX") -> List[Dict[str, Any]]:
        """
        List available institutions for a country

        Args:
            country_code: ISO country code (default: MX)

        Returns:
            List of available institutions
        """
        try:
            institutions = self.client.Institutions.list()
            # Filter by country if needed
            filtered = [inst for inst in institutions if inst.get("country") == country_code]
            logger.info(f"Retrieved {len(filtered)} institutions for {country_code}")
            return filtered
        except BelvoAPIException as e:
            logger.error(f"Failed to list institutions: {str(e)}")
            raise


# Singleton instance
belvo_service = BelvoService()
