from sqlalchemy import Column, String, Float, JSON, DateTime, Text, Integer
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass


class Patient(Base):
    __tablename__ = "patients"
    patient_id = Column(String, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    record = Column(JSON)  # Full patient record as JSON blob


class Session(Base):
    __tablename__ = "sessions"
    session_id = Column(String, primary_key=True)
    patient_id = Column(String)
    llm_output = Column(Text)
    risk_score = Column(Float)
    risk_level = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True)
    session_id = Column(String)
    agent = Column(String)
    score = Column(Float)
    flags = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
