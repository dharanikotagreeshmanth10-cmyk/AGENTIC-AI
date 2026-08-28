"""
water_advanced.py -- Advanced Water Intelligence API (18 Features)
All endpoints use deterministic demo algorithms with clear SIMULATED flags.
"""
from fastapi import APIRouter, Body
import datetime, math

router = APIRouter(prefix="/water", tags=["Water Advanced"])

FACILITY_META = {
    "BUILDING-A": {"name": "Admin Block",          "area_m2": 3200, "capacity": 200, "roof_area": 800},
    "BUILDING-B": {"name": "Science Block",        "area_m2": 5400, "capacity": 450, "roof_area": 1350},
    "BUILDING-C": {"name": "Engineering Lab",      "area_m2": 4800, "capacity": 380, "roof_area": 1200},
    "BUILDING-D": {"name": "Arts and Media",       "area_m2": 3600, "capacity": 300, "roof_area": 900},
    "BUILDING-E": {"name": "Lecture Hall Complex", "area_m2": 6200, "capacity": 600, "roof_area": 1550},
}

def _seed(fid: str) -> float:
    return sum(ord(c) for c in fid) / 1000.0


# 1. WATER DIGITAL TWIN
@router.get("/digital-twin")
def get_water_digital_twin(facility_id: str = "BUILDING-B"):
    s = _seed(facility_id); meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"])
    hour = datetime.datetime.utcnow().hour; leak = facility_id == "BUILDING-B"
    tank = max(20, min(95, 65 + math.sin(s + hour * 0.3) * 20))
    psi = round(42 + s * 10 + (3 if not leak else -8), 1)
    flow = round(5.2 + s * 3 + (70 if leak else 0), 1)
    return {
        "facility_id": facility_id, "facility_name": meta["name"],
        "tank_level_pct": round(tank, 1), "pressure_psi": psi, "flow_rate_lpm": flow,
        "leak_status": "CRITICAL" if leak else "NORMAL",
        "infrastructure": {
            "buildings": [{"id": facility_id, "name": meta["name"], "floors": max(2, int(meta["area_m2"]/1200)), "area_m2": meta["area_m2"], "status": "CRITICAL" if leak else "NORMAL"}],
            "tanks": [
                {"id": f"{facility_id}-T1", "name": "Main Roof Tank",   "capacity_liters": 10000, "current_level_pct": round(tank,1),           "status": "WARNING" if tank < 30 else "NORMAL"},
                {"id": f"{facility_id}-T2", "name": "Ground Sump Tank", "capacity_liters": 25000, "current_level_pct": round(min(95,tank+12),1), "status": "NORMAL"},
            ],
            "pumps": [
                {"id": f"{facility_id}-P1", "name": "Main Transfer Pump", "status": "RUNNING",                       "flow_lpm": flow,   "pressure_psi": psi},
                {"id": f"{facility_id}-P2", "name": "Booster Pump",       "status": "RUNNING" if leak else "STANDBY","flow_lpm": 22.5 if leak else 0, "pressure_psi": 38 if leak else 0},
            ],
            "valves": [
                {"id": f"{facility_id}-V1", "name": "Main Inlet Valve", "position": "OPEN",   "zone": "Zone-1"},
                {"id": f"{facility_id}-V2", "name": "Zone B-2 Riser",   "position": "OPEN",   "zone": "Zone-2"},
                {"id": f"{facility_id}-V3", "name": "Roof Tank Outlet", "position": "OPEN",   "zone": "Zone-3"},
                {"id": f"{facility_id}-V4", "name": "Emergency Bypass", "position": "CLOSED", "zone": "Zone-4"},
            ],
            "meters": [
                {"id": f"{facility_id}-M1", "name": "Main Inlet Meter", "reading_lpm": flow,                              "status": "ONLINE"},
                {"id": f"{facility_id}-M2", "name": "Zone B-2 Meter",   "reading_lpm": round(flow*0.6,1) if leak else 2.1,"status": "ONLINE"},
                {"id": f"{facility_id}-M3", "name": "Roof Discharge",   "reading_lpm": round(flow*0.35,1),                "status": "ONLINE"},
            ],
            "pipelines": [
                {"id": f"{facility_id}-PL1", "from": "Main Inlet",     "to": "Ground Sump", "flow_direction": "IN",   "diameter_mm": 100, "status": "NORMAL"},
                {"id": f"{facility_id}-PL2", "from": "Ground Sump",    "to": "Roof Tank",   "flow_direction": "UP",   "diameter_mm": 75,  "status": "CRITICAL" if leak else "NORMAL"},
                {"id": f"{facility_id}-PL3", "from": "Roof Tank",      "to": "Floors",      "flow_direction": "DOWN", "diameter_mm": 50,  "status": "NORMAL"},
                {"id": f"{facility_id}-PL4", "from": "Zone B-2 Riser", "to": "Restrooms",   "flow_direction": "OUT",  "diameter_mm": 40,  "status": "CRITICAL" if leak else "NORMAL"},
            ],
        },
        "last_updated": datetime.datetime.utcnow().isoformat(), "data_source": "SIMULATED"
    }


