from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.credit_card import CreditCard
from app.schemas.credit_card import (
    CreditCardCreate,
    CreditCardUpdate,
    CreditCardResponse,
    CreditCardSummary
)

router = APIRouter()


@router.get("/", response_model=List[CreditCardResponse])
def list_credit_cards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    """
    List all credit cards for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        include_inactive: Include inactive cards

    Returns:
        List of credit cards
    """
    query = db.query(CreditCard).filter(CreditCard.user_id == current_user.id)

    if not include_inactive:
        query = query.filter(CreditCard.is_active == True)

    cards = query.order_by(CreditCard.created_at.desc()).all()

    return cards


@router.get("/summary", response_model=CreditCardSummary)
def get_cards_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of all credit cards

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Credit cards summary
    """
    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id
    ).all()

    active_cards = [card for card in cards if card.is_active]

    total_credit_limit = sum(card.credit_limit for card in active_cards)
    total_balance = sum(card.current_balance for card in active_cards)
    total_available_credit = sum(card.available_credit for card in active_cards)
    total_minimum_payment = sum(card.minimum_payment for card in active_cards)

    return CreditCardSummary(
        total_cards=len(cards),
        active_cards=len(active_cards),
        total_credit_limit=total_credit_limit,
        total_balance=total_balance,
        total_available_credit=total_available_credit,
        total_minimum_payment=total_minimum_payment,
        cards=cards
    )


@router.post("/", response_model=CreditCardResponse, status_code=status.HTTP_201_CREATED)
def create_credit_card(
    card_data: CreditCardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new credit card manually

    Args:
        card_data: Credit card data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created credit card
    """
    # Calculate available credit
    available_credit = card_data.credit_limit - card_data.current_balance

    # Create new card
    new_card = CreditCard(
        user_id=current_user.id,
        card_name=card_data.card_name,
        last_four_digits=card_data.last_four_digits,
        institution_name=card_data.institution_name,
        card_type=card_data.card_type,
        credit_limit=card_data.credit_limit,
        current_balance=card_data.current_balance,
        available_credit=available_credit,
        billing_cycle_day=card_data.billing_cycle_day,
        payment_due_day=card_data.payment_due_day,
        annual_interest_rate=card_data.annual_interest_rate,
        is_active=True
    )

    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return new_card


@router.get("/{card_id}", response_model=CreditCardResponse)
def get_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific credit card

    Args:
        card_id: Credit card ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Credit card details

    Raises:
        HTTPException: If card not found or doesn't belong to user
    """
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )

    return card


@router.patch("/{card_id}", response_model=CreditCardResponse)
def update_credit_card(
    card_id: int,
    card_update: CreditCardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a credit card

    Args:
        card_id: Credit card ID
        card_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated credit card

    Raises:
        HTTPException: If card not found or doesn't belong to user
    """
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )

    # Update fields if provided
    if card_update.card_name is not None:
        card.card_name = card_update.card_name

    if card_update.credit_limit is not None:
        card.credit_limit = card_update.credit_limit
        # Recalculate available credit
        card.available_credit = card.credit_limit - card.current_balance

    if card_update.billing_cycle_day is not None:
        card.billing_cycle_day = card_update.billing_cycle_day

    if card_update.payment_due_day is not None:
        card.payment_due_day = card_update.payment_due_day

    if card_update.is_active is not None:
        card.is_active = card_update.is_active

    db.commit()
    db.refresh(card)

    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_credit_card(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a credit card (soft delete)

    Args:
        card_id: Credit card ID
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: If card not found or doesn't belong to user
    """
    card = db.query(CreditCard).filter(
        CreditCard.id == card_id,
        CreditCard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credit card not found"
        )

    # Soft delete
    card.is_active = False
    db.commit()

    return None
