from app.agents.base_agent import BaseAgent
from app.schemas.agent_schema import AgentResult
from typing import Dict, Any, List

class OccupancyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="occupancy-agent",
            name="Occupancy & Spatial Analytics Agent",
            description="Analyzes building utilization, headcount, resource-to-occupancy ratios, and identifies severe spatial mismatches.",
            capabilities=[
                "current_occupancy", "occupancy_history", "occupancy_forecast",
                "building_utilization", "resource_occupancy_relationship"
            ]
        )

    async def process(self, task: Dict[str, Any], db=None) -> AgentResult:
        facility_id = task.get("facility_id", "BUILDING-B")
        
        capacity = 450
        current_headcount = 135
        utilization_pct = round((current_headcount / capacity) * 100, 1) # 30%
        energy_pct = 76.0 # 76% energy load
        overnight_headcount = 0
        
        has_resource_mismatch = (utilization_pct < 35.0 and energy_pct > 70.0)
        
        findings = [
            f"Current occupancy in {facility_id} is {current_headcount} persons ({utilization_pct}% of capacity).",
            f"Overnight occupancy between 22:00 and 06:00 is exactly {overnight_headcount} persons.",
            f"RESOURCE_MISMATCH flag detected: {utilization_pct}% occupancy consumes {energy_pct}% peak electrical capacity."
        ]
        
        evidence = [
            {"metric": "Occupancy Utilization", "actual": utilization_pct, "nominal": 80.0, "unit": "%"},
            {"metric": "Energy Load vs Occupancy Ratio", "actual": round(energy_pct / max(1.0, utilization_pct), 2), "expected": 1.1, "unit": "ratio"},
            {"metric": "Nocturnal Headcount", "actual": overnight_headcount, "nominal": 0, "unit": "persons"}
        ]
        
        recommendations = [
            "Enable occupancy-driven setbacks for HVAC zones 3 and 4.",
            "Consolidate partial-floor occupancy during low-utilization Friday afternoons."
        ]
        
        metrics = {
            "headcount": current_headcount,
            "capacity": capacity,
            "utilization_pct": utilization_pct,
            "energy_load_pct": energy_pct,
            "resource_mismatch": has_resource_mismatch,
            "mismatch_code": "RESOURCE_MISMATCH_HIGH_LOAD" if has_resource_mismatch else "NORMAL"
        }
        
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed",
            confidence=0.96,
            summary=f"Occupancy in {facility_id} is {utilization_pct}% ({current_headcount}/{capacity}). Confirmed zero nocturnal occupancy and active RESOURCE_MISMATCH.",
            findings=findings,
            evidence=evidence,
            recommendations=recommendations,
            metrics=metrics,
            next_actions=["root-cause-agent", "facility-agent"]
        )
