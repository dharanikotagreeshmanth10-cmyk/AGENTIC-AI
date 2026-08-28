import sys
import os
import datetime
import math
import random

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.models.facility import Facility
from app.models.telemetry import (
    EnergyReading, WaterReading, WasteReading,
    AirQualityReading, OccupancyReading, WeatherReading
)
from app.models.agent import AgentModel
from app.models.anomaly import Anomaly
from app.models.recommendation import Recommendation
from app.models.approval import Approval
from app.models.impact import Intervention, ImpactMetric

def generate_data():
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data
    db.query(EnergyReading).delete()
    db.query(WaterReading).delete()
    db.query(WasteReading).delete()
    db.query(AirQualityReading).delete()
    db.query(OccupancyReading).delete()
    db.query(WeatherReading).delete()
    db.query(Facility).delete()
    db.query(AgentModel).delete()
    db.query(Anomaly).delete()
    db.query(Recommendation).delete()
    db.query(Approval).delete()
    db.query(Intervention).delete()
    db.query(ImpactMetric).delete()
    db.commit()

    print("Generating 8 Campus Facilities...")
    facilities_data = [
        {"id": "BUILDING-A", "name": "Building A (Administration)", "type": "Office", "area": 12500, "capacity": 550, "operating_hours": "08:00-18:00", "floor_count": 5, "location": "North Campus", "sustainability_score": 88.5},
        {"id": "BUILDING-B", "name": "Building B (Science Block)", "type": "Lab", "area": 14200, "capacity": 450, "operating_hours": "08:00-20:00", "floor_count": 6, "location": "East Quad", "sustainability_score": 54.2},
        {"id": "BUILDING-C", "name": "Building C (Engineering Complex)", "type": "Lab", "area": 18500, "capacity": 700, "operating_hours": "07:30-21:00", "floor_count": 7, "location": "East Quad", "sustainability_score": 62.4},
        {"id": "BUILDING-D", "name": "Building D (Arts & Media)", "type": "Academic", "area": 9800, "capacity": 400, "operating_hours": "08:00-19:00", "floor_count": 4, "location": "West Plaza", "sustainability_score": 74.5},
        {"id": "BUILDING-E", "name": "Building E (Lecture Hall Complex)", "type": "Academic", "area": 11200, "capacity": 850, "operating_hours": "08:00-18:00", "floor_count": 3, "location": "Central Campus", "sustainability_score": 71.0},
        {"id": "BUILDING-F", "name": "Building F (Sports & Aquatics)", "type": "Athletics", "area": 15600, "capacity": 600, "operating_hours": "06:00-22:00", "floor_count": 3, "location": "South Campus", "sustainability_score": 67.8},
        {"id": "BUILDING-G", "name": "Building G (Central Library)", "type": "Library", "area": 16400, "capacity": 900, "operating_hours": "07:00-23:00", "floor_count": 5, "location": "Central Campus", "sustainability_score": 84.0},
        {"id": "BUILDING-H", "name": "Building H (Student Dining & Hub)", "type": "Dining", "area": 8900, "capacity": 750, "operating_hours": "07:00-22:00", "floor_count": 3, "location": "West Plaza", "sustainability_score": 79.2}
    ]

    for f in facilities_data:
        db.add(Facility(**f))
    db.commit()

    print("Registering 12 Specialized Agents in database...")
    agents_data = [
        {"id": "ecocore", "name": "EcoCore Supervisor", "description": "Main Orchestrator Agent", "capabilities": ["orchestration", "synthesis"], "status": "ONLINE", "health_score": 99.5, "confidence": 0.98},
        {"id": "energy-agent", "name": "Energy Intelligence Agent", "description": "Electrical loads, HVAC/lighting decomposition, peak demand", "capabilities": ["current_energy", "baseline_calculation", "anomaly_detection"], "status": "ONLINE", "health_score": 98.0, "confidence": 0.95},
        {"id": "water-agent", "name": "Water Intelligence Agent", "description": "Flow rate, nocturnal leak detection, water/person", "capabilities": ["leakage_detection", "water_baseline", "abnormal_flow"], "status": "ONLINE", "health_score": 99.0, "confidence": 0.96},
        {"id": "waste-agent", "name": "Waste & Circularity Agent", "description": "Recycling diversion, landfill rate, contamination analysis", "capabilities": ["waste_generation", "recycling_rate", "collection_optimization"], "status": "ONLINE", "health_score": 97.5, "confidence": 0.92},
        {"id": "air-agent", "name": "Air Quality Agent", "description": "AQI, PM2.5, PM10, CO2, demand-controlled ventilation", "capabilities": ["aqi_monitoring", "co2_monitoring", "ventilation_analysis"], "status": "ONLINE", "health_score": 96.8, "confidence": 0.94},
        {"id": "occupancy-agent", "name": "Occupancy Analytics Agent", "description": "Headcount, utilization, resource mismatch detection", "capabilities": ["current_occupancy", "building_utilization", "resource_mismatch"], "status": "ONLINE", "health_score": 98.2, "confidence": 0.96},
        {"id": "facility-agent", "name": "Facility Benchmarking Agent", "description": "Peer ranking, 0-100 sustainability index, carbon intensity", "capabilities": ["benchmarking", "efficiency_scores", "building_ranking"], "status": "ONLINE", "health_score": 99.1, "confidence": 0.97},
        {"id": "forecast-agent", "name": "Predictive Forecasting Agent", "description": "Rolling average, polynomial regression, peak prediction", "capabilities": ["energy_forecast", "water_forecast", "peak_prediction"], "status": "ONLINE", "health_score": 97.0, "confidence": 0.94},
        {"id": "root-cause-agent", "name": "Root Cause Synthesis Agent", "description": "Cross-agent telemetry correlation and root cause isolation", "capabilities": ["evidence_synthesis", "root_cause_isolation"], "status": "ONLINE", "health_score": 98.9, "confidence": 0.96},
        {"id": "optimization-agent", "name": "Optimization Agent", "description": "ROI calculation, payback period, intervention generation", "capabilities": ["action_generation", "roi_calculation", "payback_estimation"], "status": "ONLINE", "health_score": 98.5, "confidence": 0.96},
        {"id": "simulation-agent", "name": "What-If Simulation Agent", "description": "Physics-based slider projection of kWh, L, ₹, and CO2", "capabilities": ["what_if_simulation", "load_projection", "cost_projection"], "status": "ONLINE", "health_score": 99.2, "confidence": 0.98},
        {"id": "approval-agent", "name": "Governance & Approval Agent", "description": "Safety review gatekeeper and audit ledger", "capabilities": ["governance_workflow", "audit_logging", "review_routing"], "status": "ONLINE", "health_score": 100.0, "confidence": 1.0},
        {"id": "impact-agent", "name": "Impact Verification Agent", "description": "Verified post-implementation before/after measurement", "capabilities": ["intervention_tracking", "avoided_emissions", "financial_verification"], "status": "ONLINE", "health_score": 99.4, "confidence": 0.99}
    ]

    for a in agents_data:
        db.add(AgentModel(**a))
    db.commit()

    print("Generating 180 days of realistic 30-minute sensor telemetry (with 5 known anomalies)...")
    end_time = datetime.datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    start_time = end_time - datetime.timedelta(days=180)
    
    # We will step by 30 mins. For optimal database performance in SQLite/Postgres, we insert in batches.
    # To keep initial seeding fast and realistic, we generate representative 180-day history.
    current_t = start_time
    total_steps = int((end_time - start_time).total_seconds() / 1800)
    print(f"Generating telemetry across {total_steps} time intervals for 8 facilities...")

    energy_batch = []
    water_batch = []
    waste_batch = []
    air_batch = []
    occ_batch = []
    weather_batch = []

    step_idx = 0
    while current_t <= end_time:
        hour = current_t.hour
        weekday = current_t.weekday() # 0-4 weekday, 5-6 weekend
        is_weekend = (weekday >= 5)
        day_progress = (hour + current_t.minute / 60.0) / 24.0

        # Ambient weather diurnal curve
        ambient_temp = round(20.0 + 10.0 * math.sin((day_progress - 0.25) * 2 * math.pi) + random.uniform(-1.5, 1.5), 1)
        ambient_humidity = round(65.0 - 25.0 * math.sin((day_progress - 0.25) * 2 * math.pi) + random.uniform(-3.0, 3.0), 1)
        solar = max(0.0, round(850.0 * math.sin((day_progress - 0.25) * math.pi) + random.uniform(-40, 40), 1)) if 6 <= hour <= 18 else 0.0

        # Weather reading once per interval
        if step_idx % 4 == 0:
            weather_batch.append(WeatherReading(
                timestamp=current_t,
                temperature_c=ambient_temp,
                humidity_pct=ambient_humidity,
                solar_irradiance=solar,
                precipitation_mm=0.0
            ))

        for f in facilities_data:
            fid = f["id"]
            cap = f["capacity"]
            area = f["area"]

            # Base occupancy curve
            if is_weekend:
                base_occ_ratio = 0.05 if fid != "BUILDING-F" else 0.65 # Sports complex busy on weekends
            else:
                if 8 <= hour <= 17:
                    base_occ_ratio = 0.70 + 0.20 * math.sin((hour - 8) / 9 * math.pi)
                elif 18 <= hour <= 21:
                    base_occ_ratio = 0.25
                else:
                    base_occ_ratio = 0.02
            
            headcount = int(cap * base_occ_ratio * random.uniform(0.85, 1.15))
            headcount = max(0, min(cap, headcount))
            utilization = round((headcount / cap) * 100, 1)

            # Energy baseline
            base_kw_m2 = 0.015 # kW per m2
            occ_kw_person = 0.15 # kW per person
            thermal_kw = max(0.0, (ambient_temp - 22.0) * 1.8)

            energy_kwh = round((area * base_kw_m2 * 0.5) + (headcount * occ_kw_person * 0.5) + (thermal_kw * 0.5) + random.uniform(2.0, 8.0), 1)
            hvac_load = round(energy_kwh * 0.52, 1)
            lighting_load = round(energy_kwh * 0.28, 1)
            equipment_load = round(energy_kwh - hvac_load - lighting_load, 1)
            
            # Water baseline
            water_liters = round((headcount * random.uniform(4.5, 6.0)) + (area * 0.05) + random.uniform(10.0, 30.0), 1)
            flow_lpm = round((water_liters / 30.0), 2)

            # Air quality baseline
            co2_ppm = round(420.0 + (headcount * 1.1) + random.uniform(-15.0, 15.0), 1)
            aqi = round(42.0 + (ambient_temp * 0.5) + random.uniform(-5.0, 5.0), 1)
            pm25 = round(12.0 + random.uniform(-2.0, 4.0), 1)
            pm10 = round(22.0 + random.uniform(-3.0, 6.0), 1)

            # Waste baseline (sampled daily / weekly)
            waste_kg = round(headcount * 0.12 + random.uniform(1.0, 5.0), 1)

            # ---------------- INJECTED ANOMALIES ----------------
            # Anomaly 1: Building B water leakage (constant 75 L/min overnight leak)
            if fid == "BUILDING-B":
                if hour < 6 or hour >= 22:
                    flow_lpm = round(74.8 + random.uniform(-1.2, 1.5), 2)
                    water_liters = round(flow_lpm * 30.0, 1) # ~2250 L per 30 mins
                else:
                    flow_lpm += 70.0
                    water_liters += 2100.0

            # Anomaly 2: Building C HVAC fault (+35% extra energy)
            if fid == "BUILDING-C":
                energy_kwh = round(energy_kwh * 1.35, 1)
                hvac_load = round(hvac_load * 1.60, 1)

            # Anomaly 3: Building D after-hours lighting stuck ON
            if fid == "BUILDING-D" and (hour < 7 or hour > 20):
                lighting_load = round(lighting_load + 45.0, 1)
                energy_kwh = round(energy_kwh + 45.0, 1)

            # Anomaly 4: Building E poor ventilation / high CO2
            if fid == "BUILDING-E" and 13 <= hour <= 16:
                co2_ppm = round(co2_ppm * 1.85, 1) # > 1100 ppm

            # Anomaly 5: Building F weekend spike
            if fid == "BUILDING-F" and is_weekend and hour >= 10 and hour <= 18:
                energy_kwh = round(energy_kwh * 1.45, 1)

            # Append records (sample every 2 hours to keep DB fast & responsive)
            if step_idx % 4 == 0:
                energy_batch.append(EnergyReading(
                    timestamp=current_t,
                    facility_id=fid,
                    energy_kwh=energy_kwh,
                    hvac_load=hvac_load,
                    lighting_load=lighting_load,
                    equipment_load=equipment_load,
                    peak_demand_kw=round(energy_kwh * 1.8, 1)
                ))
                water_batch.append(WaterReading(
                    timestamp=current_t,
                    facility_id=fid,
                    water_liters=water_liters,
                    flow_rate_lpm=flow_lpm,
                    leak_probability=0.96 if fid == "BUILDING-B" else 0.02
                ))
                occ_batch.append(OccupancyReading(
                    timestamp=current_t,
                    facility_id=fid,
                    headcount=headcount,
                    utilization_pct=utilization
                ))
                air_batch.append(AirQualityReading(
                    timestamp=current_t,
                    facility_id=fid,
                    aqi=aqi,
                    pm25=pm25,
                    pm10=pm10,
                    co2=co2_ppm,
                    temperature=ambient_temp,
                    humidity=ambient_humidity
                ))
                if step_idx % 24 == 0: # daily waste
                    waste_batch.append(WasteReading(
                        timestamp=current_t,
                        facility_id=fid,
                        waste_kg=waste_kg * 4,
                        recycling_kg=waste_kg * 1.8,
                        compost_kg=waste_kg * 1.1,
                        landfill_kg=waste_kg * 1.1,
                        contamination_rate=14.0 if fid == "BUILDING-H" else 6.0
                    ))

        # Commit batches periodically
        if len(energy_batch) >= 2000:
            db.bulk_save_objects(energy_batch)
            db.bulk_save_objects(water_batch)
            db.bulk_save_objects(occ_batch)
            db.bulk_save_objects(air_batch)
            db.bulk_save_objects(waste_batch)
            db.bulk_save_objects(weather_batch)
            db.commit()
            energy_batch.clear()
            water_batch.clear()
            occ_batch.clear()
            air_batch.clear()
            waste_batch.clear()
            weather_batch.clear()

        current_t += datetime.timedelta(minutes=30)
        step_idx += 1

    # Flush remaining
    if energy_batch:
        db.bulk_save_objects(energy_batch)
        db.bulk_save_objects(water_batch)
        db.bulk_save_objects(occ_batch)
        db.bulk_save_objects(air_batch)
        db.bulk_save_objects(waste_batch)
        db.bulk_save_objects(weather_batch)
        db.commit()

    print("Seeding Initial Anomalies...")
    anomalies_to_add = [
        Anomaly(
            id="ANOM-B-WATER",
            facility_id="BUILDING-B",
            resource_type="WATER",
            title="Sustained Nocturnal Water Flow Spike",
            description="Continuous 75.2 L/min flow rate detected between 00:00-06:00 during 0% facility occupancy.",
            severity="CRITICAL",
            actual_value=75.2,
            expected_value=5.0,
            deviation_pct=1404.0,
            confidence=0.96,
            estimated_monthly_loss=8400.0,
            status="ACTIVE"
        ),
        Anomaly(
            id="ANOM-C-HVAC",
            facility_id="BUILDING-C",
            resource_type="ENERGY",
            title="Chiller Staging & Overcooling Inefficiency",
            description="HVAC thermal load is 35% higher than baseline relative to exterior ambient temperature.",
            severity="HIGH",
            actual_value=720.0,
            expected_value=540.0,
            deviation_pct=33.3,
            confidence=0.93,
            estimated_monthly_loss=21400.0,
            status="ACTIVE"
        ),
        Anomaly(
            id="ANOM-D-LIGHTING",
            facility_id="BUILDING-D",
            resource_type="ENERGY",
            title="After-Hours Lighting Relay Fault",
            description="Floor 4 lighting circuits remain illuminated continuously overnight.",
            severity="MEDIUM",
            actual_value=45.0,
            expected_value=2.0,
            deviation_pct=2150.0,
            confidence=0.95,
            estimated_monthly_loss=6200.0,
            status="ACTIVE"
        ),
        Anomaly(
            id="ANOM-E-CO2",
            facility_id="BUILDING-E",
            resource_type="AIR",
            title="Classroom CO2 Accumulation Spike",
            description="Peak lecture hours register CO2 above 1180 ppm due to insufficient damper fresh air intake.",
            severity="HIGH",
            actual_value=1180.0,
            expected_value=650.0,
            deviation_pct=81.5,
            confidence=0.94,
            estimated_monthly_loss=0.0,
            status="ACTIVE"
        ),
        Anomaly(
            id="ANOM-F-WEEKEND",
            facility_id="BUILDING-F",
            resource_type="ENERGY",
            title="Weekend Unscheduled Baseload Spike",
            description="Weekend baseload electricity is 45% above campus benchmark.",
            severity="LOW",
            actual_value=380.0,
            expected_value=260.0,
            deviation_pct=46.1,
            confidence=0.88,
            estimated_monthly_loss=4500.0,
            status="ACTIVE"
        )
    ]
    for anom in anomalies_to_add:
        db.add(anom)

    print("Seeding Recommendations & Governance Approvals...")
    rec = Recommendation(
        id="REC-B-WATER-01",
        title="Isolate & Repair Zone B-2 Main Water Riser Valve",
        description="Replace worn mechanical seal and calibrate pressure relief valve on main riser to eliminate 54,600 L/month nocturnal leakage.",
        facility_id="BUILDING-B",
        category="WATER",
        priority="CRITICAL",
        confidence=0.96,
        estimated_water_saving=54600.0,
        estimated_energy_saving=420.0,
        estimated_cost_saving=8400.0,
        estimated_co2_reduction=0.35,
        implementation_cost=3000.0,
        roi=33.6,
        payback_period_months=0.36,
        risk="LOW",
        status="PENDING"
    )
    db.add(rec)
    db.add(Approval(
        id="APP-B-WATER-01",
        recommendation_id="REC-B-WATER-01",
        reviewer="Operations Manager",
        status="PENDING",
        comment="Awaiting final human authorization for plumbing contractor work order."
    ))

    # Impact metrics record
    db.add(ImpactMetric(
        id="CAMPUS-IMPACT-CURRENT",
        total_energy_saved_kwh=142500.0,
        total_water_saved_liters=642000.0,
        total_money_saved_inr=1125000.0,
        total_co2_avoided_tonnes=116.8,
        total_waste_diverted_kg=48200.0,
        recommendations_issued=24,
        recommendations_approved=21,
        recommendations_implemented=18,
        interventions_successful=18,
        success_rate_pct=95.8
    ))

    db.commit()
    db.close()
    print("Demo data generation completed successfully!")

if __name__ == "__main__":
    generate_data()
