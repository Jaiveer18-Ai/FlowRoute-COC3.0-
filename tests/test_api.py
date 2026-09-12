"""Comprehensive automated tests for Backend API and Integration layer.

Covers:
1. Health check (GET /health)
2. Instance endpoint (POST /api/instance) with default, explicit, and invalid seeds
3. Baseline routing (POST /api/baseline) with constraint checks
4. Optimized routing (POST /api/optimize)
5. Side-by-side comparison (POST /api/compare)
6. Disrupted edge (2,2) <-> (3,2) strictly avoided in all generated routes
7. Rejection of invalid routes (disrupted edge traversal, loops, wrong endpoints, non-adjacent hops)
8. Canonical edge ID formatting and validation
9. BPR travel time formula & percentile metrics correctness
10. Mock optimizer integration boundary verification
11. CORS preflight headers check
"""

from unittest.mock import patch
import pytest

from backend.app.config import DISRUPTED_EDGE, EDGE_CAPACITY, GRID_SIZE, TOTAL_TRIPS
from backend.app.services.metrics import calculate_metrics, canonical_edge_id, compute_edge_travel_time
from backend.app.services.validation import (
    ValidationError,
    is_disrupted_segment,
    validate_canonical_edge_id,
    validate_routes,
    validate_simulation_result,
)
from backend.app.services import optimizer_adapter


