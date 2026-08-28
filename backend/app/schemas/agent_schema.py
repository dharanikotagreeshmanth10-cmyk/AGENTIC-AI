from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AgentCapability(BaseModel):
    name: str
    description: str

class AgentStatusEnum(str):
    ONLINE = "ONLINE"
    BUSY = "BUSY"
    IDLE = "IDLE"
    ERROR = "ERROR"
    OFFLINE = "OFFLINE"
    WAITING = "WAITING"

class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    capabilities: List[str]
    status: str = "ONLINE"
    current_task: Optional[str] = None
    confidence: float = 0.95
    last_execution_time: datetime
    execution_duration_ms: float = 100.0
    health_score: float = 98.0

class AgentResult(BaseModel):
    agent_id: str
    task_id: str
    status: str = "completed"
    confidence: float = 0.90
    summary: str
    findings: List[str] = Field(default_factory=list)
    evidence: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    next_actions: List[str] = Field(default_factory=list)

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "MEDIUM"
    requested_by: str = "User"
    assigned_agents: List[str] = Field(default_factory=list)

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: str
    requested_by: str
    assigned_agents: List[str]
    status: str
    progress: float
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    results: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 0.90
