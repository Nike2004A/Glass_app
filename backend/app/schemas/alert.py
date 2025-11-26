from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertBase(BaseModel):
    """Base schema for Alert"""
    alert_type: str
    title: str
    message: str
    priority: str = "medium"  # low, medium, high, critical
    category: str  # security, payment, budget, account


class AlertCreate(AlertBase):
    """Schema for creating an alert"""
    related_transaction_id: Optional[int] = None
    related_subscription_id: Optional[int] = None
    related_account_id: Optional[int] = None
    requires_action: bool = False
    action_url: Optional[str] = None


class AlertUpdate(BaseModel):
    """Schema for updating an alert"""
    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    action_taken: Optional[bool] = None


class AlertResponse(AlertBase):
    """Schema for alert response"""
    id: int
    user_id: int
    related_transaction_id: Optional[int] = None
    related_subscription_id: Optional[int] = None
    related_account_id: Optional[int] = None
    is_read: bool
    is_dismissed: bool
    read_at: Optional[datetime] = None
    dismissed_at: Optional[datetime] = None
    requires_action: bool
    action_url: Optional[str] = None
    action_taken: bool
    action_taken_at: Optional[datetime] = None
    push_sent: bool
    email_sent: bool
    sms_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertSummary(BaseModel):
    """Summary of alerts"""
    total_alerts: int
    unread_alerts: int
    critical_alerts: int
    requires_action: int
    alerts: list[AlertResponse]
