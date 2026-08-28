from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.facility import Facility
from app.models.anomaly import Anomaly
from app.models.recommendation import Recommendation
from app.models.impact import ImpactMetric, Intervention
from app.agents.agent_registry import agent_registry

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    impact = db.query(ImpactMetric).first()
    active_anomalies_count = db.query(Anomaly).filter(Anomaly.status == "ACTIVE").count()
    pending_recs_count = db.query(Recommendation).filter(Recommendation.status == "PENDING").count()
    facilities = db.query(Facility).all()
    avg_score = round(sum(f.sustainability_score for f in facilities) / max(1, len(facilities)), 1)
    
    return {
        "sustainability_score": avg_score,
        "active_anomalies": active_anomalies_count,
        "pending_recommendations": pending_recs_count,
        "total_energy_saved_kwh": impact.total_energy_saved_kwh if impact else 142500.0,
        "total_water_saved_liters": impact.total_water_saved_liters if impact else 642000.0,
        "total_money_saved_inr": impact.total_money_saved_inr if impact else 1125000.0,
        "total_co2_avoided_tonnes": impact.total_co2_avoided_tonnes if impact else 116.8,
        "waste_diverted_kg": impact.total_waste_diverted_kg if impact else 48200.0,
        "success_rate_pct": impact.success_rate_pct if impact else 95.8
    }

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    kpis = get_dashboard_kpis(db)
    anomalies = db.query(Anomaly).order_by(Anomaly.severity == "CRITICAL", Anomaly.detected_at.desc()).limit(5).all()
    recommendations = db.query(Recommendation).filter(Recommendation.status == "PENDING").limit(4).all()
    facilities = db.query(Facility).order_by(Facility.sustainability_score.desc()).all()
    agents_health = agent_registry.get_agent_health()
    interventions = db.query(Intervention).order_by(Intervention.implemented_at.desc()).limit(4).all()
    
    return {
        "kpis": kpis,
        "anomalies": anomalies,
        "recommendations": recommendations,
        "facilities": facilities,
        "agents_health": agents_health,
        "recent_interventions": interventions
    }