# 2. PREDICTIVE LEAK DETECTION
@router.get("/leak-detection")
def get_leak_detection(facility_id: str = "BUILDING-B"):
    s = _seed(facility_id); hour = datetime.datetime.utcnow().hour; occ = 8 <= hour <= 18
    probs = {"BUILDING-A": 0.12, "BUILDING-B": 0.96, "BUILDING-C": 0.28, "BUILDING-D": 0.08, "BUILDING-E": 0.45}
    prob = probs.get(facility_id, 0.15)
    sev = "CRITICAL" if prob >= 0.7 else "WARNING" if prob >= 0.35 else "LOW"
    sta = "CRITICAL" if prob >= 0.7 else "WARNING" if prob >= 0.35 else "NORMAL"
    loss = round(prob * 70 * (0.8 if occ else 1), 1)
    act = ("URGENT: Dispatch maintenance to Zone B-2 riser. Isolate sub-meter valve." if prob >= 0.7
           else "Monitor overnight flow. Schedule inspection if elevated for 2+ hours." if prob >= 0.35
           else "No immediate action. Continue scheduled monitoring.")
    return {"facility_id": facility_id, "status": sta, "leak_probability": prob, "severity": sev,
            "affected_facility": FACILITY_META.get(facility_id, {}).get("name", facility_id),
            "telemetry_inputs": {"flow_rate_lpm": round(5.0+s*3+prob*70,1), "pressure_psi": round(45-prob*15,1),
                                  "tank_level_pct": round(65-prob*30,1), "occupancy_factor": 1.0 if occ else 0.05,
                                  "time_of_day": hour, "historical_baseline_lpm": round(5.0+s*2,1)},
            "estimated_water_loss_lpm": loss, "estimated_daily_loss_kl": round(loss*60*24/1000,1),
            "estimated_monthly_loss_liters": round(loss*60*24/1000*30*1000,0),
            "recommended_action": act, "confidence": round(0.85+s*0.1,2),
            "last_checked": datetime.datetime.utcnow().isoformat(), "data_source": "SIMULATED"}


# 3. WATER EFFICIENCY SCORE
@router.get("/efficiency-score")
def get_efficiency_scores():
    base = {"BUILDING-A": 87, "BUILDING-B": 41, "BUILDING-C": 73, "BUILDING-D": 91, "BUILDING-E": 65}
    results = []
    for fid, meta in FACILITY_META.items():
        sc = max(0, min(100, base.get(fid, 70) + int(_seed(fid)*5)))
        lb = "Excellent" if sc >= 85 else "Good" if sc >= 70 else "Needs Attention" if sc >= 50 else "Critical"
        cl = "emerald" if sc >= 85 else "blue" if sc >= 70 else "amber" if sc >= 50 else "rose"
        results.append({"facility_id": fid, "facility_name": meta["name"], "score": sc, "label": lb, "color": cl,
                         "breakdown": {"consumption_score": min(100,sc+5), "occupancy_efficiency": max(0,sc-3),
                                       "anomaly_penalty": -15 if fid=="BUILDING-B" else -3,
                                       "leakage_penalty": -20 if fid=="BUILDING-B" else int(-_seed(fid)*5),
                                       "forecast_accuracy": min(100,sc+8), "water_reuse_score": int(_seed(fid)*40),
                                       "conservation_score": min(100,sc+2)}})
    return {"facilities": results, "data_source": "SIMULATED"}


# 4. RAINWATER HARVESTING
@router.get("/rainwater")
def get_rainwater_analysis(facility_id: str = "BUILDING-B", rainfall_mm: float = 85.0):
    meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"]); ra = meta["roof_area"]
    rc = 0.85; se = 0.90; sc = ra * 0.5
    gross = rainfall_mm * ra * rc; usable = gross * se
    stored = min(gross, sc * 1000); overflow = max(0, gross - stored)
    sav = usable * 0.003
    rec = ("High harvest potential. Install first-flush diverter and covered tank." if gross > 50000
           else "Moderate potential. Consider a 5,000L storage tank." if gross > 10000
           else "Low harvest month. Focus on storage maintenance.")
    return {"facility_id": facility_id, "facility_name": meta["name"],
            "inputs": {"rainfall_mm": rainfall_mm, "roof_area_m2": ra, "runoff_coefficient": rc, "system_efficiency": se, "storage_capacity_liters": sc*1000},
            "outputs": {"gross_collection_liters": round(gross,0), "usable_water_liters": round(usable,0),
                        "storage_required_liters": round(stored,0), "overflow_liters": round(overflow,0),
                        "potential_savings_inr": round(sav,2), "potential_savings_usd": round(sav/83,2),
                        "co2_avoided_kg": round(usable*0.001,2)},
            "recommendation": rec, "data_source": "SIMULATED"}


