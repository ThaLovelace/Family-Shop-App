from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.post("/income", response_model=list[schemas.TransactionOut])
def create_income(batch: schemas.IncomeBatchCreate, db: Session = Depends(get_db)):
    created = []
    for entry in batch.entries:
        if entry.payment_method == "DEBT" and not entry.customer_id:
            raise HTTPException(400, "customer_id is required when payment_method is DEBT")
        row = models.Transaction(
            transaction_date=entry.transaction_date,
            entry_type="INCOME",
            item_description=entry.item_description,
            amount=entry.amount,
            payment_method=entry.payment_method,
            customer_id=entry.customer_id if entry.payment_method == "DEBT" else None,
            income_category=entry.income_category,
            created_by=entry.created_by,
        )
        db.add(row)
        created.append(row)
    db.commit()
    for row in created:
        db.refresh(row)
    return created


@router.post("/expense", response_model=list[schemas.TransactionOut])
def create_expense(batch: schemas.ExpenseBatchCreate, db: Session = Depends(get_db)):
    created = []
    for entry in batch.entries:
        row = models.Transaction(
            transaction_date=entry.transaction_date,
            entry_type="EXPENSE",
            item_description=entry.item_description,
            amount=entry.amount,
            expense_category=entry.expense_category,
            payment_source=entry.payment_source,
            created_by=entry.created_by,
        )
        db.add(row)
        created.append(row)
    db.commit()
    for row in created:
        db.refresh(row)
    return created


@router.post("/home-use", response_model=list[schemas.TransactionOut])
def create_home_use(batch: schemas.HomeUseBatchCreate, db: Session = Depends(get_db)):
    created = []
    for entry in batch.entries:
        row = models.Transaction(
            transaction_date=entry.transaction_date,
            entry_type="HOME_USE",
            item_description=entry.item_description,
            amount=entry.amount,
            home_use_tag=entry.home_use_tag,
            created_by=entry.created_by,
        )
        db.add(row)
        created.append(row)
    db.commit()
    for row in created:
        db.refresh(row)
    return created


@router.get("", response_model=list[schemas.TransactionOut])
def list_transactions(
    date: str | None = None,
    entry_type: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(models.Transaction).where(models.Transaction.is_voided.is_(False))
    if date:
        stmt = stmt.where(models.Transaction.transaction_date == date)
    if entry_type:
        stmt = stmt.where(models.Transaction.entry_type == entry_type)
    stmt = stmt.order_by(models.Transaction.transaction_id.desc())
    return db.execute(stmt).scalars().all()


@router.patch("/{transaction_id}/void", response_model=schemas.TransactionOut)
def void_transaction(transaction_id: int, body: schemas.VoidRequest, db: Session = Depends(get_db)):
    row = db.get(models.Transaction, transaction_id)
    if not row:
        raise HTTPException(404, "Transaction not found")
    row.is_voided = True
    row.voided_reason = body.reason
    db.commit()
    db.refresh(row)
    return row
