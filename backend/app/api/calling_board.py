import uuid
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.mongodb import get_collection, is_connected
from app.models.calling_board import CallingContactModel, CallHistoryModel
from app.schemas.calling_board_schema import (
    ContactCreate, ContactUpdate, ContactStatusUpdate, ContactResponse,
    CallLogCreate, CallLogResponse
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/calling-board", tags=["Calling Board"])

INITIAL_SEED_CONTACTS = [
    {
        "id": "CALL-001",
        "name": "Dr. Elena Vance",
        "phone": "+1 (555) 234-8901",
        "department": "Water Intelligence & Hydrology",
        "role": "Lead Hydrologist",
        "priority": "Critical",
        "status": "Available",
        "reason": "Zone-4 Pressure Anomaly & Valve Delta Review",
        "notes": "Direct line to primary hydrologic control desk.",
    },
    {
        "id": "CALL-002",
        "name": "Marcus Reed",
        "phone": "+1 (555) 876-5432",
        "department": "HQ Sustainability Operations",
        "role": "Facility Director",
        "priority": "High",
        "status": "Available",
        "reason": "Campus-wide Water Consumption Threshold Advisory",
        "notes": "Emergency override authorization holder.",
    },
    {
        "id": "CALL-003",
        "name": "Aisha Patel",
        "phone": "+1 (555) 345-6789",
        "department": "Field Engineering & Leak Dispatch",
        "role": "Chief Maintenance Engineer",
        "priority": "Critical",
        "status": "Calling",
        "reason": "Underground Main Line Acoustic Leak Alert (Building-B)",
        "notes": "Field response team equipped with ultrasonic sensors.",
    },
    {
        "id": "CALL-004",
        "name": "David Kim",
        "phone": "+1 (555) 654-3210",
        "department": "Water Quality & Treatment Lab",
        "role": "Water Quality Specialist",
        "priority": "Medium",
        "status": "Available",
        "reason": "TDS & Chlorine Disinfection Verification Batch #41",
        "notes": "Laboratory testing facility Building-E.",
    },
    {
        "id": "CALL-005",
        "name": "Sarah Jenkins",
        "phone": "+1 (555) 987-1234",
        "department": "Cooling Towers & Greywater Plant",
        "role": "HVAC Resource Lead",
        "priority": "Low",
        "status": "Completed",
        "reason": "Routine Chiller Loop Make-Up Water Optimization",
        "notes": "Completed morning inspection.",
    }
]

INITIAL_SEED_CALLS = [
    {
        "id": "LOG-101",
        "contact_id": "CALL-005",
        "contact_name": "Sarah Jenkins",
        "phone": "+1 (555) 987-1234",
        "department": "Cooling Towers & Greywater Plant",
        "priority": "Low",
        "reason": "Routine Chiller Loop Make-Up Water Optimization",
        "duration_seconds": 142,
        "status": "Completed",
        "started_at": datetime.utcnow() - timedelta(minutes=45),
        "ended_at": datetime.utcnow() - timedelta(minutes=42),
        "notes": "Adjusted blowdown cycle. Expected savings: 450L/day."
    },
    {
        "id": "LOG-102",
        "contact_id": "CALL-002",
        "contact_name": "Marcus Reed",
        "phone": "+1 (555) 876-5432",
        "department": "HQ Sustainability Operations",
        "priority": "High",
        "reason": "Monthly Water Budget Verification",
        "duration_seconds": 218,
        "status": "Completed",
        "started_at": datetime.utcnow() - timedelta(hours=3),
        "ended_at": datetime.utcnow() - timedelta(hours=3, minutes=-4),
        "notes": "Budget approved with green incentive rebate."
    }
]

def seed_db_if_empty(db: Session):
    try:
        count = db.query(CallingContactModel).count()
        if count == 0:
            for item in INITIAL_SEED_CONTACTS:
                contact = CallingContactModel(
                    id=item["id"],
                    name=item["name"],
                    phone=item["phone"],
                    department=item["department"],
                    role=item["role"],
                    priority=item["priority"],
                    status=item["status"],
                    reason=item["reason"],
                    notes=item["notes"],
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                db.add(contact)
            
            for call in INITIAL_SEED_CALLS:
                log = CallHistoryModel(
                    id=call["id"],
                    contact_id=call["contact_id"],
                    contact_name=call["contact_name"],
                    phone=call["phone"],
                    department=call["department"],
                    priority=call["priority"],
                    reason=call["reason"],
                    duration_seconds=call["duration_seconds"],
                    status=call["status"],
                    started_at=call["started_at"],
                    ended_at=call["ended_at"],
                    notes=call["notes"]
                )
                db.add(log)
            db.commit()
    except Exception as e:
        logger.error(f"Error seeding calling board database: {e}")
        db.rollback()

@router.get("/contacts", response_model=List[ContactResponse])
def get_contacts(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    priority_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    seed_db_if_empty(db)
    query = db.query(CallingContactModel)

    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(CallingContactModel.status == status_filter)

    if priority_filter and priority_filter.upper() != "ALL":
        query = query.filter(CallingContactModel.priority == priority_filter)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (CallingContactModel.name.ilike(s)) |
            (CallingContactModel.department.ilike(s)) |
            (CallingContactModel.phone.ilike(s)) |
            (CallingContactModel.reason.ilike(s))
        )

    contacts = query.order_by(CallingContactModel.updated_at.desc()).all()
    return contacts

@router.post("/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    contact_id = f"CALL-{str(uuid.uuid4())[:8].upper()}"
    new_contact = CallingContactModel(
        id=contact_id,
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        department=payload.department.strip(),
        role=payload.role.strip() if payload.role else "Operational Lead",
        priority=payload.priority,
        status="Available",
        reason=payload.reason.strip(),
        notes=payload.notes.strip() if payload.notes else "",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    # If MongoDB connected, sync as well
    if is_connected():
        try:
            col = get_collection("calling_contacts")
            await col.insert_one({
                "id": new_contact.id,
                "name": new_contact.name,
                "phone": new_contact.phone,
                "department": new_contact.department,
                "role": new_contact.role,
                "priority": new_contact.priority,
                "status": new_contact.status,
                "reason": new_contact.reason,
                "notes": new_contact.notes,
                "created_at": new_contact.created_at,
                "updated_at": new_contact.updated_at
            })
        except Exception as e:
            logger.warning(f"MongoDB sync error: {e}")

    return new_contact

@router.patch("/contacts/{contact_id}/status", response_model=ContactResponse)
async def update_contact_status(contact_id: str, payload: ContactStatusUpdate, db: Session = Depends(get_db)):
    contact = db.query(CallingContactModel).filter(CallingContactModel.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    contact.status = payload.status
    contact.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contact)

    if is_connected():
        try:
            col = get_collection("calling_contacts")
            await col.update_one({"id": contact_id}, {"$set": {"status": payload.status, "updated_at": datetime.utcnow()}})
        except Exception as e:
            logger.warning(f"MongoDB update error: {e}")

    return contact

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    contact = db.query(CallingContactModel).filter(CallingContactModel.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()

    if is_connected():
        try:
            col = get_collection("calling_contacts")
            await col.delete_one({"id": contact_id})
        except Exception as e:
            logger.warning(f"MongoDB delete error: {e}")

    return None

@router.get("/history", response_model=List[CallLogResponse])
def get_call_history(db: Session = Depends(get_db)):
    seed_db_if_empty(db)
    logs = db.query(CallHistoryModel).order_by(CallHistoryModel.started_at.desc()).limit(100).all()
    return logs

@router.post("/calls", response_model=CallLogResponse, status_code=status.HTTP_201_CREATED)
async def log_call(payload: CallLogCreate, db: Session = Depends(get_db)):
    log_id = f"LOG-{str(uuid.uuid4())[:8].upper()}"
    ended_at = datetime.utcnow()
    started_at = ended_at - timedelta(seconds=max(payload.duration_seconds, 1))

    new_log = CallHistoryModel(
        id=log_id,
        contact_id=payload.contact_id,
        contact_name=payload.contact_name,
        phone=payload.phone,
        department=payload.department,
        priority=payload.priority,
        reason=payload.reason,
        duration_seconds=payload.duration_seconds,
        status=payload.status,
        started_at=started_at,
        ended_at=ended_at,
        notes=payload.notes or ""
    )

    db.add(new_log)

    # Also update contact status to "Completed" if contact_id exists
    if payload.contact_id:
        contact = db.query(CallingContactModel).filter(CallingContactModel.id == payload.contact_id).first()
        if contact:
            contact.status = "Completed"
            contact.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(new_log)

    if is_connected():
        try:
            col = get_collection("call_history")
            await col.insert_one({
                "id": new_log.id,
                "contact_id": new_log.contact_id,
                "contact_name": new_log.contact_name,
                "phone": new_log.phone,
                "department": new_log.department,
                "priority": new_log.priority,
                "reason": new_log.reason,
                "duration_seconds": new_log.duration_seconds,
                "status": new_log.status,
                "started_at": new_log.started_at,
                "ended_at": new_log.ended_at,
                "notes": new_log.notes
            })
        except Exception as e:
            logger.warning(f"MongoDB call history sync error: {e}")

    return new_log

@router.post("/seed")
def force_seed(db: Session = Depends(get_db)):
    # Clear existing and re-seed with fresh data
    db.query(CallingContactModel).delete()
    db.query(CallHistoryModel).delete()
    db.commit()
    seed_db_if_empty(db)
    return {"status": "SUCCESS", "message": "Calling board seeded successfully"}
