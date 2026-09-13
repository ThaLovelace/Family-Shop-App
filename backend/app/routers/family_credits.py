from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.sql import func as sqlfunc

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/family-credits", tags=["family-credits"])


@router.post("", response_model=schemas.FamilyCreditOut)
def create_family_credit(payload: schemas.FamilyCreditCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, payload.customer_id)
    if not customer or not customer.is_family:
        raise HTTPException(400, "customer_id must belong to a family member (is_family=true)")
    row = models.FamilyCredit(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/{customer_id}/net")
def net_family_balance(customer_id: int, db: Session = Depends(get_db)):
    """Net balance: positive = shop owes the family member, negative = family member owes the shop."""
    shop_owes = db.execute(
        select(func.coalesce(func.sum(models.FamilyCredit.amount), 0)).where(
            models.FamilyCredit.customer_id == customer_id,
            models.FamilyCredit.direction == "SHOP_OWES_FAMILY",
            models.FamilyCredit.is_cleared.is_(False),
        )
    ).scalar_one()
    family_owes = db.execute(
        select(func.coalesce(func.sum(models.FamilyCredit.amount), 0)).where(
            models.FamilyCredit.customer_id == customer_id,
            models.FamilyCredit.direction == "FAMILY_OWES_SHOP",
            models.FamilyCredit.is_cleared.is_(False),
        )
    ).scalar_one()
    net = Decimal(shop_owes) - Decimal(family_owes)
    return {
        "customer_id": customer_id,
        "shop_owes_family": shop_owes,
        "family_owes_shop": family_owes,
        "net_balance": net,  # positive => shop owes family
    }


@router.post("/clear")
def clear_family_credits(payload: schemas.FamilyCreditClearRequest, db: Session = Depends(get_db)):
    rows = db.execute(
        select(models.FamilyCredit).where(models.FamilyCredit.credit_id.in_(payload.credit_ids))
    ).scalars().all()
    if len(rows) != len(payload.credit_ids):
        raise HTTPException(404, "One or more credit_ids not found")
    for row in rows:
        row.is_cleared = True
        row.cleared_at = sqlfunc.now()
    db.commit()
    return {"cleared_count": len(rows), "note": payload.note}
