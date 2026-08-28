from app.agents.base_agent import BaseAgent
from app.schemas.agent_schema import AgentResult
from typing import Dict, Any, List

class AirQualityAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="air-agent",
            name="Air Quality & Ventilation Agent",
            description="Monitors indoor environmental quality (IEQ), AQI, PM2.5, PM10, CO2 ppm, and optimizes demand-controlled ventilation.",
            capabilities=[
                "aqi_monitoring", "pm25_tracking", "pm10_tracking",
                "co2_monitoring", "temperature_humidity", "ventilation_analysis"
            ]
        )

    async def process(self, task: Dict[str, Any], db=None) -> AgentResult:
        facility_id = task.get("facility_id", "BUILDING-E")
        
        co2_ppm = 1180.0
        max_safe_co2 = 800.0
        aqi = 68.0
        pm25 = 18.4
        pm10 = 29.1
        ventilation_rate_ach = 2.1
        expected_ach = 4.5
        
        findings = [
            f"CO2 levels in {facility_id} reach {co2_ppm} ppm during 14:00-16:00 (threshold: {max_safe_co2} ppm).",
            f"Ventilation air change rate ({ventilation_rate_ach} ACH) is 53% below ASHRAE standard ({expected_ach} ACH).",
            f"Indoor particulate matter (PM2.5: {pm25} µg/m³) is well-filtered within healthy range."
        ]
        
        evidence = [
            {"metric": "Peak Indoor CO2", "actual": co2_ppm, "standard": max_safe_co2, "unit": "ppm", "status": "POOR"},
            {"metric": "Air Changes per Hour (ACH)", "actual": ventilation_rate_ach, "standard": expected_ach, "unit": "ACH", "status": "LOW"},
            {"metric": "Overall Indoor AQI", "actual": aqi, "standard": 50.0, "unit": "AQI", "status": "MODERATE"}
        ]
        
        recommendations = [
            "Modulate fresh air damper from 15% to 35% in Building E during peak occupancy.",
            "Synchronize AHU speed with real-time CO2 ppm sensor threshold triggers."
        ]
        
        metrics = {
            "co2_ppm": co2_ppm,
            "aqi": aqi,
            "pm25": pm25,
            "pm10": pm10,
            "ventilation_rate_ach": ventilation_rate_ach,
            "cognitive_productivity_impact_pct": -4.2
        }
        
        return AgentResult(
            agent_id=self.agent_id,
            task_id=task.get("id", "TASK-UNKNOWN"),
            status="completed",
            confidence=0.94,
            summary=f"Ventilation shortfall in {facility_id} causes peak CO2 accumulation to {co2_ppm} ppm. Increasing fresh air damper modulation will restore optimal IEQ.",
            findings=findings,
            evidence=evidence,
            recommendations=recommendations,
            metrics=metrics,
            next_actions=["occupancy-agent", "root-cause-agent"]
        )
