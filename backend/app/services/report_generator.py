import datetime
from typing import Dict, Any, List


class ReportGenerator:
    @staticmethod
    def generate_sustainability_report(db) -> Dict[str, Any]:
        report_id = f"REP-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}"
        title = "EcoGenius Enterprise Sustainability Intelligence Report"
        now = datetime.datetime.utcnow()

        # ── Demo / fallback data (real DB queries can replace these) ───────────
        period_start = (now - datetime.timedelta(days=30)).strftime("%d %b %Y")
        period_end = now.strftime("%d %b %Y")

        water = {
            "total_consumption_liters": 184500,
            "daily_average_liters": 6150,
            "peak_day_liters": 9200,
            "water_saved_liters": 32500,
            "efficiency_pct": 91.4,
            "leak_incidents": 3,
            "estimated_water_loss_liters": 8400,
        }

        energy = {
            "total_kwh": 4280,
            "peak_demand_kw": 98.4,
            "energy_saved_kwh": 620,
            "efficiency_pct": 87.2,
            "renewable_pct": 18.5,
        }

        waste = {
            "total_generated_kg": 1260,
            "recycled_kg": 930,
            "landfill_kg": 330,
            "diversion_pct": 73.8,
        }

        air = {
            "average_aqi": 94,
            "average_co2_ppm": 680,
            "buildings_exceeding_threshold": 1,
        }

        impact = {
            "co2_reduction_tonnes": 1.84,
            "sustainability_score": 92,
            "resource_efficiency_score": 88,
            "total_monthly_saving_inr": 40500,
        }

        recommendations: List[Dict[str, str]] = [
            {
                "id": "REC-01",
                "priority": "Critical",
                "title": "Fix Nocturnal Leak — Building B Zone B-2 Riser Valve",
                "description": (
                    "Sustained 75.2 L/min nocturnal flow detected. Replace Zone B-2 riser "
                    "valve immediately to recover ~8,400 L/month."
                ),
                "saving": "₹8,400/month",
                "payback": "11 days",
            },
            {
                "id": "REC-02",
                "priority": "High",
                "title": "Adjust Building C Chilled Water Setpoint",
                "description": (
                    "Chiller staging fault causing +33% electrical surge. Raising setpoint "
                    "from 22°C to 24°C will reduce energy load significantly."
                ),
                "saving": "₹21,400/month",
                "payback": "Immediate",
            },
            {
                "id": "REC-03",
                "priority": "High",
                "title": "Restore Building D Automated Lighting Schedule",
                "description": (
                    "Floor 4 lighting relays are stuck ON overnight. Restoring the timer "
                    "relay will eliminate unnecessary off-hours consumption."
                ),
                "saving": "₹6,200/month",
                "payback": "3 days",
            },
            {
                "id": "REC-04",
                "priority": "Medium",
                "title": "Improve Waste Diversion — Segregation Campaign",
                "description": (
                    "Current diversion rate is 73.8% vs 80% target. Launching a "
                    "wet/dry segregation campaign at 3 buildings can close this gap."
                ),
                "saving": "₹3,200/month",
                "payback": "30 days",
            },
            {
                "id": "REC-05",
                "priority": "Medium",
                "title": "Install PM2.5 Ventilation Damper — Building E Classrooms",
                "description": (
                    "CO2 reaching 1,180 ppm during peak lectures. Recalibrating fresh-air "
                    "dampers will improve air quality and occupant productivity."
                ),
                "saving": "Non-monetary",
                "payback": "Immediate",
            },
        ]

        facility_rankings = [
            {"name": "Building A (Admin)", "score": 88.5, "status": "Top Performer"},
            {"name": "Building G (Library)", "score": 84.0, "status": "Good"},
            {"name": "Building H (Dining)", "score": 79.2, "status": "Good"},
            {"name": "Building D (Arts)", "score": 74.5, "status": "Moderate"},
            {"name": "Building E (Lecture)", "score": 71.0, "status": "Moderate"},
            {"name": "Building F (Sports)", "score": 67.8, "status": "Needs Work"},
            {"name": "Building C (Engineering)", "score": 62.4, "status": "Needs Work"},
            {"name": "Building B (Science)", "score": 54.2, "status": "Critical"},
        ]

        return {
            "report_id": report_id,
            "title": title,
            "created_at": now.isoformat(),
            "period_start": period_start,
            "period_end": period_end,
            "generated_by": "EcoCore Multi-Agent Orchestrator",
            "status": "Executive Approved",
            # Structured metrics
            "water": water,
            "energy": energy,
            "waste": waste,
            "air": air,
            "impact": impact,
            "recommendations": recommendations,
            "facility_rankings": facility_rankings,
            # Legacy flat fields (kept for backward compat)
            "campus_sustainability_score": impact["sustainability_score"],
            "total_monthly_saving_inr": impact["total_monthly_saving_inr"],
            "total_water_recovery_liters": water["water_saved_liters"],
            "co2_reduction_tonnes": impact["co2_reduction_tonnes"],
        }
