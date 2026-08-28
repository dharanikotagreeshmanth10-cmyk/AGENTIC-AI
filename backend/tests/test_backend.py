
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.agents.agent_registry import agent_registry

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["active_agents"] == 13

def test_dashboard_kpis():
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "sustainability_score" in data
    assert data["active_anomalies"] >= 4

def test_facilities_benchmark():
    response = client.get("/api/facilities/benchmark")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    # Building A should be highest ranked, Building B should have lowest/low score
    assert data[0]["id"] == "BUILDING-A"

def test_agents_list():
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
    ids = [a["id"] for a in data]
    assert "energy-agent" in ids
    assert "water-agent" in ids
    assert "root-cause-agent" in ids
    assert "optimization-agent" in ids

def test_ai_chat():
    response = client.post("/api/ai/chat", json={"message": "Find the biggest sustainability problem right now", "facility_id": "BUILDING-B"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert "Building B" in data["summary"] or "water" in data["summary"].lower()

def test_simulation():
    response = client.post("/api/simulation/run", json={
        "hvac_temperature_change": 2.0,
        "lighting_reduction_pct": 30.0,
        "operating_hours_reduction": 2.0,
        "water_leak_fixed": True,
        "irrigation_optimization": True
    })
    assert response.status_code == 200
    data = response.json()
    assert data["savings"]["water_liters"] >= 54600.0
    assert data["savings"]["cost_inr"] > 0
