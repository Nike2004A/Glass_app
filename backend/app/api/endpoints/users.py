from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.bank_account import BankAccount
from app.models.credit_card import CreditCard
from app.models.subscription import Subscription
from app.models.alert import Alert
from app.schemas.user import UserResponse, UserUpdate, UserProfile

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information

    Args:
        current_user: Current authenticated user

    Returns:
        User information
    """
    return current_user


@router.get("/me/profile", response_model=UserProfile)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile with statistics

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        User profile with statistics
    """
    # Get statistics
    total_accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id,
        BankAccount.is_active == True
    ).count()

    total_credit_cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True
    ).count()

    # Calculate total balance
    accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id,
        BankAccount.is_active == True
    ).all()
    total_balance = sum(account.current_balance for account in accounts)

    # Calculate total credit limit
    cards = db.query(CreditCard).filter(
        CreditCard.user_id == current_user.id,
        CreditCard.is_active == True
    ).all()
    total_credit_limit = sum(card.credit_limit for card in cards)

    # Count active subscriptions
    active_subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_active == True
    ).count()

    # Count pending alerts
    pending_alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False,
        Alert.is_dismissed == False
    ).count()

    # Build profile response
    profile = UserProfile(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        belvo_link_id=current_user.belvo_link_id,
        push_notifications=current_user.push_notifications,
        email_notifications=current_user.email_notifications,
        sms_notifications=current_user.sms_notifications,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        total_accounts=total_accounts,
        total_credit_cards=total_credit_cards,
        total_balance=total_balance,
        total_credit_limit=total_credit_limit,
        active_subscriptions=active_subscriptions,
        pending_alerts=pending_alerts
    )

    return profile


@router.patch("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information

    Args:
        user_update: User update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user information
    """
    # Update fields if provided
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user.email = user_update.email

    if user_update.push_notifications is not None:
        current_user.push_notifications = user_update.push_notifications

    if user_update.email_notifications is not None:
        current_user.email_notifications = user_update.email_notifications

    if user_update.sms_notifications is not None:
        current_user.sms_notifications = user_update.sms_notifications

    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete current user account (soft delete)

    Args:
        current_user: Current authenticated user
        db: Database session
    """
    # Soft delete: just deactivate the user
    current_user.is_active = False
    db.commit()

    return None
