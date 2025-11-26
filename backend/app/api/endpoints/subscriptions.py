from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.subscription import Subscription
from app.schemas.subscription import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SubscriptionSummary
)

router = APIRouter()


@router.get("/", response_model=List[SubscriptionResponse])
def list_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    include_inactive: bool = False
):
    """
    List all subscriptions for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        include_inactive: Include inactive subscriptions

    Returns:
        List of subscriptions
    """
    query = db.query(Subscription).filter(Subscription.user_id == current_user.id)

    if not include_inactive:
        query = query.filter(Subscription.is_active == True)

    subscriptions = query.order_by(Subscription.next_charge_date.asc()).all()

    return subscriptions


@router.get("/summary", response_model=SubscriptionSummary)
def get_subscriptions_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of all subscriptions

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Subscriptions summary
    """
    subscriptions = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).all()

    active_subscriptions = [sub for sub in subscriptions if sub.is_active]

    # Calculate monthly and yearly costs
    monthly_cost = 0.0
    yearly_cost = 0.0

    for sub in active_subscriptions:
        if sub.billing_frequency == "monthly":
            monthly_cost += sub.amount
            yearly_cost += sub.amount * 12
        elif sub.billing_frequency == "yearly":
            yearly_cost += sub.amount
            monthly_cost += sub.amount / 12
        elif sub.billing_frequency == "weekly":
            weekly_cost = sub.amount
            monthly_cost += weekly_cost * 4.33  # Average weeks per month
            yearly_cost += weekly_cost * 52

    # Get upcoming charges (next 30 days)
    today = datetime.now().date()
    next_30_days = today + timedelta(days=30)

    upcoming_charges = []
    for sub in active_subscriptions:
        if sub.next_charge_date and today <= sub.next_charge_date <= next_30_days:
            upcoming_charges.append({
                "subscription_id": sub.id,
                "service_name": sub.service_name,
                "amount": sub.amount,
                "currency": sub.currency,
                "charge_date": sub.next_charge_date.isoformat()
            })

    # Sort by date
    upcoming_charges.sort(key=lambda x: x["charge_date"])

    return SubscriptionSummary(
        total_subscriptions=len(subscriptions),
        active_subscriptions=len(active_subscriptions),
        monthly_cost=round(monthly_cost, 2),
        yearly_cost=round(yearly_cost, 2),
        subscriptions=subscriptions,
        upcoming_charges=upcoming_charges
    )


@router.post("/", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new subscription manually

    Args:
        subscription_data: Subscription data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created subscription
    """
    # Calculate next charge date based on frequency
    next_charge_date = subscription_data.first_charge_date

    if subscription_data.billing_frequency == "monthly":
        next_charge_date = subscription_data.first_charge_date + relativedelta(months=1)
    elif subscription_data.billing_frequency == "yearly":
        next_charge_date = subscription_data.first_charge_date + relativedelta(years=1)
    elif subscription_data.billing_frequency == "weekly":
        next_charge_date = subscription_data.first_charge_date + timedelta(weeks=1)

    # Create subscription
    new_subscription = Subscription(
        user_id=current_user.id,
        service_name=subscription_data.service_name,
        merchant_name=subscription_data.merchant_name,
        category=subscription_data.category,
        amount=subscription_data.amount,
        currency=subscription_data.currency,
        billing_frequency=subscription_data.billing_frequency,
        billing_day=subscription_data.billing_day,
        first_charge_date=subscription_data.first_charge_date,
        next_charge_date=next_charge_date,
        is_active=True,
        auto_detected=False,
        user_confirmed=True,
        alert_before_charge=subscription_data.alert_before_charge,
        alert_days_before=subscription_data.alert_days_before
    )

    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)

    return new_subscription


@router.get("/{subscription_id}", response_model=SubscriptionResponse)
def get_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific subscription

    Args:
        subscription_id: Subscription ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Subscription details

    Raises:
        HTTPException: If subscription not found or doesn't belong to user
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    return subscription


@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
def update_subscription(
    subscription_id: int,
    subscription_update: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a subscription

    Args:
        subscription_id: Subscription ID
        subscription_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated subscription

    Raises:
        HTTPException: If subscription not found or doesn't belong to user
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Update fields if provided
    if subscription_update.service_name is not None:
        subscription.service_name = subscription_update.service_name

    if subscription_update.amount is not None:
        subscription.amount = subscription_update.amount

    if subscription_update.billing_frequency is not None:
        subscription.billing_frequency = subscription_update.billing_frequency

    if subscription_update.billing_day is not None:
        subscription.billing_day = subscription_update.billing_day

    if subscription_update.category is not None:
        subscription.category = subscription_update.category

    if subscription_update.is_active is not None:
        subscription.is_active = subscription_update.is_active

    if subscription_update.alert_before_charge is not None:
        subscription.alert_before_charge = subscription_update.alert_before_charge

    if subscription_update.alert_days_before is not None:
        subscription.alert_days_before = subscription_update.alert_days_before

    db.commit()
    db.refresh(subscription)

    return subscription


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription(
    subscription_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a subscription (soft delete)

    Args:
        subscription_id: Subscription ID
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: If subscription not found or doesn't belong to user
    """
    subscription = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subscription not found"
        )

    # Soft delete
    subscription.is_active = False
    db.commit()

    return None
