from fastapi import APIRouter
from app.agents.agent_registry import agent_registry
from app.agents.task_manager import task_manager
from app.agents.event_bus import event_bus

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("")
def get_all_agents():
    agents = agent_registry.get_all_agents()
    return [{
        "id": a.agent_id,
        "name": a.name,
        "description": a.description,
        "capabilities": a.capabilities,
        "status": a.status,
        "current_task": a.current_task,
        "confidence": a.confidence,
        "health_score": a.health_score,
        "execution_duration_ms": a.execution_duration_ms,
        "last_execution_time": a.last_execution_time.isoformat() if a.last_execution_time else None
    } for a in agents]

@router.get("/health")
def get_agents_health():
    return agent_registry.get_agent_health()

@router.get("/tasks")
def get_agent_tasks(limit: int = 50):
    return task_manager.get_all_tasks(limit)

@router.get("/timeline")
def get_agents_timeline(limit: int = 50):
    return event_bus.get_history(limit)

@router.get("/{agent_id}")
def get_agent_by_id(agent_id: str):
    agent = agent_registry.get_agent(agent_id)
    if not agent:
        return {"error": "Agent not found"}
    return agent.health_check()
