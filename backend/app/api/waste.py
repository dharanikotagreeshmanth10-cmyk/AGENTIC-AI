from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.telemetry import WasteReading

router = APIRouter(prefix="/waste", tags=["Waste"])

@router.get("/history")
def get_waste_history(facility_id: str = "BUILDING-H", db: Session = Depends(get_db)):
    readings = db.query(WasteReading).filter(WasteReading.facility_id == facility_id).order_by(WasteReading.timestamp.desc()).limit(30).all()
    return list(reversed(readings))

@router.get("/analysis")
def get_waste_analysis():
    return {
        "campus_total_waste_kg": 5420.0,
        "recycling_kg": 2180.0,
        "compost_kg": 1340.0,
        "landfill_kg": 1900.0,
        "diversion_rate_pct": 64.9,
        "target_diversion_pct": 75.0,
        "contamination_rate_pct": 12.4,
        "co2_avoided_kg": 3924.0
    }
