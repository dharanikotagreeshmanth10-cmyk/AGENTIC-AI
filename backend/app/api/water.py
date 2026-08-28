from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.telemetry import WaterReading
from app.models.anomaly import Anomaly
import datetime

router = APIRouter(prefix="/water", tags=["Water"])

@router.get("/current")
def get_current_water(facility_id: str = "BUILDING-B", db: Session = Depends(get_db)):
    reading = db.query(WaterReading).filter(WaterReading.facility_id == facility_id).order_by(WaterReading.timestamp.desc()).first()
    return reading or {
        "facility_id": facility_id,
        "water_liters": 2250.0,
        "flow_rate_lpm": 75.2,
        "leak_probability": 0.96
    }

@router.get("/history")
def get_water_history(facility_id: str = "BUILDING-B", days: int = 7, db: Session = Depends(get_db)):
    readings = db.query(WaterReading).filter(WaterReading.facility_id == facility_id).order_by(WaterReading.timestamp.desc()).limit(days * 12).all()
    return list(reversed(readings))

@router.get("/leaks")
def get_water_leaks(db: Session = Depends(get_db)):
    return db.query(Anomaly).filter(Anomaly.resource_type == "WATER").all()

@router.get("/forecast")
def get_water_forecast(facility_id: str = "BUILDING-B"):
    now = datetime.datetime.utcnow().replace(minute=0, second=0)
    points = []
    for i in range(24):
        t = now + datetime.timedelta(hours=i)
        hour = t.hour
        nominal = 150.0 if (hour < 7 or hour > 20) else 850.0
        points.append({
            "timestamp": t.isoformat(),
            "predicted_liters": nominal if facility_id != "BUILDING-B" else nominal + 2250.0,
            "nominal_baseline": nominal,
            "leak_overhead": 2250.0 if facility_id == "BUILDING-B" else 0.0
        })
    return {"facility_id": facility_id, "forecast": points}
