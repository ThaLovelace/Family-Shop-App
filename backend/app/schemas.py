from datetime import date, datetime
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict


# ---------- Customers ----------
class CustomerCreate(BaseModel):
    name: str
    nickname: Optional[str] = None
    phone: Optional[str] = None
    is_family: bool = False


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    customer_id: int
    name: str
    nickname: Optional[str] = None
    phone: Optional[str] = None
    is_family: bool
    is_active: bool


class CustomerDebtOut(CustomerOut):
    outstanding_debt: Decimal


# ---------- Transactions ----------
class IncomeEntry(BaseModel):
    transaction_date: date
    item_description: Optional[str] = None
    amount: Decimal
    payment_method: Literal["CASH", "TRANSFER", "DEBT"]
    customer_id: Optional[int] = None  # required when payment_method == DEBT
    created_by: Optional[str] = None


class IncomeBatchCreate(BaseModel):
    entries: list[IncomeEntry]


class ExpenseEntry(BaseModel):
    transaction_date: date
    item_description: Optional[str] = None
    amount: Decimal
    expense_category: Literal["FRESH_MARKET", "BEVERAGE", "GROCERY_OTHER"]
    payment_source: Literal["DRAWER_CASH", "CREDIT_CARD", "FAMILY_SHOPEE"]
    created_by: Optional[str] = None


class ExpenseBatchCreate(BaseModel):
    entries: list[ExpenseEntry]


class HomeUseEntry(BaseModel):
    transaction_date: date
    item_description: Optional[str] = None
    amount: Decimal
    home_use_tag: Literal["FOR_SALE", "NEAR_EXPIRED", "GRANDMA"]
    created_by: Optional[str] = None


class HomeUseBatchCreate(BaseModel):
    entries: list[HomeUseEntry]


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    transaction_id: int
    transaction_date: date
    entry_type: str
    item_description: Optional[str] = None
    amount: Decimal
    payment_method: Optional[str] = None
    customer_id: Optional[int] = None
    home_use_tag: Optional[str] = None
    expense_category: Optional[str] = None
    payment_source: Optional[str] = None
    is_voided: bool
    created_at: datetime


class VoidRequest(BaseModel):
    reason: str


# ---------- Debt payments ----------
class DebtPaymentCreate(BaseModel):
    payment_date: date
    amount: Decimal
    payment_method: Literal["CASH", "TRANSFER"]


class DebtPaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    payment_id: int
    customer_id: int
    payment_date: date
    amount: Decimal
    payment_method: str
    is_internal_clearing: bool
    clearing_note: Optional[str] = None


# ---------- Family credits (internal clearing) ----------
class FamilyCreditCreate(BaseModel):
    customer_id: int
    direction: Literal["SHOP_OWES_FAMILY", "FAMILY_OWES_SHOP"]
    amount: Decimal
    description: Optional[str] = None


class FamilyCreditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    credit_id: int
    customer_id: int
    direction: str
    amount: Decimal
    description: Optional[str] = None
    is_cleared: bool


class FamilyCreditClearRequest(BaseModel):
    credit_ids: list[int]
    note: Optional[str] = None


# ---------- Dashboard ----------
class DailySummaryOut(BaseModel):
    date: date
    total_cash_income: Decimal
    total_transfer_income: Decimal
    total_debt_income: Decimal
    total_expense: Decimal
    total_home_use_value: Decimal
    net_cash_in_drawer_change: Decimal
