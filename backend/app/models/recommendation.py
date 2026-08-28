from sqlalchemy import Column, String, Float, DateTime, JSON
from app.database.base import Base
import datetime

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=False)
    facility_id = Column(String(50), index=True)
    category = Column(String(50), default="HVAC")       # HVAC, WATER, LIGHTING, VENTILATION, WASTE, BEHAVIORAL
    priority = Column(String(30), default="HIGH")       # CRITICAL, HIGH, MEDIUM, LOW
    confidence = Column(Float, default=0.91)
    estimated_energy_saving = Column(Float, default=0.0) # kWh/mo
    estimated_water_saving = Column(Float, default=0.0)  # L/mo
    estimated_cost_saving = Column(Float, default=0.0)   # INR/mo
    estimated_co2_reduction = Column(Float, default=0.0) # Tonnes/mo
    implementation_cost = Column(Float, default=0.0)     # INR
    roi = Column(Float, default=2.5)                     # Ratio
    payback_period_months = Column(Float, default=2.0)
    risk = Column(String(30), default="LOW")             # LOW, MEDIUM, HIGH
    evidence = Column(JSON, default=list)
    status = Column(String(30), default="PENDING")       # PENDING, APPROVED, REJECTED, MODIFIED, IMPLEMENTED, MONITORING, COMPLETED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
