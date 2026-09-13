from datetime import date as date_cls

from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from .settings import _get_or_create as _get_or_create_settings

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _sum_where(db: Session, **filters) -> Decimal:
    stmt = select(func.coalesce(func.sum(models.Transaction.amount), 0)).where(
        models.Transaction.is_voided.is_(False)
    )
    for key, value in filters.items():
        stmt = stmt.where(getattr(models.Transaction, key) == value)
    return Decimal(db.execute(stmt).scalar_one())


def _sum_range(db: Session, start: date_cls, end: date_cls, **filters) -> Decimal:
    stmt = select(func.coalesce(func.sum(models.Transaction.amount), 0)).where(
        models.Transaction.is_voided.is_(False),
        models.Transaction.transaction_date >= start,
        models.Transaction.transaction_date <= end,
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


@router.post("/drawer-count", response_model=schemas.HomeSummaryOut)
def record_drawer_count(body: schemas.DrawerCountCreate, db: Session = Depends(get_db)):
    row = db.execute(
        select(models.DrawerCount).where(models.DrawerCount.count_date == body.count_date)
    ).scalar_one_or_none()
    if row:
        row.counted_amount = body.counted_amount
    else:
        row = models.DrawerCount(count_date=body.count_date, counted_amount=body.counted_amount)
        db.add(row)
    db.commit()
    return home_summary(str(body.count_date), db)


@router.get("/home-summary", response_model=schemas.HomeSummaryOut)
def home_summary(date: str, db: Session = Depends(get_db)):
    target_date = date_cls.fromisoformat(date)
    settings = _get_or_create_settings(db)

    cash_income = _sum_where(db, transaction_date=date, entry_type="INCOME", payment_method="CASH")
    expense_drawer = _sum_where(
        db, transaction_date=date, entry_type="EXPENSE", payment_source="DRAWER_CASH"
    )
    expected_drawer_cash = settings.drawer_float_amount + cash_income - expense_drawer

    counted = db.execute(
        select(models.DrawerCount).where(models.DrawerCount.count_date == target_date)
    ).scalar_one_or_none()
    if counted is None:
        drawer_status = "NOT_COUNTED_YET"
        actual_drawer_count = None
    elif counted.counted_amount == expected_drawer_cash:
        drawer_status = "MATCH"
        actual_drawer_count = counted.counted_amount
    else:
        drawer_status = "MISMATCH"
        actual_drawer_count = counted.counted_amount

    market_expense_today = _sum_where(
        db, transaction_date=date, entry_type="EXPENSE", expense_category="FRESH_MARKET"
    )
    if settings.market_daily_budget is None:
        market_status = "NO_BUDGET_SET"
    elif market_expense_today > settings.market_daily_budget:
        market_status = "OVER"
    else:
        market_status = "OK"

    month_start = target_date.replace(day=1)
    month_income = _sum_range(db, month_start, target_date, entry_type="INCOME")
    month_expense = _sum_range(db, month_start, target_date, entry_type="EXPENSE")
    month_home_use = _sum_range(db, month_start, target_date, entry_type="HOME_USE")
    month_profit_so_far = month_income - month_expense - month_home_use

    return schemas.HomeSummaryOut(
        date=target_date,
        cash_income_today=cash_income,
        expected_drawer_cash=expected_drawer_cash,
        actual_drawer_count=actual_drawer_count,
        drawer_status=drawer_status,
        market_expense_today=market_expense_today,
        market_daily_budget=settings.market_daily_budget,
        market_status=market_status,
        month_profit_so_far=month_profit_so_far,
    )
