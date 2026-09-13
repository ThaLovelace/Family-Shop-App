from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _sum_where(db: Session, **filters) -> Decimal:
    stmt = select(func.coalesce(func.sum(models.Transaction.amount), 0)).where(
        models.Transaction.is_voided.is_(False)
    )
    for key, value in filters.items():
        stmt = stmt.where(getattr(models.Transaction, key) == value)
    return Decimal(db.execute(stmt).scalar_one())


@router.get("/daily-summary", response_model=schemas.DailySummaryOut)
def daily_summary(date: str, db: Session = Depends(get_db)):
    cash = _sum_where(db, transaction_date=date, entry_type="INCOME", payment_method="CASH")
    transfer = _sum_where(db, transaction_date=date, entry_type="INCOME", payment_method="TRANSFER")
    debt = _sum_where(db, transaction_date=date, entry_type="INCOME", payment_method="DEBT")
    expense_drawer = _sum_where(
        db, transaction_date=date, entry_type="EXPENSE", payment_source="DRAWER_CASH"
    )
    total_expense = _sum_where(db, transaction_date=date, entry_type="EXPENSE")
    home_use = _sum_where(db, transaction_date=date, entry_type="HOME_USE")

    return schemas.DailySummaryOut(
        date=date,
        total_cash_income=cash,
        total_transfer_income=transfer,
        total_debt_income=debt,
        total_expense=total_expense,
        total_home_use_value=home_use,
        net_cash_in_drawer_change=cash - expense_drawer,
    )