# 5. GREYWATER REUSE
@router.get("/greywater")
def get_greywater_analysis(facility_id: str = "BUILDING-B"):
    meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"]); s = _seed(facility_id)
    occ = int(meta["capacity"] * (0.3 + s * 0.4))
    srcs = {"bathrooms": (12,0.85), "wash_basins": (6,0.90), "showers": (30,0.75), "other": (4,0.60)}
    bd = {}; tg = 0; tr = 0
    for src, (lpp, rf) in srcs.items():
        g = lpp * occ; r = g * rf
        bd[src] = {"generated_liters": round(g,0), "reusable_liters": round(r,0)}
        tg += g; tr += r
    fwr = (tr/(tg+tr))*100 if tg > 0 else 0
    return {"facility_id": facility_id, "facility_name": meta["name"], "occupancy": occ,
            "source_breakdown": bd,
            "summary": {"total_greywater_liters": round(tg,0), "total_reusable_liters": round(tr,0),
                        "fresh_water_reduction_pct": round(fwr,1),
                        "potential_savings_inr_per_day": round(tr*0.003,2),
                        "potential_savings_inr_per_month": round(tr*0.003*26,2)},
            "recommendation": "Install greywater recycling system for toilet flushing and irrigation.",
            "data_source": "SIMULATED"}


# 6. COST SIMULATOR
@router.post("/cost-simulator")
def run_cost_simulator(payload: dict = Body(...)):
    cl = float(payload.get("current_liters_per_day", 5000))
    rp = float(payload.get("reduction_pct", 15))
    pl = float(payload.get("price_per_liter", 0.003))
    od = int(payload.get("operating_days", 26))
    ol = cl * (1 - rp/100); dsl = cl - ol
    dcc = cl * pl; doc = ol * pl; dsc = dcc - doc
    ms = dsc * od; ys = ms * 12
    chart = []
    for m in range(1, 13):
        f = min(1.0, 0.5 + (m/12)*0.5)
        chart.append({"month": datetime.date(2025,m,1).strftime("%b"),
                      "current_cost": round(dcc*od,2), "optimized_cost": round((dcc-dsc*f)*od,2), "savings": round(dsc*f*od,2)})
    return {"inputs": {"current_liters_per_day": cl, "reduction_pct": rp, "price_per_liter": pl, "operating_days": od},
            "results": {"optimized_liters_per_day": round(ol,1), "daily_savings_liters": round(dsl,1),
                        "daily_current_cost": round(dcc,2), "daily_optimized_cost": round(doc,2),
                        "daily_savings_cost": round(dsc,2), "monthly_savings": round(ms,2),
                        "annual_savings": round(ys,2), "co2_avoided_kg_per_year": round(dsl*365*0.001,2)},
            "monthly_chart_data": chart, "data_source": "SIMULATED"}


# 7. SHORTAGE PREDICTION
@router.get("/shortage-prediction")
def get_shortage_prediction(facility_id: str = "BUILDING-B"):
    s = _seed(facility_id); meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"])
    tc = 35000
    lvl = {"BUILDING-A":72,"BUILDING-B":28,"BUILDING-C":61,"BUILDING-D":85,"BUILDING-E":45}.get(facility_id,55)
    cl = tc * lvl/100; dd = meta["capacity"]*25; ds = dd*(1.1-s*0.3); nd = ds-dd
    sp = max(0.0, min(1.0, (1-lvl/100)*1.5-(nd/dd)*0.5))
    if sp > 0.6:
        d2s = max(1, int(cl/abs(min(nd,-1)))); sd = (datetime.date.today()+datetime.timedelta(days=d2s)).isoformat()
        act = "URGENT: Arrange emergency water supply. Restrict non-essential usage immediately."; st = "CRITICAL"
    elif sp > 0.3:
        d2s = int(cl/dd*2); sd = (datetime.date.today()+datetime.timedelta(days=d2s)).isoformat()
        act = "Monitor levels. Schedule tanker top-up within 48 hours if no rain forecast."; st = "WARNING"
    else:
        d2s = None; sd = None; act = "Tank levels adequate. Continue normal operations."; st = "NORMAL"
    return {"facility_id": facility_id, "facility_name": meta["name"],
            "current_tank_level_pct": lvl, "current_tank_level_liters": round(cl,0),
            "tank_capacity_liters": tc, "predicted_daily_demand_liters": round(dd,0),
            "predicted_daily_supply_liters": round(ds,0), "net_daily_liters": round(nd,0),
            "shortage_probability": round(sp,2), "days_to_potential_shortage": d2s,
            "expected_shortage_date": sd, "status": st, "recommended_action": act, "data_source": "SIMULATED"}


