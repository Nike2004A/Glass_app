from pydantic import BaseModel
from typing import Optional


class BelvoLinkCreate(BaseModel):
    """Schema for creating a Belvo link"""
    institution: str
    username: str
    password: str
    token: Optional[str] = None  # For institutions requiring 2FA


class BelvoLinkResponse(BaseModel):
    """Schema for Belvo link response"""
    link_id: str
    institution: str
    status: str
    created_at: str
    last_accessed_at: Optional[str] = None


class BelvoAccountSync(BaseModel):
    """Schema for syncing Belvo accounts"""
    link_id: str
    save_data: bool = True


class BelvoTransactionSync(BaseModel):
    """Schema for syncing Belvo transactions"""
    link_id: str
    date_from: Optional[str] = None  # YYYY-MM-DD format
    date_to: Optional[str] = None  # YYYY-MM-DD format


class BelvoSyncResponse(BaseModel):
    """Schema for Belvo sync response"""
    success: bool
    message: str
    accounts_synced: int = 0
    transactions_synced: int = 0
    errors: list[str] = []
