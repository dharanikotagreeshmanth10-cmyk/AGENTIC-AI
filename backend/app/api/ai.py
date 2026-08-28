from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.agents.ecocore import ecocore
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/ai", tags=["AI Orchestration"])

@router.post("/chat")
async def chat_with_ecocore(payload: dict = Body(...), db: Session = Depends(get_db)):
    query = payload.get("message", "Investigate sustainability problems")
    facility_id = payload.get("facility_id", "BUILDING-B")
    
    # Run through full supervisor planning and multi-agent DAG
    response = await ecocore.plan_and_execute(query, facility_id, db)
    return response

@router.post("/investigate")
async def trigger_investigation(payload: dict = Body(...), db: Session = Depends(get_db)):
    anomaly_id = payload.get("anomaly_id", "ANOM-B-WATER")
    facility_id = payload.get("facility_id", "BUILDING-B")
    query = f"Investigate anomaly {anomaly_id} in {facility_id}"
    return await ecocore.plan_and_execute(query, facility_id, db)

@router.post("/recommend")
async def trigger_recommendation(payload: dict = Body(...), db: Session = Depends(get_db)):
    facility_id = payload.get("facility_id", "BUILDING-B")
    return await ecocore.plan_and_execute("Generate high ROI sustainability optimization actions", facility_id, db)
