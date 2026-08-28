from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.anomaly import Anomaly
import datetime

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])

# Demo fallback data matching the Anomaly model fields
DEMO_ANOMALIES = [
    {
        "id": "ANOM-001",
        "facility_id": "BUILDING-A",
        "resource_type": "WATER",
        "title": "Unusual Water Consumption Spike",
        "description": "Water usage is 53.75% above baseline. Possible pipe burst or unreported irrigation event.",
        "severity": "CRITICAL",
        "actual_value": 18450.0,
        "expected_value": 12000.0,
        "deviation_pct": 53.75,
        "confidence": 0.97,
        "estimated_monthly_loss": 32400.0,
        "detected_at": datetime.datetime.utcnow().isoformat(),
        "status": "ACTIVE",
        "evidence_json": [],
    },
    {
        "id": "ANOM-002",
        "facility_id": "BUILDING-B",
        "resource_type": "ENERGY",
        "title": "Off-Hours HVAC Overconsumption",
        "description": "HVAC load 38% above expected during non-occupancy window (02:00–06:00).",
        "severity": "HIGH",
        "actual_value": 820.0,
        "expected_value": 594.0,
        "deviation_pct": 38.05,
        "confidence": 0.93,
        "estimated_monthly_loss": 18700.0,
        "detected_at": datetime.datetime.utcnow().isoformat(),
        "status": "ACTIVE",
        "evidence_json": [],
    },
    {
        "id": "ANOM-003",
        "facility_id": "BUILDING-C",
        "resource_type": "WATER",
        "title": "Nocturnal Flow Anomaly",
        "description": "Sustained 75.2 L/min flow detected between midnight and 4 AM — indicative of subsurface leak.",
        "severity": "CRITICAL",
        "actual_value": 4512.0,
        "expected_value": 200.0,
        "deviation_pct": 2156.0,
        "confidence": 0.99,
        "estimated_monthly_loss": 61000.0,
        "detected_at": datetime.datetime.utcnow().isoformat(),
        "status": "INVESTIGATING",
        "evidence_json": [],
    },
    {
        "id": "ANOM-004",
        "facility_id": "BUILDING-D",
        "resource_type": "AIR",
        "title": "PM2.5 Threshold Exceeded",
        "description": "Particulate matter PM2.5 reading at 68 µg/m³ — 2.3x above WHO safe limit.",
        "severity": "HIGH",
        "actual_value": 68.0,
        "expected_value": 30.0,
        "deviation_pct": 126.67,
        "confidence": 0.91,
        "estimated_monthly_loss": 5500.0,
        "detected_at": datetime.datetime.utcnow().isoformat(),
        "status": "ACTIVE",
        "evidence_json": [],
    },
    {
        "id": "ANOM-005",
        "facility_id": "BUILDING-E",
        "resource_type": "ENERGY",
        "title": "Lighting Load Deviation",
        "description": "Lighting circuit drawing 22% more power than scheduled — ballast failure suspected.",
        "severity": "MEDIUM",
        "actual_value": 195.0,
        "expected_value": 160.0,
        "deviation_pct": 21.88,
        "confidence": 0.88,
        "estimated_monthly_loss": 7200.0,
        "detected_at": datetime.datetime.utcnow().isoformat(),
        "status": "ACTIVE",
        "evidence_json": [],
    },
]


@router.get("")
def get_all_anomalies(db: Session = Depends(get_db)):
    """Return all anomalies across all resource types. Falls back to demo data if DB is empty."""
    rows = db.query(Anomaly).order_by(Anomaly.detected_at.desc()).all()
    if rows:
        return rows
    # Demo fallback — returns fresh timestamps each request
    now = datetime.datetime.utcnow().isoformat()
    return [{**a, "detected_at": now} for a in DEMO_ANOMALIES]
