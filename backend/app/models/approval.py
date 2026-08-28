from sqlalchemy import Column, String, DateTime, ForeignKey
from app.database.base import Base
import datetime

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(50), primary_key=True, index=True)
    recommendation_id = Column(String(50), ForeignKey("recommendations.id"), index=True)
    reviewer = Column(String(100), default="Operations Manager")
    status = Column(String(30), default="PENDING")  # PENDING, APPROVED, REJECTED, MODIFIED
    comment = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
