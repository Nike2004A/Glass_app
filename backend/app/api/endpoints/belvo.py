from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.bank_account import BankAccount
from app.models.transaction import Transaction
from app.schemas.belvo import (
    BelvoLinkCreate,
    BelvoLinkResponse,
    BelvoAccountSync,
    BelvoTransactionSync,
    BelvoSyncResponse
)
from app.services.belvo import belvo_service
from belvo.exceptions import BelvoAPIException

router = APIRouter()


@router.get("/institutions")
def list_institutions(country_code: str = "MX"):
    """
    List available banking institutions

    Args:
        country_code: ISO country code (default: MX)

    Returns:
        List of available institutions
    """
    try:
        institutions = belvo_service.list_institutions(country_code)
        return {"institutions": institutions}
    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve institutions: {str(e)}"
        )


@router.post("/link", response_model=BelvoLinkResponse)
def create_belvo_link(
    link_data: BelvoLinkCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Belvo link to connect to a bank

    Args:
        link_data: Link creation data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created link information
    """
    try:
        # Create link in Belvo
        link = belvo_service.create_link(
            institution=link_data.institution,
            username=link_data.username,
            password=link_data.password,
            token=link_data.token
        )

        # Store link ID in user record
        current_user.belvo_link_id = link["id"]
        db.commit()

        return BelvoLinkResponse(
            link_id=link["id"],
            institution=link["institution"],
            status=link.get("status", "active"),
            created_at=link["created_at"],
            last_accessed_at=link.get("last_accessed_at")
        )

    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create Belvo link: {str(e)}"
        )


@router.get("/link")
def get_belvo_link(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's Belvo link information

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Link information
    """
    if not current_user.belvo_link_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Belvo link found for this user"
        )

    try:
        link = belvo_service.get_link(current_user.belvo_link_id)

        return BelvoLinkResponse(
            link_id=link["id"],
            institution=link["institution"],
            status=link.get("status", "active"),
            created_at=link["created_at"],
            last_accessed_at=link.get("last_accessed_at")
        )

    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve Belvo link: {str(e)}"
        )


@router.delete("/link", status_code=status.HTTP_204_NO_CONTENT)
def delete_belvo_link(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user's Belvo link

    Args:
        current_user: Current authenticated user
        db: Database session
    """
    if not current_user.belvo_link_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Belvo link found for this user"
        )

    try:
        belvo_service.delete_link(current_user.belvo_link_id)
        current_user.belvo_link_id = None
        db.commit()

        return None

    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Belvo link: {str(e)}"
        )


@router.post("/sync/accounts", response_model=BelvoSyncResponse)
def sync_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync bank accounts from Belvo

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Sync result
    """
    if not current_user.belvo_link_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Belvo link found. Please connect your bank first."
        )

    try:
        # Get accounts from Belvo
        accounts = belvo_service.get_accounts(current_user.belvo_link_id)

        synced_count = 0
        errors = []

        for belvo_account in accounts:
            try:
                # Check if account already exists
                existing_account = db.query(BankAccount).filter(
                    BankAccount.belvo_account_id == belvo_account["id"]
                ).first()

                if existing_account:
                    # Update existing account
                    existing_account.current_balance = float(belvo_account.get("balance", {}).get("current", 0))
                    existing_account.available_balance = float(belvo_account.get("balance", {}).get("available", 0))
                    existing_account.last_synced_at = datetime.utcnow()
                else:
                    # Create new account
                    new_account = BankAccount(
                        user_id=current_user.id,
                        belvo_account_id=belvo_account["id"],
                        account_name=belvo_account.get("name", "Bank Account"),
                        account_number=belvo_account.get("number", "")[-4:] if belvo_account.get("number") else None,
                        account_type=belvo_account.get("type", "checking"),
                        institution_name=belvo_account.get("institution", {}).get("name", "Unknown"),
                        currency=belvo_account.get("currency", "MXN"),
                        current_balance=float(belvo_account.get("balance", {}).get("current", 0)),
                        available_balance=float(belvo_account.get("balance", {}).get("available", 0)),
                        is_active=True,
                        is_primary=False,
                        last_synced_at=datetime.utcnow()
                    )
                    db.add(new_account)

                synced_count += 1

            except Exception as e:
                errors.append(f"Failed to sync account {belvo_account.get('id')}: {str(e)}")

        db.commit()

        return BelvoSyncResponse(
            success=True,
            message=f"Successfully synced {synced_count} accounts",
            accounts_synced=synced_count,
            errors=errors
        )

    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync accounts: {str(e)}"
        )


