from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import datetime
import time
import traceback
from app.schemas.agent_schema import AgentResult

class BaseAgent(ABC):
    def __init__(
        self,
        agent_id: str,
        name: str,
        description: str,
        capabilities: List[str]
    ):
        self.agent_id = agent_id
        self.name = name
        self.description = description
        self.capabilities = capabilities
        self.status = "ONLINE"
        self.current_task: Optional[str] = None
        self.confidence: float = 0.95
        self.health_score: float = 100.0
        self.last_execution_time = datetime.datetime.utcnow()
        self.execution_duration_ms: float = 0.0

    def initialize(self):
        self.status = "ONLINE"
        self.health_score = 100.0

    def validate_input(self, task_data: Dict[str, Any]) -> bool:
        return True

    async def execute(self, task: Dict[str, Any], db=None) -> AgentResult:
        start_time = time.time()
        self.status = "BUSY"
        self.current_task = task.get("id", "TASK-UNKNOWN")
        try:
            if not self.validate_input(task):
                raise ValueError(f"Invalid input provided to agent {self.agent_id}")
            
            result = await self.process(task, db)
            self.status = "ONLINE"
            self.last_execution_time = datetime.datetime.utcnow()
            self.execution_duration_ms = round((time.time() - start_time) * 1000, 2)
            self.health_score = min(100.0, self.health_score + 1.0)
            return result
        except Exception as e:
            self.handle_error(e)
            fallback_result = self.fallback_execution(task, db, e)
            self.execution_duration_ms = round((time.time() - start_time) * 1000, 2)
            return fallback_result

    @abstractmethod
    async def process(self, task: Dict[str, Any], db) -> AgentResult:
        pass

    def fallback_execution(self, task: Dict[str, Any], db, error: Exception) -> AgentResult:
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed_fallback",
            confidence=0.70,
            summary=f"Agent {self.name} encountered an issue ({str(error)}). Returned baseline statistical fallback.",
            findings=["Statistical fallback heuristic applied."],
            evidence=[{"error": str(error), "fallback": True}],
            recommendations=["Verify telemetry stream connection."],
            metrics={"fallback_applied": True}
        )

    def handle_error(self, error: Exception):
        self.status = "ERROR"
        self.health_score = max(40.0, self.health_score - 15.0)
        print(f"[AGENT ERROR] {self.agent_id}: {str(error)}\n{traceback.format_exc()}")

    def health_check(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "status": self.status,
            "health_score": self.health_score,
            "confidence": self.confidence,
            "last_execution": self.last_execution_time.isoformat() if self.last_execution_time else None,
            "duration_ms": self.execution_duration_ms
        }
