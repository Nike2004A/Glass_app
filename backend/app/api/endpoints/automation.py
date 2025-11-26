from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.automation_rule import AutomationRule
from app.schemas.automation_rule import (
    AutomationRuleCreate,
    AutomationRuleUpdate,
    AutomationRuleResponse,
    AutomationRuleSummary
)

router = APIRouter()


@router.get("/", response_model=List[AutomationRuleResponse])
def list_automation_rules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    active_only: bool = False
):
    """
    List all automation rules for current user

    Args:
        current_user: Current authenticated user
        db: Database session
        active_only: Show only active rules

    Returns:
        List of automation rules
    """
    query = db.query(AutomationRule).filter(AutomationRule.user_id == current_user.id)

    if active_only:
        query = query.filter(AutomationRule.is_active == True)

    rules = query.order_by(AutomationRule.created_at.desc()).all()

    return rules


@router.get("/summary", response_model=AutomationRuleSummary)
def get_automation_rules_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get summary of automation rules

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Automation rules summary
    """
    rules = db.query(AutomationRule).filter(
        AutomationRule.user_id == current_user.id
    ).all()

    active_rules = sum(1 for r in rules if r.is_active)
    total_executions = sum(r.execution_count for r in rules)

    return AutomationRuleSummary(
        total_rules=len(rules),
        active_rules=active_rules,
        total_executions=total_executions,
        rules=rules
    )


@router.post("/", response_model=AutomationRuleResponse, status_code=status.HTTP_201_CREATED)
def create_automation_rule(
    rule_data: AutomationRuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new automation rule

    Args:
        rule_data: Automation rule data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Created automation rule
    """
    new_rule = AutomationRule(
        user_id=current_user.id,
        rule_name=rule_data.rule_name,
        rule_type=rule_data.rule_type,
        description=rule_data.description,
        trigger_conditions=rule_data.trigger_conditions,
        action_config=rule_data.action_config,
        is_active=rule_data.is_active,
        max_amount=rule_data.max_amount,
        require_confirmation=rule_data.require_confirmation,
        execution_count=0,
        failure_count=0
    )

    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    return new_rule


@router.get("/{rule_id}", response_model=AutomationRuleResponse)
def get_automation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific automation rule

    Args:
        rule_id: Automation rule ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Automation rule details

    Raises:
        HTTPException: If rule not found or doesn't belong to user
    """
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )

    return rule


@router.patch("/{rule_id}", response_model=AutomationRuleResponse)
def update_automation_rule(
    rule_id: int,
    rule_update: AutomationRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an automation rule

    Args:
        rule_id: Automation rule ID
        rule_update: Update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated automation rule

    Raises:
        HTTPException: If rule not found or doesn't belong to user
    """
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )

    # Update fields if provided
    if rule_update.rule_name is not None:
        rule.rule_name = rule_update.rule_name

    if rule_update.description is not None:
        rule.description = rule_update.description

    if rule_update.trigger_conditions is not None:
        rule.trigger_conditions = rule_update.trigger_conditions

    if rule_update.action_config is not None:
        rule.action_config = rule_update.action_config

    if rule_update.is_active is not None:
        rule.is_active = rule_update.is_active

    if rule_update.max_amount is not None:
        rule.max_amount = rule_update.max_amount

    if rule_update.require_confirmation is not None:
        rule.require_confirmation = rule_update.require_confirmation

    db.commit()
    db.refresh(rule)

    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_automation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an automation rule

    Args:
        rule_id: Automation rule ID
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: If rule not found or doesn't belong to user
    """
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )

    # Hard delete for automation rules
    db.delete(rule)
    db.commit()

    return None


@router.post("/{rule_id}/toggle", response_model=AutomationRuleResponse)
def toggle_automation_rule(
    rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggle automation rule active status

    Args:
        rule_id: Automation rule ID
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated automation rule

    Raises:
        HTTPException: If rule not found or doesn't belong to user
    """
    rule = db.query(AutomationRule).filter(
        AutomationRule.id == rule_id,
        AutomationRule.user_id == current_user.id
    ).first()

    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )

    # Toggle active status
    rule.is_active = not rule.is_active
    db.commit()
    db.refresh(rule)

    return rule
