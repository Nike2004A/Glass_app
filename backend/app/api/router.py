from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    users,
    accounts,
    cards,
    transactions,
    subscriptions,
    suspicious_charges,
    alerts,
    automation,
    belvo
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["Bank Accounts"])
api_router.include_router(cards.router, prefix="/cards", tags=["Credit Cards"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(suspicious_charges.router, prefix="/suspicious-charges", tags=["Suspicious Charges"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(automation.router, prefix="/automation", tags=["Automation Rules"])
api_router.include_router(belvo.router, prefix="/belvo", tags=["Belvo Integration"])
