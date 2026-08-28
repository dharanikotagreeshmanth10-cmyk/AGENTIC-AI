from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Person or Team Name")
    phone: str = Field(..., min_length=6, max_length=50, description="Phone Number")
    department: str = Field(..., min_length=2, max_length=100, description="Department or Facility Zone")
    role: Optional[str] = Field("Operational Lead", max_length=100)
    priority: str = Field("Medium", description="Low, Medium, High, Critical")
    reason: str = Field(..., min_length=3, max_length=500, description="Reason for Call")
    notes: Optional[str] = Field("", max_length=1000)

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class ContactStatusUpdate(BaseModel):
    status: str = Field(..., description="Available, Calling, Completed, Pending")

class ContactResponse(BaseModel):
    id: str
    name: str
    phone: str
    department: str
    role: Optional[str]
    priority: str
    status: str
    reason: str
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CallLogCreate(BaseModel):
    contact_id: Optional[str] = None
    contact_name: str
    phone: str
    department: str
    priority: str
    reason: str
    duration_seconds: int = 0
    status: str = "Completed"
    notes: Optional[str] = ""

class CallLogResponse(BaseModel):
    id: str
    contact_id: Optional[str]
    contact_name: str
    phone: str
    department: str
    priority: str
    reason: str
    duration_seconds: int
    status: str
    started_at: datetime
    ended_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
