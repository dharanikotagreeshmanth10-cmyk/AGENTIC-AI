# EcoGenius — AI Sustainability Command Center

EcoGenius is a production-quality enterprise multi-agent AI sustainability operations platform designed to analyze energy, water, waste, air quality, occupancy, and facility data across campus facilities to identify anomalies, forecast demand, simulate what-if interventions, enforce human-in-the-loop approvals, and verify post-implementation impact.

---

## 🌟 System Architecture

```
                               ┌─────────────────────────┐
                               │   Enterprise Operator   │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │   Next.js 14 Dashboard  │
                               │ (Command Center + Graph)│
                               └────────────┬────────────┘
                                            │ REST + WebSocket (/ws/agent-events)
                               ┌────────────▼────────────┐
                               │     FastAPI Backend     │
                               └────────────┬────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │                            │                            │
   ┌───────────▼───────────┐    ┌───────────▼───────────┐    ┌───────────▼───────────┐
   │   EcoCore Supervisor  │    │   Agent Registry &    │    │      Event Bus &      │
   │      (Main Agent)     │    │     Task Manager      │    │    WebSocket Hub      │
   └───────────┬───────────┘    └───────────────────────┘    └───────────────────────┘
               │
    ┌──────────┴─────────────────────────┐
    │                                    │
┌───▼──────────────────────────┐     ┌───▼──────────────────────────┐
│   Specialized Telemetry      │     │    Operational & Impact      │
│          Agents              │     │           Agents             │
│ • EnergyAgent                │     │ • ForecastAgent              │
│ • WaterAgent (Leak Detector) │     │ • RootCauseAgent             │
│ • WasteAgent                 │     │ • OptimizationAgent          │
│ • AirQualityAgent            │     │ • SimulationAgent            │
│ • OccupancyAgent             │     │ • ApprovalAgent (Governance) │
│ • FacilityAgent              │     │ • ImpactAgent (Ledger)       │
└───┬──────────────────────────┘     └───┬──────────────────────────┘
    │                                    │
    └──────────────────┬─────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  PostgreSQL / SQLite Engine │
        │  (180 Days Sensor Telemetry)│
        └─────────────────────────────┘
```

---

## 🚀 How to Run the Application

### Option 1: One-Click Launch (Windows)
Run the provided launch script in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```
Or double-click `start.bat`.

### Option 2: Manual Terminal Startup

**Terminal 1 — Backend:**
```powershell
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 🎯 Signature Hackathon Demo Flow (Building B Water Leak)

1. Open **[http://localhost:3000](http://localhost:3000)** or click **"Launch Signature Demo"** in the top navbar.
2. In the **EcoCore Supervisor** (`/agent`), the user asks:
   > *"Find the biggest sustainability problem right now."*
3. **EcoCore** plans the DAG and dispatches `WaterAgent`, `OccupancyAgent`, `FacilityAgent`, and `ForecastAgent` in parallel.
4. The **Live Orchestration Graph** illuminates active agents in real time.
5. **RootCauseAgent** isolates a continuous 75.2 L/min overnight pipe leak in Building B Zone B-2 (54,600 L/mo and ₹8,400/mo waste) with zero night occupancy.
6. **OptimizationAgent** & **SimulationAgent** formulate an immediate isolation & valve replacement action (Cost: ₹3,000 | Payback: 11 days | ROI: 33.6x).
7. **ApprovalAgent** posts the action to the **Governance Center** (`/approvals`).
8. The operator clicks **APPROVE**.
9. **ImpactAgent** records the verified recovery of 54,600 L/mo and ₹8,400/mo in the **Verified Impact Ledger** (`/impact`).

---

## 🤖 Specialized AI Agents (12 + 1)

| Agent | ID | Role & Core Capabilities |
| :--- | :--- | :--- |
| **EcoCore** | `ecocore` | Main Supervisor: Task planning, agent DAG selection, parallel dispatch, synthesis, lifecycle action routing. |
| **EnergyAgent** | `energy-agent` | Electrical loads, HVAC/lighting breakdown, off-hours baselines, peak demand kW. |
| **WaterAgent** | `water-agent` | Nocturnal flow spike detection, leak probability, per-person water consumption. |
| **WasteAgent** | `waste-agent` | Landfill tonnage, recycling diversion rate, stream contamination tracking. |
| **AirQualityAgent** | `air-agent` | Indoor AQI, PM2.5, PM10, CO2 accumulation, demand-controlled ventilation turnover. |
| **OccupancyAgent** | `occupancy-agent` | Spatial utilization %, headcount, `RESOURCE_MISMATCH` detection. |
| **FacilityAgent** | `facility-agent` | 8-building normalized benchmarking, 0-100 sustainability index, peer rankings. |
| **ForecastAgent** | `forecast-agent` | 24-hour predictive forecast bands using seasonal regression & confidence intervals. |
| **RootCauseAgent** | `root-cause-agent` | Cross-telemetry evidence synthesis, root cause isolation without raw chain-of-thought exposure. |
| **OptimizationAgent**| `optimization-agent`| Action formulation with ROI, payback period, and quantified resource/cost savings. |
| **SimulationAgent** | `simulation-agent` | Real-time what-if parameter simulation (HVAC setpoints, lighting dimming, operating hours, leak repair). |
| **ApprovalAgent** | `approval-agent` | Safety governance state machine (`PENDING -> APPROVED / REJECTED -> IMPLEMENTED`). |
| **ImpactAgent** | `impact-agent` | Post-implementation verified telemetry ledger and cumulative savings tracking. |

---

## 📡 REST API & WebSocket Endpoints

- **Dashboard**: `GET /api/dashboard/overview`, `GET /api/dashboard/kpis`
- **Energy**: `GET /api/energy/current`, `GET /api/energy/history`, `GET /api/energy/forecast`, `GET /api/energy/anomalies`
- **Water**: `GET /api/water/current`, `GET /api/water/history`, `GET /api/water/forecast`, `GET /api/water/leaks`
- **Waste**: `GET /api/waste/history`, `GET /api/waste/analysis`
- **Air Quality**: `GET /api/air/current`, `GET /api/air/history`, `GET /api/air/anomalies`
- **Occupancy**: `GET /api/occupancy/current`, `GET /api/occupancy/history`, `GET /api/occupancy/forecast`
- **Facilities**: `GET /api/facilities`, `GET /api/facilities/{id}`, `GET /api/facilities/benchmark`
- **Agents**: `GET /api/agents`, `GET /api/agents/{id}`, `GET /api/agents/health`, `GET /api/agents/tasks`, `GET /api/agents/timeline`
- **AI Orchestration**: `POST /api/ai/chat`, `POST /api/ai/investigate`, `POST /api/ai/recommend`
- **Simulation**: `POST /api/simulation/run`
- **Recommendations**: `GET /api/recommendations`, `GET /api/recommendations/{id}`
- **Approvals**: `GET /api/approvals`, `POST /api/approvals/{id}/approve`, `POST /api/approvals/{id}/reject`
- **Impact**: `GET /api/impact`, `GET /api/impact/{id}`
- **Reports**: `POST /api/reports/generate`
- **WebSocket**: `/ws/agent-events`
