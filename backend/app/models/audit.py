from sqlalchemy import Column, String, DateTime, JSON, Integer
from app.database.base import Base
import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    user = Column(String(100), default="EcoCore Engine")
    role = Column(String(50), default="ADMIN") # ADMIN, OPERATOR, VIEWER
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True)
    role = Column(String(30), default="ADMIN") # ADMIN, OPERATOR, VIEWER
