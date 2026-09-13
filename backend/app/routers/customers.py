from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/customers", tags=["customers"])


def _outstanding_debt(db: Session, customer_id: int) -> Decimal:
    debt_income = db.execute(
        select(func.coalesce(func.sum(models.Transaction.amount), 0)).where(
            models.Transaction.customer_id == customer_id,
            models.Transaction.payment_method == "DEBT",
            models.Transaction.entry_type == "INCOME",
            models.Transaction.is_voided.is_(False),
        )
    ).scalar_one()
    paid = db.execute(
        select(func.coalesce(func.sum(models.DebtPayment.amount), 0)).where(
            models.DebtPayment.customer_id == customer_id,
            models.DebtPayment.is_voided.is_(False),
        )
    ).scalar_one()
    return Decimal(debt_income) - Decimal(paid)


@router.get("", response_model=list[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    stmt = select(models.Customer).where(models.Customer.is_active.is_(True))
    return db.execute(stmt).scalars().all()


@router.post("", response_model=schemas.CustomerOut)
def create_customer(payload: schemas.CustomerCreate, db: Session = Depends(get_db)):
    row = models.Customer(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{customer_id}/debt", response_model=schemas.CustomerDebtOut)
def get_customer_debt(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")
    outstanding = _outstanding_debt(db, customer_id)
    return schemas.CustomerDebtOut(
        customer_id=customer.customer_id,
        name=customer.name,
        nickname=customer.nickname,
        phone=customer.phone,
        is_family=customer.is_family,
        is_active=customer.is_active,
        outstanding_debt=outstanding,
    )


@router.post("/{customer_id}/payments", response_model=schemas.DebtPaymentOut)
def add_payment(customer_id: int, payload: schemas.DebtPaymentCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(404, "Customer not found")
    row = models.DebtPayment(customer_id=customer_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
