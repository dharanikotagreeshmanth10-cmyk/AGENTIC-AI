from fastapi import APIRouter, Body
from app.simulation.engine import SimulationEngine

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/run")
def run_simulation(payload: dict = Body(...)):
    return SimulationEngine.run_simulation(payload)
