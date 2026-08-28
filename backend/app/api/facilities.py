from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.facility import Facility
from app.models.anomaly import Anomaly

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("")
def get_all_facilities(db: Session = Depends(get_db)):
    return db.query(Facility).all()

@router.get("/benchmark")
def get_facilities_benchmark(db: Session = Depends(get_db)):
    facilities = db.query(Facility).order_by(Facility.sustainability_score.desc()).all()
    result = []
    for idx, f in enumerate(facilities):
        anomalies_count = db.query(Anomaly).filter(Anomaly.facility_id == f.id, Anomaly.status == "ACTIVE").count()
        status_color = "GREEN" if f.sustainability_score >= 78.0 else ("YELLOW" if f.sustainability_score >= 65.0 else "RED")
        result.append({
            "id": f.id,
            "name": f.name,
            "type": f.type,
            "area": f.area,
            "capacity": f.capacity,
            "sustainability_score": f.sustainability_score,
            "rank": idx + 1,
            "status_color": status_color,
            "active_anomalies": anomalies_count
        })
    return result

@router.get("/{facility_id}")
def get_facility_by_id(facility_id: str, db: Session = Depends(get_db)):
    f = db.query(Facility).filter(Facility.id == facility_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Facility not found")
    anomalies = db.query(Anomaly).filter(Anomaly.facility_id == facility_id).all()
    return {"facility": f, "anomalies": anomalies}