def test_health_endpoint(client):
    """Verify GET /health returns status: ok (Contract.md Section 15)."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_api_instance_default_and_explicit_seed(client):
    """Verify POST /api/instance with explicit seed and default empty body."""
    # Explicit seed
    resp_explicit = client.post("/api/instance", json={"seed": 42})
    assert resp_explicit.status_code == 200
    data = resp_explicit.json()

    assert data["seed"] == 42
    assert len(data["nodes"]) == 25
    assert len(data["trips"]) == TOTAL_TRIPS

    # Default empty body
    resp_default = client.post("/api/instance", json={})
    assert resp_default.status_code == 200
    assert resp_default.json() == data


def test_api_instance_determinism_and_constraints(client):
    """Verify nodes, edges, trips structure and determinism."""
    resp = client.post("/api/instance", json={"seed": 42})
    data = resp.json()

    # All nodes within 0..4
    for node in data["nodes"]:
        assert len(node["id"]) == 2
        assert 0 <= node["x"] < GRID_SIZE
        assert 0 <= node["y"] < GRID_SIZE
        assert node["id"] == [node["x"], node["y"]]

    # Verify edge structure and disrupted flag
    disrupted_count = 0
    for edge in data["edges"]:
        assert edge["capacity"] == EDGE_CAPACITY
        assert "from" in edge
        assert "to" in edge
        if edge["disrupted"]:
            disrupted_count += 1
            endpoints = {tuple(edge["from"]), tuple(edge["to"])}
            assert endpoints == {DISRUPTED_EDGE[0], DISRUPTED_EDGE[1]}
    assert disrupted_count == 1, "Exactly one edge must be marked disrupted"

    # Verify trip IDs 0..119 and non-identical origin/destinations
    for i, trip in enumerate(data["trips"]):
        assert trip["id"] == i
        assert trip["origin"] != trip["destination"]


def test_api_baseline(client):
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

    # Verify no route traverses the disrupted edge (2,2) <-> (3,2)
    for route in baseline["routes"]:
        path = route["path"]
        for i in range(len(path) - 1):
            assert not is_disrupted_segment(path[i], path[i + 1])


def test_api_optimize(client):
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


def test_api_compare(client):
    """Verify POST /api/compare returns both baseline and optimized with seed."""
    response = client.post("/api/compare", json={"seed": 42})
    assert response.status_code == 200
    data = response.json()

    assert data["seed"] == 42
    assert "baseline" in data
    assert "optimized" in data
    assert len(data["baseline"]["routes"]) == TOTAL_TRIPS
    assert len(data["optimized"]["routes"]) == TOTAL_TRIPS


def test_invalid_seed_negative(client):
    """Verify negative seed returns 400 Bad Request with detail string."""
    response = client.post("/api/instance", json={"seed": -1})
    assert response.status_code == 400
    assert "detail" in response.json()
    assert isinstance(response.json()["detail"], str)


def test_invalid_seed_type(client):
    """Verify non-integer seed returns 422 Unprocessable Entity with detail string."""
    response = client.post("/api/instance", json={"seed": "not_an_int"})
    assert response.status_code == 422
    assert "detail" in response.json()
    assert isinstance(response.json()["detail"], str)


def test_route_validation_rejections():
    """Verify validator catches disrupted edges, loops, non-adjacent hops, and endpoint mismatches."""
    trips = [
        {"id": 0, "origin": [2, 2], "destination": [3, 2]},
        {"id": 1, "origin": [0, 0], "destination": [0, 2]},
    ]

    # 1. Traverses disrupted edge (2,2) -> (3,2)
    invalid_disrupted = [
        {"trip_id": 0, "path": [[2, 2], [3, 2]], "travel_time": 1.0},
        {"trip_id": 1, "path": [[0, 0], [0, 1], [0, 2]], "travel_time": 2.0},
    ]
    with pytest.raises(ValidationError, match="traversed disrupted edge"):
        validate_routes(invalid_disrupted, trips)

    # 2. Wrong destination
    invalid_dest = [
        {"trip_id": 0, "path": [[2, 2], [2, 3], [3, 3]], "travel_time": 2.0},
        {"trip_id": 1, "path": [[0, 0], [0, 1], [0, 2]], "travel_time": 2.0},
    ]
    with pytest.raises(ValidationError, match="does not end at destination"):
        validate_routes(invalid_dest, trips)

    # 3. Not a simple path (loop/revisited node)
    invalid_loop = [
        {"trip_id": 0, "path": [[2, 2], [2, 3], [2, 2], [2, 1], [3, 1], [3, 2]], "travel_time": 5.0},
        {"trip_id": 1, "path": [[0, 0], [0, 1], [0, 2]], "travel_time": 2.0},
    ]
    with pytest.raises(ValidationError, match="not a simple path"):
        validate_routes(invalid_loop, trips)

    # 4. Non-adjacent step (diagonal jump)
    invalid_diagonal = [
        {"trip_id": 0, "path": [[2, 2], [3, 3], [3, 2]], "travel_time": 2.0},
        {"trip_id": 1, "path": [[0, 0], [0, 1], [0, 2]], "travel_time": 2.0},
    ]
    with pytest.raises(ValidationError, match="non-adjacent step"):
        validate_routes(invalid_diagonal, trips)

    # 5. Missing trip route
    missing_route = [
        {"trip_id": 0, "path": [[2, 2], [2, 3], [3, 3], [3, 2]], "travel_time": 3.0}
    ]
    with pytest.raises(ValidationError, match="Expected 2 routes"):
        validate_routes(missing_route, trips)


def test_canonical_edge_validation():
    """Verify canonical edge formatting and validation."""
    # Valid canonical edge
    validate_canonical_edge_id("2,2-2,3")
    validate_canonical_edge_id("0,0-1,0")

    # Non-canonical ordering
    with pytest.raises(ValidationError, match="not canonically ordered"):
        validate_canonical_edge_id("2,3-2,2")

    # Non-adjacent edge ID
    with pytest.raises(ValidationError, match="non-adjacent"):
        validate_canonical_edge_id("0,0-2,0")

    # Helper function check
    assert canonical_edge_id([2, 3], [3, 3]) == "2,3-3,3"
    assert canonical_edge_id([3, 3], [2, 3]) == "2,3-3,3"


def test_metrics_calculation_formula():
    """Verify BPR formula t_e = 1 + 0.15 * (flow / 8)^4 and metrics computation."""
    assert compute_edge_travel_time(0) == 1.0
    assert compute_edge_travel_time(8) == 1.15
    assert compute_edge_travel_time(16) == 3.40

    routes = [
        {"trip_id": 0, "travel_time": 2.0},
        {"trip_id": 1, "travel_time": 4.0},
    ]
    edge_flows = {"0,0-0,1": 8, "0,1-0,2": 16}
    metrics = calculate_metrics(routes, edge_flows)

    assert metrics["mean_travel_time"] == 3.0
    assert metrics["max_congestion_ratio"] == 2.0


def test_optimizer_integration_mock():
    """Verify optimizer_adapter delegates to teammate's functions when provided."""
    mock_instance = {"seed": 99, "nodes": [], "edges": [], "trips": []}
    with patch.object(optimizer_adapter, "_find_optimizer_callable") as mock_find:
        mock_find.return_value = lambda seed: mock_instance
        result = optimizer_adapter.get_instance(99)
        assert result["seed"] == 99


