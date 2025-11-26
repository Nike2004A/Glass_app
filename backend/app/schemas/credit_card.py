from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date


class CreditCardBase(BaseModel):
    """Base schema for CreditCard"""
    card_name: str
    institution_name: str
    credit_limit: float = Field(..., gt=0)


class CreditCardCreate(CreditCardBase):
    """Schema for creating a credit card (manual)"""
    last_four_digits: str = Field(..., min_length=4, max_length=4)
    card_type: Optional[str] = None
    current_balance: float = 0.0
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    payment_due_day: Optional[int] = Field(None, ge=1, le=31)
    annual_interest_rate: Optional[float] = None


class CreditCardUpdate(BaseModel):
    """Schema for updating a credit card"""
    card_name: Optional[str] = None
    credit_limit: Optional[float] = Field(None, gt=0)
    billing_cycle_day: Optional[int] = Field(None, ge=1, le=31)
    payment_due_day: Optional[int] = Field(None, ge=1, le=31)
    is_active: Optional[bool] = None


class CreditCardResponse(CreditCardBase):
    """Schema for credit card response"""
    id: int
    user_id: int
    last_four_digits: str
    card_type: Optional[str] = None
    current_balance: float
    available_credit: float
    billing_cycle_day: Optional[int] = None
    payment_due_day: Optional[int] = None
    next_payment_date: Optional[date] = None
    minimum_payment: float
    annual_interest_rate: Optional[float] = None
    is_active: bool
    created_at: datetime
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CreditCardSummary(BaseModel):
    """Summary of all credit cards"""
    total_cards: int
    active_cards: int
    total_credit_limit: float
    total_balance: float
    total_available_credit: float
    total_minimum_payment: float
    cards: list[CreditCardResponse]