# 8. SENSOR HEALTH
@router.get("/sensor-health")
def get_sensor_health():
    now = datetime.datetime.utcnow()
    stypes = ["Flow Meter","Pressure Transducer","Tank Level Sensor","Water Quality Probe","Leak Detector"]
    smap = {"BUILDING-A":["ONLINE","ONLINE","ONLINE","DEGRADED","ONLINE"],
            "BUILDING-B":["ONLINE","DEGRADED","ONLINE","OFFLINE","ONLINE"],
            "BUILDING-C":["ONLINE","ONLINE","ONLINE","ONLINE","ONLINE"],
            "BUILDING-D":["ONLINE","ONLINE","DEGRADED","ONLINE","ONLINE"],
            "BUILDING-E":["DEGRADED","ONLINE","ONLINE","ONLINE","OFFLINE"]}
    sensors = []
    for fid, meta in FACILITY_META.items():
        ss = smap.get(fid, ["ONLINE"]*5)
        for i, st in enumerate(stypes):
            status = ss[i]; min_ago = 2 if status=="ONLINE" else 30 if status=="DEGRADED" else 180
            sensors.append({"id": f"{fid}-S{i+1:02d}", "name": f"{meta['name']} -- {st}",
                             "facility_id": fid, "sensor_type": st, "status": status,
                             "last_update": (now-datetime.timedelta(minutes=min_ago)).isoformat(),
                             "missing_data": status=="OFFLINE", "abnormal_reading": status=="DEGRADED",
                             "battery_pct": 100 if status=="ONLINE" else 42 if status=="DEGRADED" else 0,
                             "reading": f"{round(5.2+_seed(fid)*3,1)} L/min" if st=="Flow Meter" else ("N/A" if status=="OFFLINE" else "--")})
    total = len(sensors); on = sum(1 for x in sensors if x["status"]=="ONLINE")
    dg = sum(1 for x in sensors if x["status"]=="DEGRADED"); of = sum(1 for x in sensors if x["status"]=="OFFLINE")
    return {"summary": {"total":total,"online":on,"degraded":dg,"offline":of,"health_pct":round(on/total*100,1)},
            "sensors": sensors, "data_source": "SIMULATED"}


# 9. ROOT CAUSE
@router.get("/root-cause")
def get_root_cause(facility_id: str = "BUILDING-B", anomaly_type: str = "HIGH_FLOW"):
    s = _seed(facility_id); meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"])
    conf = round(0.88+s*0.08, 2)
    cmap = {
        "HIGH_FLOW": [{"cause":"Pressurized pipe leak in supply riser","probability":0.72,"evidence_count":4},
                      {"cause":"Continuous toilet flapper failure","probability":0.55,"evidence_count":3},
                      {"cause":"Faulty PRV allowing excess pressure","probability":0.38,"evidence_count":2},
                      {"cause":"Unauthorized usage","probability":0.15,"evidence_count":1}],
        "LOW_PRESSURE": [{"cause":"Partial blockage in supply main","probability":0.68,"evidence_count":3},
                         {"cause":"Pump performance degradation","probability":0.52,"evidence_count":2}],
        "HIGH_CONSUMPTION": [{"cause":"Occupancy higher than expected","probability":0.60,"evidence_count":2},
                              {"cause":"Irrigation system malfunction","probability":0.40,"evidence_count":1}]
    }
    evidence = [
        {"metric":"Overnight Flow (00:00-06:00)","actual":round(5.2+s*70,1),"expected":4.2,"unit":"L/min","deviation_pct":"+1690%","severity":"CRITICAL"},
        {"metric":"Flow-Occupancy Correlation","actual":0.03,"expected":0.88,"unit":"Pearson r","deviation_pct":"-97%","severity":"CRITICAL"},
        {"metric":"Main Meter vs Sub-Meter Delta","actual":68.3,"expected":2.1,"unit":"L/min","deviation_pct":"+3152%","severity":"CRITICAL"},
        {"metric":"Pressure Drop Zone B-2","actual":31.2,"expected":45.0,"unit":"PSI","deviation_pct":"-31%","severity":"HIGH"},
    ]
    return {"facility_id":facility_id,"facility_name":meta["name"],"anomaly_type":anomaly_type,
            "anomaly_description":f"Sustained {anomaly_type.replace('_',' ').title()} detected outside normal parameters for 6+ hours.",
            "confidence_score":conf,"possible_causes":cmap.get(anomaly_type,cmap["HIGH_FLOW"]),"supporting_evidence":evidence,
            "recommended_investigation":["1. Isolate Zone B-2 valve and check pressure stabilization.",
                                          "2. Deploy acoustic leak detection along supply riser.",
                                          "3. Inspect all WC cisterns and flush valves on floors 1-3.",
                                          "4. Verify PRV set point and downstream pressure.",
                                          "5. Cross-reference CCTV for unauthorized access."],
            "estimated_resolution_hours":4,"data_source":"SIMULATED"}


# 10. CROSS-RESOURCE OPTIMIZATION
@router.get("/cross-resource")
def get_cross_resource(facility_id: str = "BUILDING-B"):
    s = _seed(facility_id); meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"])
    hour = datetime.datetime.utcnow().hour
    occ = round(30+s*40+math.sin(hour*0.5)*15,1); wdf = occ/100
    pe = round(2.5*wdf*(1+s*0.3),2); he = round(1.8*wdf,2)
    return {"facility_id":facility_id,"facility_name":meta["name"],
            "cross_resource_insights":[
                {"chain":"High Occupancy -> Higher Water Demand -> Higher Pump Energy","occupancy_pct":occ,"water_demand_increase_pct":round(wdf*100,1),"pump_energy_kwh":pe,"insight":f"At {occ}% occupancy, pumping uses {pe} kWh/hr. Off-peak scheduling cuts both water and energy costs."},
                {"chain":"Hot Weather -> More HVAC -> More Cooling Tower Water","temperature_c":round(28+s*5,1),"hvac_water_liters_per_hr":round(he*3.6,1),"energy_kwh":he,"insight":"High temperature increases HVAC blowdown by 18%. Pre-chill before peak hours."},
                {"chain":"Low Occupancy + High Flow = Leak Indicator","night_occupancy_pct":0,"night_flow_lpm":round(70+s*5,1) if facility_id=="BUILDING-B" else round(2+s,1),"insight":"Zero occupancy with sustained flow triggers WaterAgent + FacilityAgent joint investigation."},
            ],
            "coordinated_recommendations":[
                {"title":"Stagger high-occupancy events across buildings","water_impact":"-12%","energy_impact":"-8%","priority":"HIGH"},
                {"title":"Pre-cool HVAC before peak to reduce daytime draw","water_impact":"-7%","energy_impact":"-11%","priority":"MEDIUM"},
                {"title":"Install variable-speed pump drives","water_impact":"-5%","energy_impact":"-18%","priority":"HIGH"},
                {"title":"Link occupancy sensors to auto valve throttling","water_impact":"-15%","energy_impact":"-3%","priority":"MEDIUM"},
            ],
            "total_potential_water_saving_pct":22.5,"total_potential_energy_saving_pct":15.3,"data_source":"SIMULATED"}


