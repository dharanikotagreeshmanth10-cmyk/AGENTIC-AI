from sqlalchemy import Column, String, Float, DateTime, JSON, Integer
from app.database.base import Base
import datetime

class AgentModel(Base):
    __tablename__ = "agents"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    capabilities = Column(JSON, default=list)
    status = Column(String(30), default="ONLINE")  # ONLINE, BUSY, IDLE, ERROR, OFFLINE, WAITING
    current_task = Column(String(255), nullable=True)
    confidence = Column(Float, default=0.95)
    last_execution_time = Column(DateTime, default=datetime.datetime.utcnow)
    execution_duration_ms = Column(Float, default=120.0)
    health_score = Column(Float, default=98.0)

class AgentEvent(Base):
    __tablename__ = "agent_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    agent_id = Column(String(50), index=True)
    task_id = Column(String(50), index=True)
    event_type = Column(String(50), nullable=False)  # AGENT_STARTED, AGENT_PROGRESS, AGENT_COMPLETED, etc.
    message = Column(String(500), nullable=False)
    payload = Column(JSON, nullable=True)

class AgentResultModel(Base):
    __tablename__ = "agent_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(50), index=True)
    agent_id = Column(String(50), index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(30), default="completed")
    confidence = Column(Float, default=0.90)
    summary = Column(String(1000), nullable=False)
    findings = Column(JSON, default=list)
    evidence = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    metrics = Column(JSON, default=dict)
    next_actions = Column(JSON, default=list)
