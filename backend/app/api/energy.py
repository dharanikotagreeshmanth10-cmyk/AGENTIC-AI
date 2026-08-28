from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.telemetry import EnergyReading
from app.models.anomaly import Anomaly
import datetime

router = APIRouter(prefix="/energy", tags=["Energy"])

@router.get("/current")
def get_current_energy(facility_id: str = "BUILDING-B", db: Session = Depends(get_db)):
    reading = db.query(EnergyReading).filter(EnergyReading.facility_id == facility_id).order_by(EnergyReading.timestamp.desc()).first()
    return reading or {
        "facility_id": facility_id,
        "energy_kwh": 580.0,
        "hvac_load": 310.0,
        "lighting_load": 140.0,
        "equipment_load": 130.0,
        "peak_demand_kw": 98.4
    }

@router.get("/history")
def get_energy_history(facility_id: str = "BUILDING-B", days: int = 7, db: Session = Depends(get_db)):
    readings = db.query(EnergyReading).filter(EnergyReading.facility_id == facility_id).order_by(EnergyReading.timestamp.desc()).limit(days * 12).all()
    return list(reversed(readings))

@router.get("/forecast")
def get_energy_forecast(facility_id: str = "BUILDING-B"):
    # 24-hour predictive forecast points
    now = datetime.datetime.utcnow().replace(minute=0, second=0)
    forecast_points = []
    for i in range(24):
        t = now + datetime.timedelta(hours=i)
        hour = t.hour
        base = 350.0 if (hour < 7 or hour > 20) else 540.0
        forecast_points.append({
            "timestamp": t.isoformat(),
            "predicted_kwh": round(base + (50 * (hour % 5)), 1),
            "lower_bound": round(base * 0.9, 1),
            "upper_bound": round(base * 1.15, 1)
        })
    return {"facility_id": facility_id, "horizon_hours": 24, "forecast": forecast_points}

@router.get("/anomalies")
def get_energy_anomalies(db: Session = Depends(get_db)):
    return db.query(Anomaly).filter(Anomaly.resource_type == "ENERGY").all()