@router.post("/sync/transactions", response_model=BelvoSyncResponse)
def sync_transactions(
    sync_data: BelvoTransactionSync,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync transactions from Belvo

    Args:
        sync_data: Sync configuration
        current_user: Current authenticated user
        db: Database session

    Returns:
        Sync result
    """
    if not current_user.belvo_link_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Belvo link found. Please connect your bank first."
        )

    try:
        # Get transactions from Belvo
        transactions = belvo_service.get_transactions(
            link_id=current_user.belvo_link_id,
            date_from=sync_data.date_from,
            date_to=sync_data.date_to
        )

        synced_count = 0
        errors = []

        for belvo_transaction in transactions:
            try:
                # Check if transaction already exists
                existing_transaction = db.query(Transaction).filter(
                    Transaction.belvo_transaction_id == belvo_transaction["id"]
                ).first()

                if existing_transaction:
                    continue  # Skip existing transactions

                # Find corresponding bank account
                account = db.query(BankAccount).filter(
                    BankAccount.belvo_account_id == belvo_transaction.get("account", {}).get("id")
                ).first()

                if not account:
                    errors.append(f"Account not found for transaction {belvo_transaction.get('id')}")
                    continue

                # Determine transaction type
                amount = float(belvo_transaction.get("amount", 0))
                transaction_type = "income" if amount > 0 else "expense"

                # Create new transaction
                new_transaction = Transaction(
                    user_id=current_user.id,
                    bank_account_id=account.id,
                    belvo_transaction_id=belvo_transaction["id"],
                    description=belvo_transaction.get("description", "Transaction"),
                    merchant_name=belvo_transaction.get("merchant", {}).get("name"),
                    category=belvo_transaction.get("category"),
                    amount=abs(amount),
                    currency=belvo_transaction.get("currency", "MXN"),
                    transaction_type=transaction_type,
                    reference=belvo_transaction.get("reference"),
                    transaction_date=datetime.fromisoformat(belvo_transaction["value_date"].replace("Z", "+00:00")),
                    value_date=datetime.fromisoformat(belvo_transaction["value_date"].replace("Z", "+00:00")),
                    status="completed"
                )

                db.add(new_transaction)
                synced_count += 1

            except Exception as e:
                errors.append(f"Failed to sync transaction {belvo_transaction.get('id')}: {str(e)}")

        db.commit()

        return BelvoSyncResponse(
            success=True,
            message=f"Successfully synced {synced_count} transactions",
            transactions_synced=synced_count,
            errors=errors
        )

    except BelvoAPIException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync transactions: {str(e)}"
        )


@router.post("/sync/all", response_model=dict)
def sync_all_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync both accounts and transactions from Belvo

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Combined sync results
    """
    if not current_user.belvo_link_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Belvo link found. Please connect your bank first."
        )

    # Sync accounts first
    accounts_result = sync_accounts(current_user=current_user, db=db)

    # Then sync transactions
    transactions_result = sync_transactions(
        sync_data=BelvoTransactionSync(link_id=current_user.belvo_link_id),
        current_user=current_user,
        db=db
    )

    return {
        "success": True,
        "message": "Sync completed",
        "accounts": accounts_result.dict(),
        "transactions": transactions_result.dict()
    }
