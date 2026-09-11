# FlowRoute AI — Shared Engineering Contract

Version: 1.0
Status: ACTIVE
Project: Clash of Coders — AI-02
Purpose: Shared interface contract between Frontend, Backend, and Optimization components.

---

## 1. SOURCE OF TRUTH

This file defines the interfaces that all contributors must follow.

The three major components are:

1. `frontend/` — React visualization and user interface
2. `backend/` — FastAPI API and orchestration
3. `optimizer/` — graph generation, trip generation, routing, congestion simulation, and optimization

### Rule

No contributor should independently change:

* API endpoint names
* JSON field names
* Python function signatures
* metric definitions
* node/edge representation
* route representation
* instance generation rules

without team approval.

If a change is necessary, update this contract first and notify all contributors.

---

# 2. PROBLEM DEFINITION

The system solves:

**AI-02 — System-Optimal Transit Rerouting After a Network Disruption**

The simulation uses:

* A 5×5 bidirectional grid
* Free-flow travel time = `1`
* Edge capacity = `8`
* One disrupted edge:

  * `(2,2) <-> (3,2)`
* 120 generated trips
* Congestion-adjusted edge travel time:

```text
t_e = 1 + 0.15 * (f_e / 8)^4
```

where:

* `f_e` = number of trips using the edge
* `8` = edge capacity

The system must compare:

1. Baseline routing
2. Congestion-aware optimized routing

The final system must report:

* Mean final trip travel time
* 95th percentile trip travel time
* Maximum congestion ratio

The system must also visualize edge flows/congestion and selected routes.

---

# 3. REPOSITORY STRUCTURE

```text
flowroute-ai/
│
├── CONTRACT.md
├── README.md
├── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   └── ...
│
├── optimizer/
│   ├── graph.py
│   ├── trips.py
│   ├── baseline.py
│   ├── congestion.py
│   ├── optimize.py
│   ├── metrics.py
│   └── __init__.py
│
├── tests/
│   ├── test_graph.py
│   ├── test_trips.py
│   ├── test_baseline.py
│   ├── test_optimizer.py
│   └── test_api.py
│
└── contract/
    ├── sample_instance.json
    └── sample_result.json
```

---

# 4. CORE DATA MODEL

## 4.1 Node

A node is represented as:

```json
{
  "id": [2, 3],
  "x": 2,
  "y": 3
}
```

Coordinates are integers from `0` through `4`.

The canonical node identifier is:

```text
[x, y]
```

---

# 5. EDGE MODEL

Each edge is bidirectional.

Canonical JSON representation:

```json
{
  "id": "2,2-2,3",
  "from": [2, 2],
  "to": [2, 3],
  "capacity": 8,
  "free_flow_time": 1,
  "flow": 0,
  "travel_time": 1.0,
  "disrupted": false
}
```

### Edge rules

Every normal adjacent grid pair has:

```text
capacity = 8
free_flow_time = 1
```

The disrupted edge:

```text
(2,2) <-> (3,2)
```

must not be usable.

The optimizer must never generate a route containing the disrupted edge.

---

# 6. TRIP MODEL

Each of the 120 trips is represented as:

```json
{
  "id": 0,
  "origin": [0, 0],
  "destination": [4, 4]
}
```

Trip IDs must be deterministic:

```text
0 ... 119
```

The instance generator must accept a seed.

Example:

```python
instance = build_instance(seed=42)
```

Using the same seed must generate the same instance.

---

# 7. ROUTE MODEL

A route is represented as an ordered list of nodes.

Example:

```json
{
  "trip_id": 0,
  "path": [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4]
  ],
  "travel_time": 8.23
}
```

Rules:

* First node = trip origin
* Last node = trip destination
* Consecutive nodes must be adjacent
* Disrupted edge must never appear
* Path must be valid in the current graph

---

# 8. EDGE FLOW MODEL

Edge flows must be reported using a canonical string ID.

Example:

```json
{
  "2,2-2,3": 7,
  "2,3-3,3": 12
}
```

For bidirectional edges, flow must be aggregated unless explicitly stated otherwise.

Therefore:

```text
A -> B
B -> A
```

use the same canonical edge ID.

The canonical edge ID must always order endpoints deterministically.

Example:

```text
[2,3] and [3,3]

=> "2,3-3,3"
```

---

# 9. CONGESTION CALCULATION

For every usable edge:

```text
travel_time = 1 + 0.15 * (flow / 8)^4
```

Python equivalent:

```python
travel_time = 1 + 0.15 * (flow / 8) ** 4
```

The implementation must not use a different formula.

---

# 10. CONGESTION RATIO

For an edge:

```text
congestion_ratio = flow / capacity
```

Since capacity is `8`:

```text
congestion_ratio = flow / 8
```

Maximum congestion ratio:

```text
max(flow / 8)
```

across all usable edges.

---

# 11. TRIP TRAVEL TIME

A trip's final travel time is:

