from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Alert details
    alert_type = Column(String, nullable=False)  # suspicious_charge, subscription_reminder, low_balance, etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)

    # Priority and category
    priority = Column(String, default="medium")  # low, medium, high, critical
    category = Column(String, nullable=False)  # security, payment, budget, account

    # Related entities (optional)
    related_transaction_id = Column(Integer, nullable=True)
    related_subscription_id = Column(Integer, nullable=True)
    related_account_id = Column(Integer, nullable=True)

    # Status
    is_read = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    dismissed_at = Column(DateTime(timezone=True), nullable=True)

    # Action required
    requires_action = Column(Boolean, default=False)
    action_url = Column(String, nullable=True)
    action_taken = Column(Boolean, default=False)
    action_taken_at = Column(DateTime(timezone=True), nullable=True)

    # Notification sent
    push_sent = Column(Boolean, default=False)
    email_sent = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="alerts")
