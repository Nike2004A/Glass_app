from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


class AutomationRuleBase(BaseModel):
    """Base schema for AutomationRule"""
    rule_name: str
    rule_type: str  # auto_pay, auto_save, budget_alert
    description: Optional[str] = None


class AutomationRuleCreate(AutomationRuleBase):
    """Schema for creating an automation rule"""
    trigger_conditions: dict[str, Any]
    action_config: dict[str, Any]
    is_active: bool = True
    max_amount: Optional[float] = None
    require_confirmation: bool = True


class AutomationRuleUpdate(BaseModel):
    """Schema for updating an automation rule"""
    rule_name: Optional[str] = None
    description: Optional[str] = None
    trigger_conditions: Optional[dict[str, Any]] = None
    action_config: Optional[dict[str, Any]] = None
    is_active: Optional[bool] = None
    max_amount: Optional[float] = None
    require_confirmation: Optional[bool] = None


class AutomationRuleResponse(AutomationRuleBase):
    """Schema for automation rule response"""
    id: int
    user_id: int
    trigger_conditions: dict[str, Any]
    action_config: dict[str, Any]
    is_active: bool
    max_amount: Optional[float] = None
    require_confirmation: bool
    last_executed_at: Optional[datetime] = None
    execution_count: int
    failure_count: int
    last_error: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AutomationRuleSummary(BaseModel):
    """Summary of automation rules"""
    total_rules: int
    active_rules: int
    total_executions: int
    rules: list[AutomationRuleResponse]
