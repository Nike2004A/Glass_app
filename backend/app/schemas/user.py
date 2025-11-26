from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base schema for User"""
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    push_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    is_active: bool
    is_verified: bool
    belvo_link_id: Optional[str] = None
    push_notifications: bool
    email_notifications: bool
    sms_notifications: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfile(UserResponse):
    """Extended user profile with statistics"""
    total_accounts: int = 0
    total_credit_cards: int = 0
    total_balance: float = 0.0
    total_credit_limit: float = 0.0
    active_subscriptions: int = 0
    pending_alerts: int = 0
