from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BankAccountBase(BaseModel):
    """Base schema for BankAccount"""
    account_name: str
    institution_name: str
    account_type: str
    currency: str = "MXN"


class BankAccountCreate(BankAccountBase):
    """Schema for creating a bank account (manual)"""
    account_number: Optional[str] = None
    current_balance: float = 0.0
    available_balance: float = 0.0


class BankAccountUpdate(BaseModel):
    """Schema for updating a bank account"""
    account_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None


class BankAccountResponse(BankAccountBase):
    """Schema for bank account response"""
    id: int
    user_id: int
    belvo_account_id: Optional[str] = None
    account_number: Optional[str] = None
    current_balance: float
    available_balance: float
    is_active: bool
    is_primary: bool
    created_at: datetime
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BankAccountSummary(BaseModel):
    """Summary of all bank accounts"""
    total_accounts: int
    active_accounts: int
    total_balance: float
    total_available: float
    accounts: list[BankAccountResponse]