```text
sum(edge travel times along its selected path)
```

For a route:

```text
A -> B -> C -> D
```

the travel time is:

```text
t(A,B) + t(B,C) + t(C,D)
```

---

# 12. REQUIRED METRICS

The system must calculate:

## Mean Travel Time

```text
mean(trip travel times)
```

## P95 Travel Time

The 95th percentile of the 120 final trip travel times.

Use a documented deterministic percentile implementation.

Recommended Python implementation:

```python
numpy.percentile(travel_times, 95)
```

## Maximum Congestion Ratio

```text
max(edge_flow / 8)
```

The result must include all three.

Example:

```json
{
  "mean_travel_time": 2.84,
  "p95_travel_time": 4.21,
  "max_congestion_ratio": 1.75
}
```

---

# 13. OPTIMIZER PYTHON INTERFACE

The optimizer package must expose these functions.

## Build Instance

```python
def build_instance(seed: int = 42) -> dict:
    ...
```

Returns the complete deterministic simulation instance.

---

## Solve Baseline

```python
def solve_baseline(instance: dict) -> dict:
    ...
```

Returns:

```json
{
  "routes": [],
  "edge_flows": {},
  "metrics": {}
}
```

Baseline routing should represent shortest/free-flow routing while respecting the disrupted edge.

---

## Solve Optimized

```python
def solve_optimized(instance: dict) -> dict:
    ...
```

Returns the same schema:

```json
{
  "routes": [],
  "edge_flows": {},
  "metrics": {}
}
```

The optimized solver must attempt to reduce system-wide congestion/travel time.

---

## Calculate Metrics

```python
def calculate_metrics(
    routes: list,
    edge_flows: dict
) -> dict:
    ...
```

Returns:

```json
{
  "mean_travel_time": 0.0,
  "p95_travel_time": 0.0,
  "max_congestion_ratio": 0.0
}
```

---

# 14. OPTIMIZATION REQUIREMENTS

The optimizer is NOT required to use machine learning.

A deterministic graph optimization algorithm is preferred.

Possible implementation:

1. Build the disrupted grid graph.
2. Generate deterministic trips.
3. Calculate baseline shortest paths.
4. Calculate edge flows.
5. Calculate congestion-adjusted travel times.
6. Iteratively reroute trips using current edge costs.
7. Recalculate flows.
8. Repeat for a fixed number of iterations or until convergence.
9. Return the final routes and metrics.

The implementation must be deterministic for a fixed seed.

---

# 15. BACKEND API

Backend technology:

```text
Python
FastAPI
```

Base URL during development:

```text
http://localhost:8000
```

---

## GET /health

Response:

```json
{
  "status": "ok"
}
```

---

# 16. POST /api/instance

Request:

```json
{
  "seed": 42
}
```

Response:

```json
{
  "seed": 42,
  "nodes": [],
  "edges": [],
  "trips": []
}
```

---

# 17. POST /api/baseline

Request:

```json
{
  "seed": 42
}
```

Response:

```json
{
  "baseline": {
    "routes": [],
    "edge_flows": {},
    "metrics": {}
  }
}
```

---

# 18. POST /api/optimize

Request:

```json
{
  "seed": 42
}
```

Response:

```json
{
  "optimized": {
    "routes": [],
    "edge_flows": {},
    "metrics": {}
  }
}
```

---

# 19. POST /api/compare

This is the primary frontend endpoint.

Request:

```json
{
  "seed": 42
}
```

Response:

```json
{
  "seed": 42,
  "baseline": {
    "routes": [],
    "edge_flows": {},
    "metrics": {
      "mean_travel_time": 0.0,
      "p95_travel_time": 0.0,
      "max_congestion_ratio": 0.0
    }
  },
  "optimized": {
    "routes": [],
    "edge_flows": {},
    "metrics": {
      "mean_travel_time": 0.0,
      "p95_travel_time": 0.0,
      "max_congestion_ratio": 0.0
    }
  }
}
```

The frontend should primarily consume `/api/compare`.

---

# 20. ERROR RESPONSE

Backend errors should use HTTP status codes.

Example:

```json
{
  "detail": "Invalid seed"
}
```

Do not silently return fake optimization results.

---

# 21. FRONTEND REQUIREMENTS

Frontend technology:

```text
React
Vite
Tailwind CSS
```

The frontend must NOT implement the optimization algorithm.

The frontend must NOT calculate official metrics independently.

The backend is the source of truth for:

* routes
* flows
* travel times
* metrics

---

# 22. FRONTEND VISUALIZATION

The dashboard should show:

### Network

A 5×5 grid.

Display:

* Nodes
* Edges
* Disrupted edge
* Edge flow/congestion
* Selected routes

### Metrics

Show baseline vs optimized:

```text
Mean Travel Time
P95 Travel Time
Max Congestion Ratio
```

### Comparison

Example:

```text
                 Baseline      Optimized
Mean Time          3.21           2.74
P95 Time           5.83           4.42
Max Congestion     2.50           1.75
```

