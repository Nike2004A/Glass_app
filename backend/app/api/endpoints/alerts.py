from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import (
    AlertCreate,
    AlertUpdate,
    AlertResponse,
    AlertSummary
)

router = APIRouter()


@router.get("/", response_model=List[AlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    unread_only: bool = False,
    category: str = None
):
    """
    List all alerts for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        unread_only: Show only unread alerts
        category: Filter by category (security, payment, budget, account)

    Returns:
        List of alerts
    """
    query = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_dismissed == False
    )

    if unread_only:
        query = query.filter(Alert.is_read == False)

    if category:
        query = query.filter(Alert.category == category)

    alerts = query.order_by(Alert.created_at.desc()).all()

    return alerts


@router.get("/summary", response_model=AlertSummary)
def get_alerts_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of alerts

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Alerts summary
    """
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_dismissed == False
    ).all()

    unread_alerts = sum(1 for a in alerts if not a.is_read)
    critical_alerts = sum(1 for a in alerts if a.priority == "critical")
    requires_action = sum(1 for a in alerts if a.requires_action and not a.action_taken)

    return AlertSummary(
        total_alerts=len(alerts),
        unread_alerts=unread_alerts,
        critical_alerts=critical_alerts,
        requires_action=requires_action,
        alerts=alerts
    )


@router.post("/", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_data: AlertCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new alert

    Args:
        alert_data: Alert data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created alert
    """
    new_alert = Alert(
        user_id=current_user.id,
        alert_type=alert_data.alert_type,
        title=alert_data.title,
        message=alert_data.message,
        priority=alert_data.priority,
        category=alert_data.category,
        related_transaction_id=alert_data.related_transaction_id,
        related_subscription_id=alert_data.related_subscription_id,
        related_account_id=alert_data.related_account_id,
        requires_action=alert_data.requires_action,
        action_url=alert_data.action_url,
        is_read=False,
        is_dismissed=False
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific alert

    Args:
        alert_id: Alert ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Alert details

    Raises:
        HTTPException: If alert not found or doesn't belong to user
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    return alert


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an alert

    Args:
        alert_id: Alert ID
        alert_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated alert

    Raises:
        HTTPException: If alert not found or doesn't belong to user
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    # Update fields if provided
    if alert_update.is_read is not None:
        alert.is_read = alert_update.is_read
        if alert.is_read and not alert.read_at:
            alert.read_at = datetime.utcnow()

    if alert_update.is_dismissed is not None:
        alert.is_dismissed = alert_update.is_dismissed
        if alert.is_dismissed and not alert.dismissed_at:
            alert.dismissed_at = datetime.utcnow()

    if alert_update.action_taken is not None:
        alert.action_taken = alert_update.action_taken
        if alert.action_taken and not alert.action_taken_at:
            alert.action_taken_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return alert


@router.post("/mark-all-read", response_model=dict)
def mark_all_alerts_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all alerts as read

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Number of alerts marked as read
    """
    unread_alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False,
        Alert.is_dismissed == False
    ).all()

    count = 0
    now = datetime.utcnow()
    for alert in unread_alerts:
        alert.is_read = True
        alert.read_at = now
        count += 1

    db.commit()

    return {"marked_read": count}


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an alert (soft delete by dismissing)

    Args:
        alert_id: Alert ID
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: If alert not found or doesn't belong to user
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )

    # Soft delete
    alert.is_dismissed = True
    alert.dismissed_at = datetime.utcnow()
    db.commit()

    return None
