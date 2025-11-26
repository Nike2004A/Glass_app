from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.bank_account import BankAccount
from app.schemas.bank_account import (
    BankAccountCreate,
    BankAccountUpdate,
    BankAccountResponse,
    BankAccountSummary
)

router = APIRouter()


@router.get("/", response_model=List[BankAccountResponse])
def list_bank_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    """
    List all bank accounts for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        include_inactive: Include inactive accounts

    Returns:
        List of bank accounts
    """
    query = db.query(BankAccount).filter(BankAccount.user_id == current_user.id)

    if not include_inactive:
        query = query.filter(BankAccount.is_active == True)

    accounts = query.order_by(BankAccount.is_primary.desc(), BankAccount.created_at.desc()).all()

    return accounts


@router.get("/summary", response_model=BankAccountSummary)
def get_accounts_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of all bank accounts

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Bank accounts summary
    """
    accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id
    ).all()

    active_accounts = [acc for acc in accounts if acc.is_active]

    total_balance = sum(acc.current_balance for acc in active_accounts)
    total_available = sum(acc.available_balance for acc in active_accounts)

    return BankAccountSummary(
        total_accounts=len(accounts),
        active_accounts=len(active_accounts),
        total_balance=total_balance,
        total_available=total_available,
        accounts=accounts
    )


@router.post("/", response_model=BankAccountResponse, status_code=status.HTTP_201_CREATED)
def create_bank_account(
    account_data: BankAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new bank account manually

    Args:
        account_data: Bank account data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created bank account
    """
    # Create new account
    new_account = BankAccount(
        user_id=current_user.id,
        account_name=account_data.account_name,
        account_number=account_data.account_number,
        account_type=account_data.account_type,
        institution_name=account_data.institution_name,
        currency=account_data.currency,
        current_balance=account_data.current_balance,
        available_balance=account_data.available_balance,
        is_active=True,
        is_primary=False
    )

    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    return new_account


@router.get("/{account_id}", response_model=BankAccountResponse)
def get_bank_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific bank account

    Args:
        account_id: Bank account ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Bank account details

    Raises:
        HTTPException: If account not found or doesn't belong to user
    """
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )

    return account


@router.patch("/{account_id}", response_model=BankAccountResponse)
def update_bank_account(
    account_id: int,
    account_update: BankAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a bank account

    Args:
        account_id: Bank account ID
        account_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated bank account

    Raises:
        HTTPException: If account not found or doesn't belong to user
    """
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )

    # Update fields if provided
    if account_update.account_name is not None:
        account.account_name = account_update.account_name

    if account_update.is_active is not None:
        account.is_active = account_update.is_active

    if account_update.is_primary is not None:
        # If setting as primary, unset other primary accounts
        if account_update.is_primary:
            db.query(BankAccount).filter(
                BankAccount.user_id == current_user.id,
                BankAccount.id != account_id
            ).update({"is_primary": False})
        account.is_primary = account_update.is_primary

    db.commit()
    db.refresh(account)

    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bank_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a bank account (soft delete)

    Args:
        account_id: Bank account ID
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: If account not found or doesn't belong to user
    """
    account = db.query(BankAccount).filter(
        BankAccount.id == account_id,
        BankAccount.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bank account not found"
        )

    # Soft delete
    account.is_active = False
    db.commit()

    return None