Actual values must come from the API.

Do not hardcode final numbers.

---

# 23. FRONTEND STATES

The frontend must handle:

```text
Loading
Success
API Error
Empty State
```

Minimum UX:

```text
[Generate Instance]

[Run Baseline]

[Optimize]

[Compare]
```

A single:

```text
[Run Simulation]
```

button may also trigger the full workflow.

---

# 24. CORS

Backend must allow the local frontend development server.

Expected frontend:

```text
http://localhost:5173
```

Backend should configure CORS appropriately for local development.

---

# 25. TESTING CONTRACT

At minimum:

## Optimizer tests

Test:

* 5×5 graph creation
* disrupted edge removal
* deterministic instance generation
* 120 trips
* valid paths
* no route uses disrupted edge
* edge flow calculation
* congestion formula
* metric calculation
* deterministic optimization

## Backend tests

Test:

* `/health`
* `/api/instance`
* `/api/baseline`
* `/api/optimize`
* `/api/compare`

## Frontend

Verify:

* API data renders
* metrics render
* graph renders
* disrupted edge is visible
* optimized/baseline comparison works
* loading/error states work

---

# 26. SAMPLE DATA

The repository should contain:

```text
contract/sample_instance.json
contract/sample_result.json
```

These are ONLY development fixtures.

They must not be treated as final benchmark results.

---

# 27. DETERMINISM

For the same seed:

```python
build_instance(42)
```

must produce the same instance every time.

The routing/optimization process should also be deterministic.

Avoid uncontrolled randomness.

If randomness is necessary, derive it from the supplied seed.

---

# 28. NO DATABASE

A database is not required.

The simulation can run entirely in memory.

Do not add:

* PostgreSQL
* MongoDB
* Redis
* Firebase

unless explicitly approved.

---

# 29. NO MACHINE LEARNING MODEL REQUIRED

Do not add an unnecessary ML model.

The intelligence of the system comes from:

```text
graph optimization
+
congestion-aware routing
+
iterative rerouting
```

The goal is a reliable working optimization system, not an artificial ML layer.

---

# 30. GIT RULES

Branches:

```text
main

feature/frontend
feature/backend
feature/optimizer
```

Ownership:

```text
feature/frontend
→ Frontend contributor

feature/backend
→ Backend contributor

feature/optimizer
→ Optimization contributor
```

---

# 31. PULL REQUEST RULES

Nobody directly pushes feature implementation into another contributor's branch.

Workflow:

```text
feature/frontend
       ↓
      PR
       ↓
     main
```

Same for backend and optimizer.

Before merging:

```text
git pull
tests pass
application runs
API contract unchanged
```

---

# 32. SHARED FILE RULES

High-conflict files should be changed carefully:

```text
CONTRACT.md
README.md
package.json
requirements.txt
```

Do not rewrite another contributor's component merely to make integration easier.

If integration fails because of a contract mismatch:

1. Identify mismatch.
2. Discuss intended interface.
3. Update contract if necessary.
4. Update affected components.
5. Test again.

---

# 33. DEFINITION OF DONE

The project is considered complete only when:

* [ ] Frontend starts successfully
* [ ] Backend starts successfully
* [ ] Frontend connects to backend
* [ ] Instance can be generated
* [ ] 120 trips are generated
* [ ] Disrupted edge is removed
* [ ] Baseline routes are calculated
* [ ] Baseline edge flows are calculated
* [ ] Optimized routes are calculated
* [ ] Optimized edge flows are calculated
* [ ] Congestion-adjusted travel times are calculated
* [ ] Mean travel time is calculated
* [ ] P95 travel time is calculated
* [ ] Maximum congestion ratio is calculated
* [ ] Frontend visualizes the network
* [ ] Frontend visualizes congestion
* [ ] Frontend compares baseline vs optimized
* [ ] Same seed produces deterministic results
* [ ] Automated tests pass
* [ ] No fake/hardcoded benchmark results are used
* [ ] Final integrated application runs from a clean checkout

---

# 34. PRIORITY ORDER

When time is limited, prioritize:

### P0 — Must Work

1. Correct graph
2. Correct disrupted edge
3. Correct 120 trips
4. Baseline routing
5. Congestion calculation
6. Optimization
7. Metrics
8. API
9. Frontend integration

### P1 — Important

10. Congestion visualization
11. Route visualization
12. Baseline vs optimized comparison
13. Error handling
14. Tests

### P2 — Polish

15. Animations
16. Advanced styling
17. Extra charts
18. Additional UX features

Never sacrifice correctness for visual polish.

---

# 35. FINAL PRINCIPLE

The project should optimize for:

```text
CORRECTNESS
    ↓
INTEGRATION
    ↓
RELIABILITY
    ↓
VISUALIZATION
    ↓
POLISH
```

A simple system that works end-to-end is better than an impressive-looking system that does not produce correct optimization results.

END OF CONTRACT
