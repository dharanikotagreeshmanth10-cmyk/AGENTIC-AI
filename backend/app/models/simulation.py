from sqlalchemy import Column, String, Float, DateTime, JSON, Integer
from app.database.base import Base
import datetime

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(50), primary_key=True, index=True)
    facility_id = Column(String(50), index=True)
    title = Column(String(255), default="What-If Scenario")
    parameters = Column(JSON, default=dict)
    current_metrics = Column(JSON, default=dict)
    projected_metrics = Column(JSON, default=dict)
    savings_metrics = Column(JSON, default=dict)
    roi = Column(Float, default=0.0)
    payback_months = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
