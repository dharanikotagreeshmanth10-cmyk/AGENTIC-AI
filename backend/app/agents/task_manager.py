import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.schemas.agent_schema import TaskResponse

class TaskManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TaskManager, cls).__new__(cls)
            cls._instance.tasks: Dict[str, Dict[str, Any]] = {}
        return cls._instance

    def create_task(self, title: str, description: str = "", priority: str = "MEDIUM", requested_by: str = "EcoCore", assigned_agents: List[str] = None) -> Dict[str, Any]:
        task_id = f"TASK-{uuid.uuid4().hex[:6].upper()}"
        task = {
            "id": task_id,
            "title": title,
            "description": description,
            "priority": priority,
            "requested_by": requested_by,
            "assigned_agents": assigned_agents or [],
            "status": "QUEUED",
            "progress": 0.0,
            "created_at": datetime.datetime.utcnow(),
            "started_at": None,
            "completed_at": None,
            "results": {},
            "confidence": 0.92
        }
        self.tasks[task_id] = task
        return task

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self.tasks.get(task_id)

    def get_all_tasks(self, limit: int = 50) -> List[Dict[str, Any]]:
        return list(sorted(self.tasks.values(), key=lambda t: t["created_at"], reverse=True))[:limit]

    def update_task_status(self, task_id: str, status: str, progress: float = None):
        if task_id in self.tasks:
            self.tasks[task_id]["status"] = status
            if progress is not None:
                self.tasks[task_id]["progress"] = progress
            if status == "RUNNING" and not self.tasks[task_id]["started_at"]:
                self.tasks[task_id]["started_at"] = datetime.datetime.utcnow()
            elif status in ["COMPLETED", "FAILED", "CANCELLED"]:
                self.tasks[task_id]["completed_at"] = datetime.datetime.utcnow()

    def record_result(self, task_id: str, agent_id: str, result: Any):
        if task_id in self.tasks:
            if isinstance(result, dict):
                self.tasks[task_id]["results"][agent_id] = result
            else:
                self.tasks[task_id]["results"][agent_id] = result.dict() if hasattr(result, "dict") else str(result)

task_manager = TaskManager()
