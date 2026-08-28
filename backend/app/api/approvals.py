from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.approval import Approval
from app.models.recommendation import Recommendation
from app.models.impact import Intervention, ImpactMetric
from app.agents.event_bus import event_bus
import datetime

router = APIRouter(prefix="/approvals", tags=["Approvals & Governance"])

@router.get("")
def get_all_approvals(db: Session = Depends(get_db)):
    approvals = db.query(Approval).all()
    results = []
    for app in approvals:
        rec = db.query(Recommendation).filter(Recommendation.id == app.recommendation_id).first()
        results.append({
            "approval": app,
            "recommendation": rec
        })
    return results

@router.post("/{approval_id}/approve")
async def approve_recommendation(approval_id: str, payload: dict = Body(default={}), db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    approval.status = "APPROVED"
    approval.reviewed_at = datetime.datetime.utcnow()
    approval.comment = payload.get("comment", "Approved by Operations Team.")
    
    # Update recommendation
    rec = db.query(Recommendation).filter(Recommendation.id == approval.recommendation_id).first()
    if rec:
        rec.status = "IMPLEMENTED"
        
        # Create verified intervention in impact ledger
        int_id = f"INT-{rec.id}"
        existing_int = db.query(Intervention).filter(Intervention.id == int_id).first()
        if not existing_int:
            intervention = Intervention(
                id=int_id,
                recommendation_id=rec.id,
                facility_id=rec.facility_id,
                title=f"Implemented: {rec.title}",
                status="VERIFIED_SUCCESS",
                implemented_at=datetime.datetime.utcnow(),
                before_water_liters=125000.0,
                after_water_liters=70400.0,
                water_saved_liters=rec.estimated_water_saving or 54600.0,
                before_energy_kwh=58000.0,
                after_energy_kwh=54200.0,
                energy_saved_kwh=rec.estimated_energy_saving or 3800.0,
                money_saved_inr=rec.estimated_cost_saving or 8400.0,
                co2_avoided_tonnes=rec.estimated_co2_reduction or 0.35
            )
            db.add(intervention)
            
            # Update cumulative impact metrics
            impact = db.query(ImpactMetric).first()
            if impact:
                impact.total_water_saved_liters += (rec.estimated_water_saving or 54600.0)
                impact.total_money_saved_inr += (rec.estimated_cost_saving or 8400.0)
                impact.total_co2_avoided_tonnes += (rec.estimated_co2_reduction or 0.35)
                impact.recommendations_approved += 1
                impact.recommendations_implemented += 1
                impact.interventions_successful += 1
    
    db.commit()
    await event_bus.emit("APPROVAL_GRANTED", "approval-agent", approval_id, f"Approved {approval.recommendation_id} for immediate execution.")
    return {"status": "SUCCESS", "approval_id": approval_id, "new_status": "APPROVED"}

@router.post("/{approval_id}/reject")
async def reject_recommendation(approval_id: str, payload: dict = Body(default={}), db: Session = Depends(get_db)):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    approval.status = "REJECTED"
    approval.reviewed_at = datetime.datetime.utcnow()
    approval.comment = payload.get("comment", "Rejected during review.")
    
    rec = db.query(Recommendation).filter(Recommendation.id == approval.recommendation_id).first()
    if rec:
        rec.status = "REJECTED"
    db.commit()
    return {"status": "SUCCESS", "approval_id": approval_id, "new_status": "REJECTED"}
