import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Example values:
#   Local:  postgresql://user:password@localhost:5432/shopdb
#   Neon:   postgresql://user:password@ep-xxx.neon.tech/shopdb?sslmode=require
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_dev.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
