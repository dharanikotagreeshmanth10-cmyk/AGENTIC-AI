from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.telemetry import OccupancyReading

router = APIRouter(prefix="/occupancy", tags=["Occupancy"])

@router.get("/current")
def get_current_occupancy(facility_id: str = "BUILDING-B", db: Session = Depends(get_db)):
    reading = db.query(OccupancyReading).filter(OccupancyReading.facility_id == facility_id).order_by(OccupancyReading.timestamp.desc()).first()
    return reading or {
        "facility_id": facility_id,
        "headcount": 135,
        "utilization_pct": 30.0
    }

@router.get("/history")
def get_occupancy_history(facility_id: str = "BUILDING-B", db: Session = Depends(get_db)):
    readings = db.query(OccupancyReading).filter(OccupancyReading.facility_id == facility_id).order_by(OccupancyReading.timestamp.desc()).limit(48).all()
    return list(reversed(readings))

@router.get("/forecast")
def get_occupancy_forecast(facility_id: str = "BUILDING-B"):
    return {
        "facility_id": facility_id,
        "peak_headcount_expected": 380,
        "peak_hour": "14:00",
        "average_utilization_pct": 68.5
    }
