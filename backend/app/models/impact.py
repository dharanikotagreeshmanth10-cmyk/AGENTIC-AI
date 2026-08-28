from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Integer
from app.database.base import Base
import datetime

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String(50), primary_key=True, index=True)
    recommendation_id = Column(String(50), ForeignKey("recommendations.id"))
    facility_id = Column(String(50), index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(30), default="MONITORING")
    implemented_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    before_energy_kwh = Column(Float, default=0.0)
    after_energy_kwh = Column(Float, default=0.0)
    energy_saved_kwh = Column(Float, default=0.0)

    before_water_liters = Column(Float, default=0.0)
    after_water_liters = Column(Float, default=0.0)
    water_saved_liters = Column(Float, default=0.0)

    before_cost_inr = Column(Float, default=0.0)
    after_cost_inr = Column(Float, default=0.0)
    money_saved_inr = Column(Float, default=0.0)

    before_co2_tonnes = Column(Float, default=0.0)
    after_co2_tonnes = Column(Float, default=0.0)
    co2_avoided_tonnes = Column(Float, default=0.0)
    
    metrics_json = Column(JSON, default=dict)

class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(String(50), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    total_energy_saved_kwh = Column(Float, default=0.0)
    total_water_saved_liters = Column(Float, default=0.0)
    total_money_saved_inr = Column(Float, default=0.0)
    total_co2_avoided_tonnes = Column(Float, default=0.0)
    total_waste_diverted_kg = Column(Float, default=0.0)
    recommendations_issued = Column(Integer, default=0)
    recommendations_approved = Column(Integer, default=0)
    recommendations_implemented = Column(Integer, default=0)
    interventions_successful = Column(Integer, default=0)
    success_rate_pct = Column(Float, default=95.0)
