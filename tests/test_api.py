"""Automated tests for Backend API and Integration layer.

Covers:
1. Health endpoint (GET /health)
2. Instance generation endpoint (POST /api/instance)
3. Baseline routing endpoint (POST /api/baseline)
4. Optimized routing endpoint (POST /api/optimize)
5. Comparison endpoint (POST /api/compare)
6. Route validation and disrupted edge enforcement
7. Rejection of invalid routes
8. Metrics calculation accuracy
9. Determinism across runs with the same seed
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.config import DISRUPTED_EDGE, EDGE_CAPACITY, GRID_SIZE, TOTAL_TRIPS
from backend.app.main import app
from backend.app.services.metrics import calculate_metrics, compute_edge_travel_time
from backend.app.services.validation import (
    ValidationError,
    is_disrupted_segment,
    validate_routes,
    validate_simulation_result,
)

client = TestClient(app)


def test_health_endpoint():
    """Verify GET /health returns status: ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_instance_structure_and_determinism():
    """Verify POST /api/instance returns valid structure and is deterministic."""
    resp1 = client.post("/api/instance", json={"seed": 42})
    assert resp1.status_code == 200
    data1 = resp1.json()

    # Verify seed
    assert data1["seed"] == 42

    # Verify nodes (5x5 = 25 nodes)
    assert len(data1["nodes"]) == 25
    for node in data1["nodes"]:
        assert len(node["id"]) == 2
        assert 0 <= node["x"] < GRID_SIZE
        assert 0 <= node["y"] < GRID_SIZE

    # Verify trips (120 trips)
    assert len(data1["trips"]) == TOTAL_TRIPS
    for i, trip in enumerate(data1["trips"]):
        assert trip["id"] == i
        assert trip["origin"] != trip["destination"]

    # Verify edges
    assert len(data1["edges"]) > 0
    disrupted_found = False
    for edge in data1["edges"]:
        assert edge["capacity"] == EDGE_CAPACITY
        if edge["disrupted"]:
            disrupted_found = True
            endpoints = {tuple(edge["from"]), tuple(edge["to"])}
            assert endpoints == {DISRUPTED_EDGE[0], DISRUPTED_EDGE[1]}
    assert disrupted_found, "Disrupted edge must be marked in instance edges"

    # Verify determinism
    resp2 = client.post("/api/instance", json={"seed": 42})
    assert resp2.json() == data1


def test_api_baseline():
    """Verify POST /api/baseline returns valid routes, edge_flows, and metrics."""
    response = client.post("/api/baseline", json={"seed": 42})
    assert response.status_code == 200
    data = response.json()

    assert "baseline" in data
    baseline = data["baseline"]
    assert len(baseline["routes"]) == TOTAL_TRIPS
    assert len(baseline["edge_flows"]) > 0
    assert "mean_travel_time" in baseline["metrics"]
    assert "p95_travel_time" in baseline["metrics"]
    assert "max_congestion_ratio" in baseline["metrics"]

    # Verify no route traverses the disrupted edge
    for route in baseline["routes"]:
        path = route["path"]
        for i in range(len(path) - 1):
            assert not is_disrupted_segment(path[i], path[i + 1])


def test_api_optimize():
    """Verify POST /api/optimize returns valid optimized result."""
    response = client.post("/api/optimize", json={"seed": 42})
    assert response.status_code == 200
    data = response.json()

    assert "optimized" in data
    optimized = data["optimized"]
    assert len(optimized["routes"]) == TOTAL_TRIPS
    assert len(optimized["edge_flows"]) > 0
    assert optimized["metrics"]["mean_travel_time"] > 0
    assert optimized["metrics"]["p95_travel_time"] > 0
    assert optimized["metrics"]["max_congestion_ratio"] >= 0


def test_api_compare():
    """Verify POST /api/compare returns both baseline and optimized with seed."""
    response = client.post("/api/compare", json={"seed": 42})
    assert response.status_code == 200
    data = response.json()

    assert data["seed"] == 42
    assert "baseline" in data
    assert "optimized" in data
    assert len(data["baseline"]["routes"]) == TOTAL_TRIPS
    assert len(data["optimized"]["routes"]) == TOTAL_TRIPS


def test_invalid_seed():
    """Verify negative seed returns 400 Bad Request."""
    response = client.post("/api/instance", json={"seed": -1})
    assert response.status_code == 400
    assert "detail" in response.json()


def test_route_validation_rejection():
    """Verify validator rejects invalid routes (e.g. crossing disrupted edge or wrong endpoint)."""
    trips = [
        {"id": 0, "origin": [2, 2], "destination": [3, 2]},
    ]
    # Route that attempts to cross the disrupted edge (2,2) -> (3,2)
    invalid_routes = [
        {"trip_id": 0, "path": [[2, 2], [3, 2]], "travel_time": 1.0}
    ]
    with pytest.raises(ValidationError, match="traversed disrupted edge"):
        validate_routes(invalid_routes, trips)

    # Route that does not reach destination
    wrong_destination_routes = [
        {"trip_id": 0, "path": [[2, 2], [2, 3], [3, 3]], "travel_time": 2.0}
    ]
    with pytest.raises(ValidationError, match="does not end at destination"):
        validate_routes(wrong_destination_routes, trips)

    # Route that is not a simple path (loop)
    loop_routes = [
        {"trip_id": 0, "path": [[2, 2], [2, 3], [2, 2], [2, 1], [3, 1], [3, 2]], "travel_time": 5.0}
    ]
    with pytest.raises(ValidationError, match="not a simple path"):
        validate_routes(loop_routes, trips)


def test_metrics_calculation_formula():
    """Verify BPR formula and metrics calculations match Contract.md."""
    # Free-flow: flow = 0 -> time = 1.0
    assert compute_edge_travel_time(0) == 1.0
    # Capacity: flow = 8 -> 1 + 0.15 * (8/8)^4 = 1.15
    assert compute_edge_travel_time(8) == 1.15
    # Over capacity: flow = 16 -> 1 + 0.15 * (16/8)^4 = 1 + 0.15 * 16 = 3.40
    assert compute_edge_travel_time(16) == 3.40

    sample_routes = [
        {"trip_id": 0, "travel_time": 2.0},
        {"trip_id": 1, "travel_time": 4.0},
    ]
    sample_flows = {"0,0-0,1": 8, "0,1-0,2": 16}
    metrics = calculate_metrics(sample_routes, sample_flows)

    assert metrics["mean_travel_time"] == 3.0
    assert metrics["max_congestion_ratio"] == 2.0
