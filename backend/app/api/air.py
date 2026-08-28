from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.telemetry import AirQualityReading
from app.models.anomaly import Anomaly

router = APIRouter(prefix="/air", tags=["Air Quality"])

@router.get("/current")
def get_current_air(facility_id: str = "BUILDING-E", db: Session = Depends(get_db)):
    reading = db.query(AirQualityReading).filter(AirQualityReading.facility_id == facility_id).order_by(AirQualityReading.timestamp.desc()).first()
    return reading or {
        "facility_id": facility_id,
        "aqi": 68.0,
        "pm25": 18.4,
        "pm10": 29.1,
        "co2": 1180.0,
        "temperature": 24.2,
        "humidity": 52.0
    }

@router.get("/history")
def get_air_history(facility_id: str = "BUILDING-E", db: Session = Depends(get_db)):
    readings = db.query(AirQualityReading).filter(AirQualityReading.facility_id == facility_id).order_by(AirQualityReading.timestamp.desc()).limit(48).all()
    return list(reversed(readings))

@router.get("/anomalies")
def get_air_anomalies(db: Session = Depends(get_db)):
    return db.query(Anomaly).filter(Anomaly.resource_type == "AIR").all()
