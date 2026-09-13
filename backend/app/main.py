import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models  # noqa: F401  (ensures models are registered before create_all)
from .routers import transactions, customers, family_credits, dashboard

app = FastAPI(title="ระบบจัดการกระแสเงินสดและสต๊อกกงสี")

# Comma-separated list of allowed origins, e.g. "https://your-app.vercel.app,http://localhost:3000"
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(customers.router)
app.include_router(family_credits.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def on_startup():
    # MVP: create tables automatically. Swap to Alembic migrations once schema stabilizes.
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
