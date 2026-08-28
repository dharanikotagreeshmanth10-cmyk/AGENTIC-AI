from sqlalchemy import Column, String, Float, DateTime, JSON, Integer
from app.database.base import Base
import datetime

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String(50), primary_key=True, index=True)
    facility_id = Column(String(50), index=True)
    resource_type = Column(String(50), nullable=False) # ENERGY, WATER, WASTE, AIR, OCCUPANCY
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=False)
    severity = Column(String(30), default="HIGH")     # CRITICAL, HIGH, MEDIUM, LOW
    actual_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    deviation_pct = Column(Float, nullable=False)
    confidence = Column(Float, default=0.92)
    estimated_monthly_loss = Column(Float, default=0.0) # INR / units
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(30), default="ACTIVE")      # ACTIVE, INVESTIGATING, RESOLVED, DISMISSED
    evidence_json = Column(JSON, default=list)