# 11. WATER QUALITY
@router.get("/quality")
def get_water_quality(facility_id: str = "BUILDING-B"):
    s = _seed(facility_id); meta = FACILITY_META.get(facility_id, FACILITY_META["BUILDING-B"])
    params = {"pH":(round(6.8+s*0.8,2),"",6.5,8.5,6.0,9.0),"turbidity":(round(0.8+s*3.5,2),"NTU",0,1.0,0,4.0),
              "temperature":(round(22+s*6,1),"C",10,30,5,40),"conductivity":(round(250+s*200,0),"uS/cm",0,500,0,1000),
              "TDS":(round(180+s*150,0),"mg/L",0,300,0,600)}
    readings = []; overall = "NORMAL"
    for nm,(v,unit,nlo,nhi,wlo,whi) in params.items():
        if nlo<=v<=nhi: st="NORMAL"
        elif wlo<=v<=whi: st="WARNING"; overall = "WARNING" if overall=="NORMAL" else overall
        else: st="CRITICAL"; overall="CRITICAL"
        readings.append({"parameter":nm,"value":v,"unit":unit,"status":st,"normal_range":f"{nlo}-{nhi} {unit}".strip()})
    return {"facility_id":facility_id,"facility_name":meta["name"],"overall_status":overall,"readings":readings,
            "last_tested":datetime.datetime.utcnow().isoformat(),"note":"Simulated data -- real probe integration pending.","data_source":"SIMULATED"}


# 12. SMART ALERT CENTER
_alerts: dict = {}

def _init():
    if _alerts: return
    now = datetime.datetime.utcnow()
    base = [
        ("ALT-001","leak","BUILDING-B","Active Leak Detected","Sustained 75.2 L/min overnight exceeds 4.2 L/min baseline.","CRITICAL","OPEN","HIGH"),
        ("ALT-002","high_consumption","BUILDING-B","High Water Consumption","Daily usage 340% above benchmark for occupancy.","HIGH","OPEN","HIGH"),
        ("ALT-003","low_tank_level","BUILDING-B","Low Tank Level","Main roof tank at 28% capacity (threshold: 30%).","WARNING","OPEN","MEDIUM"),
        ("ALT-004","water_quality","BUILDING-E","Turbidity Spike","Turbidity 3.8 NTU exceeds 1.0 NTU normal threshold.","WARNING","OPEN","MEDIUM"),
        ("ALT-005","sensor_failure","BUILDING-B","Water Quality Probe Offline","Sensor BLD-B-WQP-02 offline for 3 hours.","WARNING","OPEN","LOW"),
        ("ALT-006","predicted_shortage","BUILDING-B","Shortage Predicted in 3 Days","Tank depletion projected by 2026-08-28.","HIGH","OPEN","HIGH"),
        ("ALT-007","unusual_occupancy","BUILDING-C","Occupancy-Flow Mismatch","120% more water flow than expected for 45 occupants.","MEDIUM","ACKNOWLEDGED","MEDIUM"),
        ("ALT-008","infrastructure","BUILDING-E","Booster Pump Vibration","Abnormal vibration on Pump E-P1 -- bearing wear.","WARNING","OPEN","MEDIUM"),
        ("ALT-009","high_consumption","BUILDING-E","Weekend Baseline Elevated","Off-day consumption 180% above weekend baseline.","MEDIUM","RESOLVED","LOW"),
        ("ALT-010","leak","BUILDING-A","Minor Drip Detected","Leak probability 12% on zone A-1 sub-meter.","LOW","OPEN","LOW"),
    ]
    for i,(aid,atype,fid,title,desc,sev,sta,pri) in enumerate(base):
        _alerts[aid]={"id":aid,"type":atype,"facility_id":fid,"title":title,"description":desc,"severity":sev,
                      "status":sta,"priority":pri,"created_at":(now-datetime.timedelta(hours=i*3)).isoformat(),
                      "acknowledged_by":None,"resolved_at":None}
_init()

