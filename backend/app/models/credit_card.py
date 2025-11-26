from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Card details
    card_name = Column(String, nullable=False)
    last_four_digits = Column(String(4), nullable=False)
    institution_name = Column(String, nullable=False)
    card_type = Column(String, nullable=True)  # visa, mastercard, amex, etc.

    # Credit information
    credit_limit = Column(Float, nullable=False)
    current_balance = Column(Float, default=0.0)
    available_credit = Column(Float, nullable=False)

    # Billing information
    billing_cycle_day = Column(Integer, nullable=True)  # Day of month billing cycle closes
    payment_due_day = Column(Integer, nullable=True)  # Day of month payment is due
    next_payment_date = Column(Date, nullable=True)
    minimum_payment = Column(Float, default=0.0)

    # Interest rate
    annual_interest_rate = Column(Float, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="credit_cards")
    transactions = relationship("Transaction", back_populates="credit_card", cascade="all, delete-orphan")
