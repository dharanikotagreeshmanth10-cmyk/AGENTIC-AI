from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.impact import Intervention, ImpactMetric

router = APIRouter(prefix="/impact", tags=["Impact Verification"])

@router.get("")
def get_impact_summary(db: Session = Depends(get_db)):
    metrics = db.query(ImpactMetric).first()
    interventions = db.query(Intervention).order_by(Intervention.implemented_at.desc()).all()
    
    # Monthly breakdown for charts
    monthly_series = [
        {"month": "May", "water_saved_kL": 48.0, "energy_saved_MWh": 11.2, "money_saved_kINR": 94.0, "co2_avoided_t": 9.2},
        {"month": "Jun", "water_saved_kL": 52.5, "energy_saved_MWh": 12.8, "money_saved_kINR": 105.0, "co2_avoided_t": 10.5},
        {"month": "Jul", "water_saved_kL": 51.0, "energy_saved_MWh": 14.1, "money_saved_kINR": 112.0, "co2_avoided_t": 11.6},
        {"month": "Aug", "water_saved_kL": 54.6, "energy_saved_MWh": 15.5, "money_saved_kINR": 124.0, "co2_avoided_t": 12.7}
    ]
    
    return {
        "cumulative_metrics": metrics,
        "interventions": interventions,
        "monthly_history": monthly_series
    }

@router.get("/{intervention_id}")
def get_intervention_detail(intervention_id: str, db: Session = Depends(get_db)):
    return db.query(Intervention).filter(Intervention.id == intervention_id).first()
