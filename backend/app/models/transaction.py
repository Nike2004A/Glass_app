from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=True, index=True)
    credit_card_id = Column(Integer, ForeignKey("credit_cards.id"), nullable=True, index=True)

    # Belvo transaction ID
    belvo_transaction_id = Column(String, unique=True, index=True, nullable=True)

    # Transaction details
    description = Column(String, nullable=False)
    merchant_name = Column(String, nullable=True)
    category = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MXN")

    # Transaction type
    transaction_type = Column(String, nullable=False)  # income, expense, transfer

    # Transaction metadata
    reference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # Dates
    transaction_date = Column(DateTime(timezone=True), nullable=False)
    value_date = Column(DateTime(timezone=True), nullable=True)

    # Status
    status = Column(String, default="completed")  # pending, completed, failed

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    bank_account = relationship("BankAccount", back_populates="transactions")
    credit_card = relationship("CreditCard", back_populates="transactions")
