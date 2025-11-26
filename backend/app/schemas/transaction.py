from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionBase(BaseModel):
    """Base schema for Transaction"""
    description: str
    amount: float
    transaction_type: str  # income, expense, transfer
    category: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction (manual)"""
    bank_account_id: Optional[int] = None
    credit_card_id: Optional[int] = None
    merchant_name: Optional[str] = None
    transaction_date: datetime
    currency: str = "MXN"


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction"""
    category: Optional[str] = None
    notes: Optional[str] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response"""
    id: int
    user_id: int
    bank_account_id: Optional[int] = None
    credit_card_id: Optional[int] = None
    belvo_transaction_id: Optional[str] = None
    merchant_name: Optional[str] = None
    currency: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    transaction_date: datetime
    value_date: Optional[datetime] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """Paginated transaction list response"""
    total: int
    page: int
    page_size: int
    transactions: list[TransactionResponse]


class TransactionAnalytics(BaseModel):
    """Transaction analytics summary"""
    total_income: float
    total_expenses: float
    net_flow: float
    top_categories: dict[str, float]
    top_merchants: dict[str, float]
    monthly_summary: dict[str, dict[str, float]]
