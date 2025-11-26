from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class SubscriptionBase(BaseModel):
    """Base schema for Subscription"""
    service_name: str
    merchant_name: str
    amount: float = Field(..., gt=0)
    billing_frequency: str  # monthly, yearly, weekly


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription (manual)"""
    category: Optional[str] = None
    billing_day: Optional[int] = Field(None, ge=1, le=31)
    first_charge_date: date
    currency: str = "MXN"
    alert_before_charge: bool = True
    alert_days_before: int = 3


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription"""
    service_name: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    billing_frequency: Optional[str] = None
    billing_day: Optional[int] = Field(None, ge=1, le=31)
    category: Optional[str] = None
    is_active: Optional[bool] = None
    alert_before_charge: Optional[bool] = None
    alert_days_before: Optional[int] = None


class SubscriptionResponse(SubscriptionBase):
    """Schema for subscription response"""
    id: int
    user_id: int
    category: Optional[str] = None
    currency: str
    billing_day: Optional[int] = None
    first_charge_date: date
    last_charge_date: Optional[date] = None
    next_charge_date: Optional[date] = None
    is_active: bool
    auto_detected: bool
    user_confirmed: bool
    alert_before_charge: bool
    alert_days_before: int
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionSummary(BaseModel):
    """Summary of all subscriptions"""
    total_subscriptions: int
    active_subscriptions: int
    monthly_cost: float
    yearly_cost: float
    subscriptions: list[SubscriptionResponse]
    upcoming_charges: list[dict]  # Next charges in the coming days
