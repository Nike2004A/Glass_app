from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SuspiciousChargeBase(BaseModel):
    """Base schema for SuspiciousCharge"""
    merchant_name: str
    amount: float
    suspicion_type: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    reason: str


class SuspiciousChargeCreate(SuspiciousChargeBase):
    """Schema for creating a suspicious charge"""
    transaction_id: Optional[int] = None
    charge_date: datetime
    currency: str = "MXN"


class SuspiciousChargeUpdate(BaseModel):
    """Schema for updating a suspicious charge"""
    status: str  # pending, confirmed_fraudulent, confirmed_legitimate, dismissed
    user_feedback: Optional[str] = None


class SuspiciousChargeResponse(SuspiciousChargeBase):
    """Schema for suspicious charge response"""
    id: int
    user_id: int
    transaction_id: Optional[int] = None
    currency: str
    charge_date: datetime
    status: str
    user_feedback: Optional[str] = None
    resolved_at: Optional[datetime] = None
    alert_sent: bool
    alert_sent_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SuspiciousChargeSummary(BaseModel):
    """Summary of suspicious charges"""
    total_suspicious: int
    pending_review: int
    confirmed_fraudulent: int
    confirmed_legitimate: int
    total_amount_at_risk: float
    charges: list[SuspiciousChargeResponse]
