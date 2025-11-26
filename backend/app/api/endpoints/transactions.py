from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.models.bank_account import BankAccount
from app.models.credit_card import CreditCard
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    TransactionAnalytics
)

router = APIRouter()


@router.get("/", response_model=TransactionListResponse)
def list_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    account_id: Optional[int] = None,
    card_id: Optional[int] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """
    List transactions for current user with pagination and filters

    Args:
        current_user: Current authenticated user
        db: Database session
        page: Page number
        page_size: Items per page
        transaction_type: Filter by type (income, expense, transfer)
        category: Filter by category
        account_id: Filter by bank account
        card_id: Filter by credit card
        date_from: Filter from date (YYYY-MM-DD)
        date_to: Filter to date (YYYY-MM-DD)

    Returns:
        Paginated list of transactions
    """
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    # Apply filters
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)

    if category:
        query = query.filter(Transaction.category == category)

    if account_id:
        query = query.filter(Transaction.bank_account_id == account_id)

    if card_id:
        query = query.filter(Transaction.credit_card_id == card_id)

    if date_from:
        query = query.filter(Transaction.transaction_date >= datetime.fromisoformat(date_from))

    if date_to:
        query = query.filter(Transaction.transaction_date <= datetime.fromisoformat(date_to))

    # Get total count
    total = query.count()

    # Paginate
    offset = (page - 1) * page_size
    transactions = query.order_by(Transaction.transaction_date.desc()).offset(offset).limit(page_size).all()

    return TransactionListResponse(
        total=total,
        page=page,
        page_size=page_size,
        transactions=transactions
    )


@router.get("/analytics", response_model=TransactionAnalytics)
def get_transaction_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    days: int = Query(30, ge=1, le=365)
):
    """
    Get transaction analytics for the specified period

    Args:
        current_user: Current authenticated user
        db: Database session
        days: Number of days to analyze

    Returns:
        Transaction analytics
    """
    date_from = datetime.now() - timedelta(days=days)

    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.transaction_date >= date_from
    ).all()

    # Calculate totals
    total_income = sum(t.amount for t in transactions if t.transaction_type == "income")
    total_expenses = sum(abs(t.amount) for t in transactions if t.transaction_type == "expense")
    net_flow = total_income - total_expenses

    # Top categories
    category_totals = defaultdict(float)
    for t in transactions:
        if t.category and t.transaction_type == "expense":
            category_totals[t.category] += abs(t.amount)

    top_categories = dict(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:10])

    # Top merchants
    merchant_totals = defaultdict(float)
    for t in transactions:
        if t.merchant_name and t.transaction_type == "expense":
            merchant_totals[t.merchant_name] += abs(t.amount)

    top_merchants = dict(sorted(merchant_totals.items(), key=lambda x: x[1], reverse=True)[:10])

    # Monthly summary
    monthly_summary = defaultdict(lambda: {"income": 0.0, "expenses": 0.0, "net": 0.0})
    for t in transactions:
        month_key = t.transaction_date.strftime("%Y-%m")
        if t.transaction_type == "income":
            monthly_summary[month_key]["income"] += t.amount
        elif t.transaction_type == "expense":
            monthly_summary[month_key]["expenses"] += abs(t.amount)

    # Calculate net for each month
    for month in monthly_summary:
        monthly_summary[month]["net"] = monthly_summary[month]["income"] - monthly_summary[month]["expenses"]

    return TransactionAnalytics(
        total_income=total_income,
        total_expenses=total_expenses,
        net_flow=net_flow,
        top_categories=top_categories,
        top_merchants=top_merchants,
        monthly_summary=dict(monthly_summary)
    )


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new transaction manually

    Args:
        transaction_data: Transaction data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created transaction
    """
    # Validate account/card ownership
    if transaction_data.bank_account_id:
        account = db.query(BankAccount).filter(
            BankAccount.id == transaction_data.bank_account_id,
            BankAccount.user_id == current_user.id
        ).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bank account not found"
            )

    if transaction_data.credit_card_id:
        card = db.query(CreditCard).filter(
            CreditCard.id == transaction_data.credit_card_id,
            CreditCard.user_id == current_user.id
        ).first()
        if not card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit card not found"
            )

    # Create transaction
    new_transaction = Transaction(
        user_id=current_user.id,
        bank_account_id=transaction_data.bank_account_id,
        credit_card_id=transaction_data.credit_card_id,
        description=transaction_data.description,
        merchant_name=transaction_data.merchant_name,
        category=transaction_data.category,
        amount=transaction_data.amount,
        currency=transaction_data.currency,
        transaction_type=transaction_data.transaction_type,
        transaction_date=transaction_data.transaction_date,
        status="completed"
    )

    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)

    return new_transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific transaction

    Args:
        transaction_id: Transaction ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Transaction details

    Raises:
        HTTPException: If transaction not found or doesn't belong to user
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    return transaction


@router.patch("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a transaction

    Args:
        transaction_id: Transaction ID
        transaction_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated transaction

    Raises:
        HTTPException: If transaction not found or doesn't belong to user
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Update fields if provided
    if transaction_update.category is not None:
        transaction.category = transaction_update.category

    if transaction_update.notes is not None:
        transaction.notes = transaction_update.notes

    db.commit()
    db.refresh(transaction)

    return transaction