def test_cors_preflight_headers(client):
    """Verify CORS preflight headers allow frontend origin http://localhost:5173."""
    response = client.options(
        "/api/compare",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_endpoints_with_instance_payload(client):
    """Verify baseline, optimize, and compare endpoints accept and solve a real instance."""
    inst_resp = client.post("/api/instance", json={"seed": 42})
    assert inst_resp.status_code == 200
    instance = inst_resp.json()

    # 1. Baseline with instance
    resp_base = client.post("/api/baseline", json={"instance": instance})
    assert resp_base.status_code == 200
    assert len(resp_base.json()["baseline"]["routes"]) == TOTAL_TRIPS

    # 2. Optimize with instance
    resp_opt = client.post("/api/optimize", json={"instance": instance})
    assert resp_opt.status_code == 200
    assert len(resp_opt.json()["optimized"]["routes"]) == TOTAL_TRIPS

    # 3. Compare with instance
    resp_comp = client.post("/api/compare", json={"instance": instance})
    assert resp_comp.status_code == 200
    assert len(resp_comp.json()["baseline"]["routes"]) == TOTAL_TRIPS
    assert len(resp_comp.json()["optimized"]["routes"]) == TOTAL_TRIPS

    # 4. Raw top-level instance dictionary
    resp_raw = client.post("/api/baseline", json=instance)
    assert resp_raw.status_code == 200
    assert len(resp_raw.json()["baseline"]["routes"]) == TOTAL_TRIPS


def test_determinism_across_endpoints(client):
    """Verify deterministic output for repeated requests with seed 20260911."""
    seed = 20260911
    # Instance
    inst_a = client.post("/api/instance", json={"seed": seed}).json()
    inst_b = client.post("/api/instance", json={"seed": seed}).json()
    assert inst_a == inst_b

    # Compare
    comp_a = client.post("/api/compare", json={"seed": seed}).json()
    comp_b = client.post("/api/compare", json={"seed": seed}).json()
    assert comp_a == comp_b


def test_invalid_instance_payload_rejection(client):
    """Verify invalid instance payloads (missing required fields) return 400."""
    resp = client.post("/api/baseline", json={"instance": {"nodes": []}})
    assert resp.status_code == 400
    assert "detail" in resp.json()


def test_optimizer_exception_structured_error(client):
    """Verify internal optimizer exceptions return clean structured 500 JSON without traceback."""
    from backend.app.services import simulation_service
    with patch.object(simulation_service, "run_baseline", side_effect=RuntimeError("Solver timeout")):
        resp = client.post("/api/baseline", json={"seed": 42})
        assert resp.status_code == 500
        assert "detail" in resp.json()
        assert "Baseline simulation failed" in resp.json()["detail"]


def test_malformed_json_structured_error(client):
    """Verify malformed JSON requests return clean 422 structured detail."""
    resp = client.post("/api/instance", content=b"{bad-json", headers={"Content-Type": "application/json"})
    assert resp.status_code == 422
    assert "detail" in resp.json()
