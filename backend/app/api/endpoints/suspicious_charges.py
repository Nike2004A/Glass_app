from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.suspicious_charge import SuspiciousCharge
from app.schemas.suspicious_charge import (
    SuspiciousChargeUpdate,
    SuspiciousChargeResponse,
    SuspiciousChargeSummary
)

router = APIRouter()


@router.get("/", response_model=List[SuspiciousChargeResponse])
def list_suspicious_charges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    status_filter: str = None
):
    """
    List all suspicious charges for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        status_filter: Filter by status (pending, confirmed_fraudulent, confirmed_legitimate, dismissed)

    Returns:
        List of suspicious charges
    """
    query = db.query(SuspiciousCharge).filter(SuspiciousCharge.user_id == current_user.id)

    if status_filter:
        query = query.filter(SuspiciousCharge.status == status_filter)

    charges = query.order_by(SuspiciousCharge.charge_date.desc()).all()

    return charges


@router.get("/summary", response_model=SuspiciousChargeSummary)
def get_suspicious_charges_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of suspicious charges

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Suspicious charges summary
    """
    charges = db.query(SuspiciousCharge).filter(
        SuspiciousCharge.user_id == current_user.id
    ).all()

    pending_review = sum(1 for c in charges if c.status == "pending")
    confirmed_fraudulent = sum(1 for c in charges if c.status == "confirmed_fraudulent")
    confirmed_legitimate = sum(1 for c in charges if c.status == "confirmed_legitimate")

    # Calculate total amount at risk (pending charges)
    total_amount_at_risk = sum(
        c.amount for c in charges
        if c.status == "pending" or c.status == "confirmed_fraudulent"
    )

    return SuspiciousChargeSummary(
        total_suspicious=len(charges),
        pending_review=pending_review,
        confirmed_fraudulent=confirmed_fraudulent,
        confirmed_legitimate=confirmed_legitimate,
        total_amount_at_risk=total_amount_at_risk,
        charges=charges
    )


@router.get("/{charge_id}", response_model=SuspiciousChargeResponse)
def get_suspicious_charge(
    charge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific suspicious charge

    Args:
        charge_id: Suspicious charge ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Suspicious charge details

    Raises:
        HTTPException: If charge not found or doesn't belong to user
    """
    charge = db.query(SuspiciousCharge).filter(
        SuspiciousCharge.id == charge_id,
        SuspiciousCharge.user_id == current_user.id
    ).first()

    if not charge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suspicious charge not found"
        )

    return charge


@router.patch("/{charge_id}", response_model=SuspiciousChargeResponse)
def update_suspicious_charge(
    charge_id: int,
    charge_update: SuspiciousChargeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update suspicious charge status

    Args:
        charge_id: Suspicious charge ID
        charge_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated suspicious charge

    Raises:
        HTTPException: If charge not found or doesn't belong to user
    """
    charge = db.query(SuspiciousCharge).filter(
        SuspiciousCharge.id == charge_id,
        SuspiciousCharge.user_id == current_user.id
    ).first()

    if not charge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suspicious charge not found"
        )

    # Update status
    charge.status = charge_update.status

    if charge_update.user_feedback:
        charge.user_feedback = charge_update.user_feedback

    # Mark as resolved if status is not pending
    if charge.status != "pending":
        charge.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(charge)

    return charge
