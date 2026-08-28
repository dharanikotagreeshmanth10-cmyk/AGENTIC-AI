from sqlalchemy import Column, String, Float, DateTime, JSON
from app.database.base import Base
import datetime

class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    priority = Column(String(30), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    requested_by = Column(String(100), default="EcoCore")
    assigned_agents = Column(JSON, default=list)
    status = Column(String(30), default="QUEUED")  # QUEUED, PLANNING, RUNNING, WAITING, COMPLETED, FAILED, CANCELLED
    progress = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    results = Column(JSON, default=dict)
    confidence = Column(Float, default=0.90)
