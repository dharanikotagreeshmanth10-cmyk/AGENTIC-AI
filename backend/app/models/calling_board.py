from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database.base import Base

class CallingContactModel(Base):
    __tablename__ = "calling_contacts"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(String(100), nullable=True, default="Operational Lead")
    priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    status = Column(String(20), nullable=False, default="Available")  # Available, Calling, Completed, Pending
    reason = Column(Text, nullable=False)
    notes = Column(Text, nullable=True, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CallHistoryModel(Base):
    __tablename__ = "call_history"

    id = Column(String(50), primary_key=True, index=True)
    contact_id = Column(String(50), nullable=True)
    contact_name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    priority = Column(String(20), nullable=False)
    reason = Column(Text, nullable=False)
    duration_seconds = Column(Integer, default=0)
    status = Column(String(30), nullable=False, default="Completed")  # Completed, Dropped, Unanswered
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True, default="")
