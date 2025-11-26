from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Rule details
    rule_name = Column(String, nullable=False)
    rule_type = Column(String, nullable=False)  # auto_pay, auto_save, budget_alert, etc.
    description = Column(String, nullable=True)

    # Trigger conditions (stored as JSON)
    trigger_conditions = Column(JSON, nullable=False)
    # Examples:
    # {"type": "scheduled", "day": 15, "time": "09:00"}
    # {"type": "balance_threshold", "account_id": 1, "threshold": 1000}
    # {"type": "transaction_match", "merchant": "Netflix", "amount": 199}

    # Action configuration (stored as JSON)
    action_config = Column(JSON, nullable=False)
    # Examples:
    # {"type": "transfer", "from_account": 1, "to_account": 2, "amount": 500}
    # {"type": "pay_bill", "subscription_id": 1, "account_id": 1}
    # {"type": "send_alert", "message": "Budget exceeded"}

    # Execution settings
    is_active = Column(Boolean, default=True)
    max_amount = Column(Float, nullable=True)  # Maximum amount for transfers/payments
    require_confirmation = Column(Boolean, default=True)

    # Execution tracking
    last_executed_at = Column(DateTime(timezone=True), nullable=True)
    execution_count = Column(Integer, default=0)
    failure_count = Column(Integer, default=0)
    last_error = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="automation_rules")