@router.get("/alerts")
def get_alerts(status_filter: str = "all", type_filter: str = "all"):
    a = list(_alerts.values())
    if status_filter != "all": a = [x for x in a if x["status"].upper()==status_filter.upper()]
    if type_filter != "all": a = [x for x in a if x["type"]==type_filter]
    return {"alerts": sorted(a, key=lambda x: x["created_at"], reverse=True), "total": len(a), "data_source":"SIMULATED"}

@router.post("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, payload: dict = Body(default={})):
    if alert_id not in _alerts: return {"error":"Alert not found"}
    _alerts[alert_id]["status"]="ACKNOWLEDGED"; _alerts[alert_id]["acknowledged_by"]=payload.get("user","Ops Team")
    return {"status":"SUCCESS","alert_id":alert_id}

@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, payload: dict = Body(default={})):
    if alert_id not in _alerts: return {"error":"Alert not found"}
    _alerts[alert_id]["status"]="RESOLVED"; _alerts[alert_id]["resolved_at"]=datetime.datetime.utcnow().isoformat()
    return {"status":"SUCCESS","alert_id":alert_id}


# 13. SUSTAINABILITY GOALS
@router.get("/goals")
def get_sustainability_goals():
    today = datetime.date.today()
    goals = [
        {"id":"GOAL-001","title":"Reduce Water Consumption by 20%","category":"consumption","target":20.0,"current":8.4,"unit":"%","deadline":(today+datetime.timedelta(days=120)).isoformat(),"status":"ON_TRACK","description":"Reduce campus water use from 125,000 L/day baseline."},
        {"id":"GOAL-002","title":"Reduce Leakage by 30%","category":"leakage","target":30.0,"current":5.0,"unit":"%","deadline":(today+datetime.timedelta(days=60)).isoformat(),"status":"AT_RISK","description":"Active leak in Building B is blocking progress."},
        {"id":"GOAL-003","title":"Increase Rainwater Reuse to 15%","category":"reuse","target":15.0,"current":2.1,"unit":"%","deadline":(today+datetime.timedelta(days=180)).isoformat(),"status":"BEHIND","description":"Rainwater harvesting infrastructure not yet installed."},
        {"id":"GOAL-004","title":"Reduce Water Cost by 50000 INR/month","category":"cost","target":50000.0,"current":8400.0,"unit":"INR/month","deadline":(today+datetime.timedelta(days=90)).isoformat(),"status":"ON_TRACK","description":"Leak repair will recover 8400 INR/month."},
        {"id":"GOAL-005","title":"Greywater Reuse 10% of Demand","category":"greywater","target":10.0,"current":0.0,"unit":"%","deadline":(today+datetime.timedelta(days=240)).isoformat(),"status":"NOT_STARTED","description":"Feasibility study in progress."},
        {"id":"GOAL-006","title":"Sensor Fleet 99.5% Uptime","category":"sensor_health","target":99.5,"current":80.0,"unit":"%","deadline":(today+datetime.timedelta(days=30)).isoformat(),"status":"BEHIND","description":"2 sensors offline. Replacement ordered."},
    ]
    for g in goals: g["progress_pct"]=round(min(100,(g["current"]/g["target"])*100),1)
    return {"goals":goals,"data_source":"SIMULATED"}


# 14. LEADERBOARD
@router.get("/leaderboard")
def get_leaderboard():
    data={"BUILDING-A":(87,88,12400,1),"BUILDING-B":(41,38,0,8),"BUILDING-C":(73,75,8200,2),"BUILDING-D":(91,94,15600,0),"BUILDING-E":(65,67,5900,3)}
    rows=[]
    for fid,meta in FACILITY_META.items():
        sc,ef,sv,an=data[fid]
        rows.append({"facility_id":fid,"facility_name":meta["name"],"sustainability_score":sc,"water_efficiency_score":ef,
                     "monthly_savings_inr":sv,"anomaly_count":an,
                     "leakage_status":"CRITICAL" if fid=="BUILDING-B" else ("NONE" if an==0 else "LOW" if an<=1 else "MODERATE")})
    rows.sort(key=lambda r:r["sustainability_score"],reverse=True)
    for i,r in enumerate(rows): r["rank"]=i+1; r["badge"]="Best" if i==0 else "Worst" if i==len(rows)-1 else ""
    return {"leaderboard":rows,"data_source":"SIMULATED"}


