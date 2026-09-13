from sqlalchemy import (
    Column, Integer, String, Numeric, Boolean, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    nickname = Column(String(50))
    phone = Column(String(20))
    is_family = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transactions = relationship("Transaction", back_populates="customer")
    debt_payments = relationship("DebtPayment", back_populates="customer")
    family_credits = relationship("FamilyCredit", back_populates="customer")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    entry_type = Column(String(20), nullable=False, index=True)  # INCOME | EXPENSE | HOME_USE

    item_description = Column(String(255))
    amount = Column(Numeric(10, 2), nullable=False)

    # INCOME only
    payment_method = Column(String(20))  # CASH | TRANSFER | DEBT
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), index=True)

    # HOME_USE only
    home_use_tag = Column(String(20))  # FOR_SALE | NEAR_EXPIRED | GRANDMA

    # EXPENSE only
    expense_category = Column(String(20))  # FRESH_MARKET | BEVERAGE | GROCERY_OTHER
    payment_source = Column(String(20))    # DRAWER_CASH | CREDIT_CARD | FAMILY_SHOPEE

    is_voided = Column(Boolean, default=False)
    voided_reason = Column(String(255))
    created_by = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="transactions")


class DebtPayment(Base):
    __tablename__ = "debt_payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False, index=True)
    payment_date = Column(Date, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(20), nullable=False)  # CASH | TRANSFER

    is_internal_clearing = Column(Boolean, default=False)
    clearing_note = Column(String(255))

    is_voided = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="debt_payments")


class FamilyCredit(Base):
    __tablename__ = "family_credits"

    credit_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"), nullable=False, index=True)
    direction = Column(String(20), nullable=False)  # SHOP_OWES_FAMILY | FAMILY_OWES_SHOP
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(String(255))
    is_cleared = Column(Boolean, default=False)
    cleared_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="family_credits")
