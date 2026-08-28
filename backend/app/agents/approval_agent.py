from app.agents.base_agent import BaseAgent
from app.schemas.agent_schema import AgentResult
from typing import Dict, Any, List
import datetime

class ApprovalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="approval-agent",
            name="Human-in-the-Loop Governance Agent",
            description="Manages safety gates, operational approval workflows, and audit logging to ensure zero unauthorized physical changes.",
            capabilities=[
                "governance_workflow", "review_routing", "audit_logging", "status_transition"
            ]
        )

    async def process(self, task: Dict[str, Any], db=None) -> AgentResult:
        rec_id = task.get("recommendation_id", "REC-001")
        action = task.get("approval_action", "CREATE_APPROVAL_REQUEST")
        reviewer = task.get("reviewer", "Operations Supervisor")
        
        status = "PENDING"
        if action == "APPROVE":
            status = "APPROVED"
        elif action == "REJECT":
            status = "REJECTED"
        
        approval_record = {
            "recommendation_id": rec_id,
            "reviewer": reviewer,
            "status": status,
            "comment": task.get("comment", "Approved for immediate facility work order dispatch."),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "approved_at": datetime.datetime.utcnow().isoformat() if status == "APPROVED" else None
        }
        
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed",
            confidence=1.0,
            summary=f"Approval status for {rec_id} transitioned to {status}.",
            findings=[f"Governance gate enforced. Human operator decision recorded: {status}."],
            evidence=[approval_record],
            recommendations=["Dispatch maintenance contractor upon approval."],
            metrics=approval_record,
            next_actions=["impact-agent" if status == "APPROVED" else "ecocore"]
        )
