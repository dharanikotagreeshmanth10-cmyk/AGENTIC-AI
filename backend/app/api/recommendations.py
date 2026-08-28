from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("")
def get_all_recommendations(db: Session = Depends(get_db)):
    return db.query(Recommendation).order_by(Recommendation.created_at.desc()).all()

@router.get("/{rec_id}")
def get_recommendation_by_id(rec_id: str, db: Session = Depends(get_db)):
    return db.query(Recommendation).filter(Recommendation.id == rec_id).first()
