from app.agents.base_agent import BaseAgent
from app.schemas.agent_schema import AgentResult
from typing import Dict, Any, List
import uuid

class OptimizationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="optimization-agent",
            name="Optimization & Recommendation Agent",
            description="Generates quantified sustainability interventions with projected ROI, payback period, and avoided CO2/cost/resource savings.",
            capabilities=[
                "action_generation", "cost_benefit_analysis", "roi_calculation",
                "payback_estimation", "carbon_accounting"
            ]
        )

    async def process(self, task: Dict[str, Any], db=None) -> AgentResult:
        facility_id = task.get("facility_id", "BUILDING-B")
        rec_id = f"REC-{uuid.uuid4().hex[:6].upper()}"
        
        # Interventions calculation
        estimated_monthly_saving_inr = 8400.0
        estimated_water_saving_liters = 54600.0
        estimated_energy_saving_kwh = 420.0
        estimated_co2_reduction_tonnes = 0.35
        implementation_cost_inr = 3000.0
        roi = round((estimated_monthly_saving_inr * 12) / implementation_cost_inr, 2) # 33.6x annual ROI
        payback_months = round(implementation_cost_inr / estimated_monthly_saving_inr, 2) # 0.36 months (~11 days)
        
        recommendation_payload = {
            "id": rec_id,
            "title": f"Isolate & Repair Zone B-2 Main Water Riser Valve in {facility_id}",
            "description": "Replace worn mechanical seal and calibrate pressure relief valve on main riser to eliminate 54,600 L/month nocturnal leakage.",
            "facility": facility_id,
            "category": "WATER",
            "priority": "CRITICAL",
            "confidence": 0.96,
            "estimated_water_saving": estimated_water_saving_liters,
            "estimated_energy_saving": estimated_energy_saving_kwh,
            "estimated_cost_saving": estimated_monthly_saving_inr,
            "estimated_co2_reduction": estimated_co2_reduction_tonnes,
            "implementation_cost": implementation_cost_inr,
            "roi": roi,
            "payback_period": f"{payback_months} months (~11 days)",
            "risk": "LOW",
            "status": "PENDING"
        }
        
        findings = [
            f"Intervention will save ₹{estimated_monthly_saving_inr:,.0f}/month and {estimated_water_saving_liters:,.0f} L of water.",
            f"Capital outlay of ₹{implementation_cost_inr:,.0f} has an immediate payback period of {payback_months} months ({payback_months*30:.0f} days).",
            f"Annualized Return on Investment (ROI): {roi}x."
        ]
        
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed",
            confidence=0.96,
            summary=f"Formulated high-priority optimization recommendation ({rec_id}) yielding ₹{estimated_monthly_saving_inr:,.0f}/mo savings with {payback_months} mo payback.",
            findings=findings,
            evidence=[recommendation_payload],
            recommendations=[recommendation_payload["title"]],
            metrics=recommendation_payload,
            next_actions=["simulation-agent", "approval-agent"]
        )
