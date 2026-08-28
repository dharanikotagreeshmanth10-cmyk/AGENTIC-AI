# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database.session import engine
from app.database.base import Base
from app.database.mongodb import connect_mongodb, disconnect_mongodb, is_connected
from app.agents.agent_registry import agent_registry
from app.agents.energy_agent import EnergyAgent
from app.agents.water_agent import WaterAgent
from app.agents.waste_agent import WasteAgent
from app.agents.air_agent import AirQualityAgent
from app.agents.occupancy_agent import OccupancyAgent
from app.agents.facility_agent import FacilityAgent
from app.agents.forecast_agent import ForecastAgent
from app.agents.root_cause_agent import RootCauseAgent
from app.agents.optimization_agent import OptimizationAgent
from app.agents.simulation_agent import SimulationAgent
from app.agents.approval_agent import ApprovalAgent
from app.agents.impact_agent import ImpactAgent
from app.agents.ecocore import ecocore

# Import all API routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.energy import router as energy_router
from app.api.water import router as water_router
from app.api.waste import router as waste_router
from app.api.air import router as air_router
from app.api.occupancy import router as occupancy_router
from app.api.facilities import router as facilities_router
from app.api.agents import router as agents_router
from app.api.ai import router as ai_router
from app.api.simulation import router as simulation_router
from app.api.recommendations import router as recommendations_router
from app.api.approvals import router as approvals_router
from app.api.impact import router as impact_router
from app.api.reports import router as reports_router
from app.api.websocket import router as ws_router
from app.api.water_advanced import router as water_advanced_router
from app.api.calling_board import router as calling_board_router
from app.api.anomalies import router as anomalies_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────
    # Initialize SQLite tables
    Base.metadata.create_all(bind=engine)
    # Connect to MongoDB Atlas
    await connect_mongodb()
    print("EcoGenius backend initialized. All 12 specialized agents active.")
    yield
    # ── Shutdown ─────────────────────────────────────────────
    await disconnect_mongodb()
    print("EcoGenius backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent AI Sustainability Operations Platform & Command Center",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all 12 specialized agents + EcoCore in registry
agent_registry.register_agent(ecocore)
agent_registry.register_agent(EnergyAgent())
agent_registry.register_agent(WaterAgent())
agent_registry.register_agent(WasteAgent())
agent_registry.register_agent(AirQualityAgent())
agent_registry.register_agent(OccupancyAgent())
agent_registry.register_agent(FacilityAgent())
agent_registry.register_agent(ForecastAgent())
agent_registry.register_agent(RootCauseAgent())
agent_registry.register_agent(OptimizationAgent())
agent_registry.register_agent(SimulationAgent())
agent_registry.register_agent(ApprovalAgent())
agent_registry.register_agent(ImpactAgent())

# Include all API routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(energy_router, prefix=settings.API_V1_STR)
app.include_router(water_router, prefix=settings.API_V1_STR)
app.include_router(waste_router, prefix=settings.API_V1_STR)
app.include_router(air_router, prefix=settings.API_V1_STR)
app.include_router(occupancy_router, prefix=settings.API_V1_STR)
app.include_router(facilities_router, prefix=settings.API_V1_STR)
app.include_router(agents_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(simulation_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(approvals_router, prefix=settings.API_V1_STR)
app.include_router(impact_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(water_advanced_router, prefix=settings.API_V1_STR)
app.include_router(calling_board_router, prefix=settings.API_V1_STR)
app.include_router(anomalies_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/health")
async def health_check():
    return {
        "status": "ONLINE",
        "sqlite": "connected",
        "mongodb": "connected" if is_connected() else "disconnected",
        "mongodb_db": settings.MONGODB_DB_NAME if is_connected() else None,
    }

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "active_agents": len(agent_registry.get_all_agents()),
        "endpoints": {
            "dashboard": "/api/dashboard/overview",
            "agents": "/api/agents",
            "facilities": "/api/facilities",
            "ai_chat": "/api/ai/chat",
            "simulation": "/api/simulation/run",
            "approvals": "/api/approvals",
            "impact": "/api/impact",
            "websocket": "/ws/agent-events"
        }
    }
