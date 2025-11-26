from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Subscription details
    service_name = Column(String, nullable=False)
    merchant_name = Column(String, nullable=False)
    category = Column(String, nullable=True)  # entertainment, software, utilities, etc.

    # Billing information
    amount = Column(Float, nullable=False)
    currency = Column(String, default="MXN")
    billing_frequency = Column(String, nullable=False)  # monthly, yearly, weekly, etc.
    billing_day = Column(Integer, nullable=True)  # Day of month for billing

    # Dates
    first_charge_date = Column(Date, nullable=False)
    last_charge_date = Column(Date, nullable=True)
    next_charge_date = Column(Date, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    auto_detected = Column(Boolean, default=True)  # Whether this was auto-detected or manually added
    user_confirmed = Column(Boolean, default=False)

    # Alert settings
    alert_before_charge = Column(Boolean, default=True)
    alert_days_before = Column(Integer, default=3)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subscriptions")