# 15. AI REPORT GENERATOR
@router.post("/report")
def generate_water_report(payload: dict = Body(default={})):
    fid=payload.get("facility_id","ALL"); period=payload.get("period","Monthly"); today=datetime.date.today()
    return {"report_id":f"RPT-WATER-{today.strftime('%Y%m%d')}","title":f"Water Intelligence Report -- {period}",
            "generated_at":datetime.datetime.utcnow().isoformat(),"period":period,"facility_scope":fid,"data_source":"SIMULATED",
            "executive_summary":"Critical leak in Building B contributing to 54,600 L/month avoidable loss (8,400 INR/month). Building D leads with 91/100 sustainability score. Campus efficiency: 71.4/100.",
            "sections":{
                "water_consumption":{"total_campus_liters_per_day":127500,"benchmark_liters_per_day":95000,"variance_pct":"+34.2%","top_consumer":"BUILDING-B","key_points":["Building B consumes 38% above benchmark due to active leak.","Building D is 12% below benchmark.","Weekend consumption 2.3x higher than expected."]},
                "anomalies":{"total_anomalies":14,"critical":3,"high":4,"medium":5,"low":2,"top_anomaly":"Sustained 75.2 L/min nocturnal flow in Building B"},
                "leaks":{"active_leaks":1,"suspected_leaks":2,"monthly_loss_liters":54600,"monthly_loss_inr":8400,"facilities_affected":["BUILDING-B"]},
                "forecast":{"avg_daily_demand_liters":128000,"peak_expected_day":(today+datetime.timedelta(days=2)).isoformat(),"shortage_risk":"HIGH (Building B)"},
                "savings_opportunities":{"items":[{"action":"Fix Building B leak","monthly_saving_inr":8400,"water_saving_liters":54600},{"action":"Sub-metering Zone B-2","monthly_saving_inr":2100,"water_saving_liters":13650},{"action":"Rainwater harvesting all roofs","monthly_saving_inr":4500,"water_saving_liters":29000},{"action":"Greywater reuse system","monthly_saving_inr":3200,"water_saving_liters":20800}],"total_potential_monthly_inr":18200,"total_potential_liters_per_month":118050},
                "recommended_actions":["URGENT: Dispatch mechanical team to Building B Zone B-2 riser.","Install acoustic leak detection across all supply mains.","Implement rainwater harvesting on Building E (largest roof).","Upgrade Water Quality Probe BLDG-B-WQP-02 (offline).","Set alerts for overnight flow > 6 L/min."],
                "sustainability_scores":{"BUILDING-A":87,"BUILDING-B":41,"BUILDING-C":73,"BUILDING-D":91,"BUILDING-E":65}}}


# 16. ECOCORE COMMAND
@router.post("/command")
def run_water_command(payload: dict = Body(...)):
    cmd=payload.get("command","").lower(); fid=payload.get("facility_id","BUILDING-B")
    routes=[
        (["biggest","anomaly","anomalies"],"leak-detection","Routed to Predictive Leak Detection"),
        (["highest","consumption","most water"],"leaderboard","Routed to Facility Leaderboard"),
        (["predict","tomorrow","demand","forecast"],"shortage-prediction","Routed to Shortage Prediction"),
        (["leak","leaks","possible leak"],"leak-detection","Routed to Leak Detection Module"),
        (["save","saving","savings","reduction","15%"],"cost-simulator","Routed to Cost & Savings Simulator"),
        (["investigate","first","priority"],"root-cause","Routed to Root Cause Investigation"),
        (["quality","ph","turbidity"],"quality","Routed to Water Quality Monitor"),
        (["sensor","health","offline"],"sensor-health","Routed to Sensor Health Center"),
        (["goal","goals","target"],"goals","Routed to Sustainability Goals"),
        (["rank","leaderboard","best","worst"],"leaderboard","Routed to Facility Leaderboard"),
        (["twin","infrastructure","pipeline"],"digital-twin","Routed to Water Digital Twin"),
        (["report","summary","generate"],"report","Routed to AI Report Generator"),
    ]
    routed="leak-detection"; reason="No specific match. Defaulting to Leak Detection."
    for kws,ep,r in routes:
        if any(k in cmd for k in kws): routed=ep; reason=r; break
    rmap={"leak-detection":f"EcoCore -> WaterAgent: {fid} leak probability {'96%' if fid=='BUILDING-B' else '12%'}. {'CRITICAL action required.' if fid=='BUILDING-B' else 'Status normal.'}",
          "leaderboard":"EcoCore -> FacilityAgent: Building D scores 91/100 -- best. Building B worst at 41/100 due to active leak.",
          "shortage-prediction":f"EcoCore -> ForecastAgent: {fid} tank at {'28%' if fid=='BUILDING-B' else '65%'}. {'Shortage in 3 days.' if fid=='BUILDING-B' else 'No shortage risk in 7 days.'}",
          "cost-simulator":"EcoCore -> OptimizationAgent: 15% reduction saves 12,480 INR/month campus-wide. Building B leak repair saves 8,400 INR/month.",
          "root-cause":"EcoCore -> RootCauseAgent: Primary suspect -- Zone B-2 pressurized pipe leak (confidence 88%). Acoustic survey recommended.",
          "quality":f"EcoCore -> WaterAgent: {fid} quality is {'NORMAL' if fid!='BUILDING-E' else 'WARNING -- turbidity 3.8 NTU'}.",
          "sensor-health":"EcoCore -> FacilityAgent: 2 sensors OFFLINE, 3 DEGRADED. Fleet health 80%. Replacement ordered.",
          "goals":"EcoCore -> ImpactAgent: 3/6 goals on track. Leakage at 5% vs 30% target -- Building B repair is critical path.",
          "digital-twin":f"EcoCore -> WaterAgent: {fid} twin loaded. {'CRITICAL: Zone B-2 leak.' if fid=='BUILDING-B' else 'All infrastructure normal.'}",
          "report":"EcoCore -> AIReportAgent: Report generated. Critical: 54,600 L/month avoidable loss in Building B."}
    return {"command":payload.get("command",""),"routed_to":routed,"routing_reason":reason,"facility_id":fid,
            "response":rmap.get(routed,"Analysis complete."),"suggested_url":f"/water/{routed}","data_source":"SIMULATED"}


