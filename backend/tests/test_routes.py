"""Backend unit tests for routes and API responses."""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_backend_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_backend_instance():
    response = client.post("/api/instance", json={"seed": 100})
    assert response.status_code == 200
    data = response.json()
    assert data["seed"] == 100
    assert len(data["nodes"]) == 25
    assert len(data["trips"]) == 120


def test_backend_compare():
    response = client.post("/api/compare", json={"seed": 42})
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "optimized" in data
