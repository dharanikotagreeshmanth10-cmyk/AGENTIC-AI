from app.agents.base_agent import BaseAgent
from app.schemas.agent_schema import AgentResult
from typing import Dict, Any, List

class WasteAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="waste-agent",
            name="Waste & Circularity Agent",
            description="Analyzes diversion rates, landfill tonnage, recycling contamination, and container pickup schedules.",
            capabilities=[
                "waste_generation", "waste_per_person", "recycling_percentage",
                "waste_category_analysis", "waste_trend", "collection_optimization"
            ]
        )

    async def process(self, task: Dict[str, Any], db=None) -> AgentResult:
        facility_id = task.get("facility_id", "CAMPUS-WIDE")
        
        total_waste_kg = 1420.0
        recycling_kg = 540.0
        compost_kg = 320.0
        landfill_kg = 560.0
        diversion_rate_pct = round(((recycling_kg + compost_kg) / total_waste_kg) * 100, 1)
        contamination_rate = 14.2
        target_diversion = 75.0
        
        findings = [
            f"Current campus diversion rate is {diversion_rate_pct}% (Target: {target_diversion}%).",
            f"Recycling contamination rate is {contamination_rate}% in dining and academic zones.",
            f"Organic compost stream captures 320 kg/week with 98% purity."
        ]
        
        evidence = [
            {"metric": "Recycling Diversion Rate", "actual": diversion_rate_pct, "target": target_diversion, "unit": "%"},
            {"metric": "Recycling Stream Contamination", "actual": contamination_rate, "target": 5.0, "unit": "%"},
            {"metric": "Landfill Generation", "actual": landfill_kg, "target": 350.0, "unit": "kg/week"}
        ]
        
        recommendations = [
            "Install smart AI sorting bins in high-traffic cafeteria areas.",
            "Shift dumpster pickup frequency from 5x/week to on-demand ultrasonic fill sensors."
        ]
        
        metrics = {
            "total_waste_kg": total_waste_kg,
            "diversion_rate_pct": diversion_rate_pct,
            "recycling_kg": recycling_kg,
            "compost_kg": compost_kg,
            "landfill_kg": landfill_kg,
            "contamination_rate_pct": contamination_rate,
            "potential_co2_savings_kg": round(recycling_kg * 1.8, 1)
        }
        
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed",
            confidence=0.92,
            summary=f"Waste diversion is at {diversion_rate_pct}%. Optimization of recycling streams can divert an additional 210 kg/week from landfill.",
            findings=findings,
            evidence=evidence,
            recommendations=recommendations,
            metrics=metrics,
            next_actions=["optimization-agent", "impact-agent"]
        )
