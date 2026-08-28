from sqlalchemy import Column, String, Float, Integer, JSON
from app.database.base import Base

class Facility(Base):
    __tablename__ = "facilities"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # Office, Lab, Dining, Residential, Academic, DataCenter
    area = Column(Float, nullable=False)       # sq meters
    capacity = Column(Integer, nullable=False) # max persons
    operating_hours = Column(String(50), default="08:00-18:00")
    floor_count = Column(Integer, default=4)
    location = Column(String(100), default="Main Campus")
    sustainability_score = Column(Float, default=75.0)
    metadata_json = Column(JSON, nullable=True)
