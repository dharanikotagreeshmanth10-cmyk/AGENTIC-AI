from typing import Dict, Any

class SimulationEngine:
    @staticmethod
    def run_simulation(params: Dict[str, Any]) -> Dict[str, Any]:
        temp_delta = float(params.get("hvac_temperature_change", 1.5))
        light_pct = float(params.get("lighting_reduction_pct", 25.0))
        hours_delta = float(params.get("operating_hours_reduction", 2.0))
        occ_delta = float(params.get("occupancy_change_pct", 0.0))
        leak_fixed = bool(params.get("water_leak_fixed", True))
        irrigation_opt = bool(params.get("irrigation_optimization", True))

        current_energy = 58000.0
        current_water = 125000.0
        current_cost = 485000.0
        current_co2 = 47.56

        # Calculate energy savings
        energy_saving_pct = (temp_delta * 4.5) + (light_pct * 0.25) + (hours_delta * 2.1) + (occ_delta * -0.15)
        energy_saving_pct = max(0.0, min(60.0, energy_saving_pct))
        energy_saved = round(current_energy * (energy_saving_pct / 100.0), 1)
        projected_energy = round(current_energy - energy_saved, 1)

        # Calculate water savings
        water_saved = 54600.0 if leak_fixed else 0.0
        if irrigation_opt:
            water_saved += 12000.0
        projected_water = round(max(10000.0, current_water - water_saved), 1)

        # Financials
        cost_saved = round((energy_saved * 7.5) + (water_saved * 0.1538), 1)
        projected_cost = round(current_cost - cost_saved, 1)

        # Carbon
        co2_saved = round((energy_saved * 0.82) / 1000.0, 2)
        projected_co2 = round(current_co2 - co2_saved, 2)

        implementation_cost = 15000.0 if (leak_fixed and irrigation_opt) else 5000.0
        annual_savings = cost_saved * 12
        roi = round(annual_savings / implementation_cost, 2) if implementation_cost > 0 else 10.0
        payback = round(implementation_cost / cost_saved, 2) if cost_saved > 0 else 0.0

        return {
            "parameters": params,
            "current_metrics": {
                "energy_kwh": current_energy,
                "water_liters": current_water,
                "cost_inr": current_cost,
                "co2_tonnes": current_co2
            },
            "projected_metrics": {
                "energy_kwh": projected_energy,
                "water_liters": projected_water,
                "cost_inr": projected_cost,
                "co2_tonnes": projected_co2
            },
            "savings": {
                "energy_kwh": energy_saved,
                "energy_pct": round((energy_saved / current_energy) * 100, 1),
                "water_liters": water_saved,
                "water_pct": round((water_saved / current_water) * 100, 1),
                "cost_inr": cost_saved,
                "annual_cost_inr": annual_savings,
                "co2_tonnes": co2_saved
            },
            "financial_metrics": {
                "implementation_cost_inr": implementation_cost,
                "roi_multiplier": roi,
                "payback_months": payback
            }
        }
