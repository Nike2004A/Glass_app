from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Belvo account ID
    belvo_account_id = Column(String, unique=True, index=True, nullable=True)

    # Account details
    account_name = Column(String, nullable=False)
    account_number = Column(String, nullable=True)  # Last 4 digits
    account_type = Column(String, nullable=False)  # checking, savings, etc.
    institution_name = Column(String, nullable=False)
    currency = Column(String, default="MXN")

    # Balance information
    current_balance = Column(Float, default=0.0)
    available_balance = Column(Float, default=0.0)

    # Status
    is_active = Column(Boolean, default=True)
    is_primary = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="bank_accounts")
    transactions = relationship("Transaction", back_populates="bank_account", cascade="all, delete-orphan")
