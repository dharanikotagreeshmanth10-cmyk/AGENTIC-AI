from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/generate")
def generate_report(db: Session = Depends(get_db)):
    return ReportGenerator.generate_sustainability_report(db)
