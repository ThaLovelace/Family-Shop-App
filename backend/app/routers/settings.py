from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(db: Session) -> models.ShopSettings:
    row = db.get(models.ShopSettings, 1)
    if not row:
        row = models.ShopSettings(settings_id=1, drawer_float_amount=0)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("", response_model=schemas.SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("", response_model=schemas.SettingsOut)
def update_settings(body: schemas.SettingsUpdate, db: Session = Depends(get_db)):
    row = _get_or_create(db)
    if body.drawer_float_amount is not None:
        row.drawer_float_amount = body.drawer_float_amount
    if body.market_daily_budget is not None:
        row.market_daily_budget = body.market_daily_budget
    db.commit()
    db.refresh(row)
    return row
