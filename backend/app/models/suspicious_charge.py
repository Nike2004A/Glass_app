from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class SuspiciousCharge(Base):
    __tablename__ = "suspicious_charges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=True)

    # Charge details
    merchant_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MXN")
    charge_date = Column(DateTime(timezone=True), nullable=False)

    # Suspicion details
    suspicion_type = Column(String, nullable=False)  # unusual_amount, unusual_location, unusual_merchant, etc.
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    reason = Column(Text, nullable=False)

    # Status
    status = Column(String, default="pending")  # pending, confirmed_fraudulent, confirmed_legitimate, dismissed
    user_feedback = Column(String, nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Alert
    alert_sent = Column(Boolean, default=False)
    alert_sent_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="suspicious_charges")
