# FlowRoute — Backend & Integration Layer

This directory contains the FastAPI backend and integration service for **FlowRoute** (Clash of Coders — AI-02: System-Optimal Transit Rerouting Under Disruption), strictly adhering to `Contract.md`.

---

## 1. Responsibilities

The backend acts as the bridge connecting:
- **Frontend** (`http://localhost:5173`)
- **Optimizer Engine** (`optimizer/` package owned by Person 3)

Key duties:
- Exposing the agreed REST API endpoints.
- Validating incoming requests and simulation outputs.
- Enforcing problem constraints (5x5 grid, 120 trips, disrupted edge `(2,2) <-> (3,2)` never traversed, simple paths).
- Calculating and reporting required evaluation metrics:
  - Mean final trip travel time
  - 95th percentile trip travel time
  - Maximum congestion ratio
- Providing CORS headers for local frontend development.

---

## 2. Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py             # Route handlers (/health, /api/*)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── metrics.py            # BPR congestion & travel time metrics
│   │   ├── optimizer_adapter.py  # Bridge to Person 3's optimizer package
│   │   ├── simulation_service.py # Simulation execution & validation orchestration
│   │   └── validation.py         # Route & constraint validator
│   ├── __init__.py
│   ├── config.py                 # Network constants & CORS origins
│   ├── main.py                   # FastAPI entrypoint & middleware
│   └── schemas.py                # Pydantic models (nodes, edges, trips, routes, metrics)
├── tests/
│   ├── __init__.py
│   └── test_routes.py            # Route tests
├── requirements.txt              # Backend dependencies
└── README.md                     # This documentation
```

---

## 3. Installation

Ensure Python 3.11+ is installed.

```bash
# From repository root or backend directory
pip install -r backend/requirements.txt
```

---

## 4. Starting the Server

To start the backend server on `http://localhost:8000`:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 5. API Endpoints & Contract

### `GET /health`
Verifies server health.

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### `POST /api/instance`
Generates a deterministic 5x5 network instance with 120 trips.

**Request:**
```json
{
  "seed": 42
}
```

**Response (200 OK):**
```json
{
  "seed": 42,
  "nodes": [
    { "id": [0, 0], "x": 0, "y": 0 },
    ...
  ],
  "edges": [
    {
      "id": "2,2-2,3",
      "from": [2, 2],
      "to": [2, 3],
      "capacity": 8,
      "free_flow_time": 1.0,
      "flow": 0,
      "travel_time": 1.0,
      "disrupted": false
    },
    ...
  ],
  "trips": [
    { "id": 0, "origin": [0, 0], "destination": [4, 4] },
    ...
  ]
}
```

---

### `POST /api/baseline`
Calculates baseline routing and congestion metrics.

**Request:**
```json
{
  "seed": 42
}
```

**Response (200 OK):**
```json
{
  "baseline": {
    "routes": [
      {
        "trip_id": 0,
        "path": [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]],
        "travel_time": 8.23
      }
    ],
    "edge_flows": {
      "0,0-1,0": 15
    },
    "metrics": {
      "mean_travel_time": 3.21,
      "p95_travel_time": 5.83,
      "max_congestion_ratio": 2.50
    }
  }
}
```

---

### `POST /api/optimize`
Runs congestion-aware optimization.

**Request:**
```json
{
  "seed": 42
}
```

**Response (200 OK):**
```json
{
  "optimized": {
    "routes": [ ... ],
    "edge_flows": { ... },
    "metrics": {
      "mean_travel_time": 2.74,
      "p95_travel_time": 4.42,
      "max_congestion_ratio": 1.75
    }
  }
}
```

---

### `POST /api/compare` *(Primary Frontend Endpoint)*
Executes both baseline and optimized workflows and returns complete side-by-side data.

**Request:**
```json
{
  "seed": 42
}
```

**Response (200 OK):**
```json
{
  "seed": 42,
  "baseline": {
    "routes": [ ... ],
    "edge_flows": { ... },
    "metrics": {
      "mean_travel_time": 3.21,
      "p95_travel_time": 5.83,
      "max_congestion_ratio": 2.50
    }
  },
  "optimized": {
    "routes": [ ... ],
    "edge_flows": { ... },
    "metrics": {
      "mean_travel_time": 2.74,
      "p95_travel_time": 4.42,
      "max_congestion_ratio": 1.75
    }
  }
}
```

---

## 6. How Backend Communicates with Optimizer

The backend communicates with Person 3's `optimizer/` package via `backend/app/services/optimizer_adapter.py`.

As specified in `Contract.md` Section 13, the optimizer must expose:
- `build_instance(seed: int = 42) -> dict`
- `solve_baseline(instance: dict) -> dict`
- `solve_optimized(instance: dict) -> dict`
- `calculate_metrics(routes: list, edge_flows: dict) -> dict`

The adapter automatically binds to these functions when `optimizer/` is imported. If `optimizer/` is not yet available, the adapter uses a reference fallback implementation to unblock frontend development and testing immediately.

---

## 7. Running Automated Tests

```bash
pytest
```
All 11 tests in `tests/test_api.py` and `backend/tests/test_routes.py` will execute.