# 17. ACTIVITY TIMELINE
@router.get("/activity-timeline")
def get_activity_timeline(facility_id: str = "BUILDING-B"):
    now=datetime.datetime.utcnow(); meta=FACILITY_META.get(facility_id,FACILITY_META["BUILDING-B"])
    steps=[
        {"step":1,"label":"User Request","actor":"User","description":f"Investigate water anomaly in {meta['name']}","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=12)).isoformat(),"duration_ms":0},
        {"step":2,"label":"EcoCore Planning","actor":"EcoCore Supervisor","description":"Analyzing query intent. Selecting optimal agent DAG.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=11,seconds=50)).isoformat(),"duration_ms":120},
        {"step":3,"label":"WaterAgent Analysis","actor":"Water Agent","description":"Reading telemetry: 75.2 L/min flow vs 4.2 L/min expected.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=11,seconds=30)).isoformat(),"duration_ms":850},
        {"step":4,"label":"OccupancyAgent Check","actor":"Occupancy Agent","description":"Confirmed 0% occupancy during anomaly window.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=10,seconds=40)).isoformat(),"duration_ms":620},
        {"step":5,"label":"FacilityAgent Inspect","actor":"Facility Agent","description":f"Cross-referenced {meta['name']} CMMS. Last inspection: 45 days ago.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=10)).isoformat(),"duration_ms":710},
        {"step":6,"label":"Root Cause Analysis","actor":"RootCause Agent","description":"88% confidence: pressurized leak in Zone B-2 supply riser.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=9)).isoformat(),"duration_ms":1200},
        {"step":7,"label":"Finding Generated","actor":"EcoCore Supervisor","description":"CRITICAL: 54,600 L/month leak. 8,400 INR/month financial loss.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=8)).isoformat(),"duration_ms":90},
        {"step":8,"label":"Recommendation","actor":"Optimization Agent","description":"Dispatch maintenance. Isolate Zone B-2 valve. Schedule acoustic survey.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=7,seconds=30)).isoformat(),"duration_ms":540},
        {"step":9,"label":"Approval Requested","actor":"Approval Agent","description":"Approval APR-001 created for Operations Manager.","status":"COMPLETED","timestamp":(now-datetime.timedelta(minutes=6)).isoformat(),"duration_ms":200},
        {"step":10,"label":"Execution","actor":"Facility Team","description":"Maintenance dispatched. Zone B-2 valve isolated.","status":"IN_PROGRESS","timestamp":(now-datetime.timedelta(minutes=2)).isoformat(),"duration_ms":None},
        {"step":11,"label":"Verified Impact","actor":"Impact Agent","description":"Awaiting 24h verification window post-repair.","status":"PENDING","timestamp":None,"duration_ms":None},
    ]
    return {"facility_id":facility_id,"facility_name":meta["name"],"timeline":steps,
            "total_steps":len(steps),"completed_steps":sum(1 for s in steps if s["status"]=="COMPLETED"),"data_source":"SIMULATED"}


# 18. VERIFIED IMPACT
@router.get("/verified-impact")
def get_verified_impact(facility_id: str = "BUILDING-B"):
    meta=FACILITY_META.get(facility_id,FACILITY_META["BUILDING-B"]); today=datetime.date.today()
    ivs=[
        {"id":f"INT-{facility_id}-001","title":"Emergency Leak Repair -- Zone B-2 Riser","facility":meta["name"],
         "implemented_date":(today-datetime.timedelta(days=14)).isoformat(),"status":"VERIFIED",
         "expected":{"water_liters_per_month":54600,"cost_inr_per_month":8400,"co2_kg":54.6},
         "actual":{"water_liters_per_month":51800,"cost_inr_per_month":7970,"co2_kg":51.8},
         "accuracy_pct":94.9,"confidence":0.96},
        {"id":f"INT-{facility_id}-002","title":"Sub-Meter Installation -- Floors 1-3","facility":meta["name"],
         "implemented_date":(today-datetime.timedelta(days=7)).isoformat(),"status":"MONITORING",
         "expected":{"water_liters_per_month":13650,"cost_inr_per_month":2100,"co2_kg":13.7},
         "actual":{"water_liters_per_month":9800,"cost_inr_per_month":1510,"co2_kg":9.8},
         "accuracy_pct":71.8,"confidence":0.78},
    ]
    cum={"total_water_saved_liters":sum(i["actual"]["water_liters_per_month"] for i in ivs),
         "total_cost_saved_inr":sum(i["actual"]["cost_inr_per_month"] for i in ivs),
         "total_co2_avoided_kg":sum(i["actual"]["co2_kg"] for i in ivs),
         "interventions_count":len(ivs),
         "avg_accuracy_pct":round(sum(i["accuracy_pct"] for i in ivs)/len(ivs),1),
         "trees_equivalent":round(sum(i["actual"]["co2_kg"] for i in ivs)/21,1)}
    return {"facility_id":facility_id,"facility_name":meta["name"],"interventions":ivs,"cumulative":cum,
            "note":"Demo values -- real impact tracking requires sensor pre/post comparison.","data_source":"SIMULATED"}
