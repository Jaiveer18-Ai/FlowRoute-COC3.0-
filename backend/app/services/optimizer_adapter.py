"""Optimizer integration adapter.

Connects the backend to Person 3's optimizer package according to
Contract.md Section 13:
- build_instance(seed: int = 42) -> dict
- solve_baseline(instance: dict) -> dict
- solve_optimized(instance: dict) -> dict
- calculate_metrics(routes: list, edge_flows: dict) -> dict

Includes a contract-compliant reference fallback so that backend & frontend
can run end-to-end immediately even before Person 3 pushes the optimizer branch.
When optimizer/ is present, it seamlessly delegates to it.
"""

import importlib
import logging
import random
from typing import Any, Callable, Dict, List, Optional, Tuple
import networkx as nx

from backend.app.config import (
    DISRUPTED_EDGE,
    EDGE_CAPACITY,
    FREE_FLOW_TIME,
    GRID_SIZE,
    TOTAL_TRIPS,
)
from backend.app.services.metrics import (
    calculate_metrics as fallback_calculate_metrics,
    canonical_edge_id,
    compute_edge_travel_time,
)

logger = logging.getLogger("flowroute.optimizer_adapter")


def _find_optimizer_callable(func_name: str, submodule_names: List[str]) -> Optional[Callable]:
    """Find a target function in optimizer package or its submodules."""
    try:
        opt_pkg = importlib.import_module("optimizer")
        if hasattr(opt_pkg, func_name):
            return getattr(opt_pkg, func_name)
    except ImportError:
        pass

    for sub in submodule_names:
        try:
            mod = importlib.import_module(f"optimizer.{sub}")
            if hasattr(mod, func_name):
                return getattr(mod, func_name)
        except ImportError:
            continue
    return None


# ---------------------------------------------------------------------------
# Reference / Fallback implementation of Section 13 contract interfaces
# ---------------------------------------------------------------------------

def _build_reference_grid_graph() -> nx.Graph:
    """Build 5x5 grid graph without the disrupted edge (2,2) <-> (3,2)."""
    G = nx.grid_2d_graph(GRID_SIZE, GRID_SIZE)
    d1, d2 = DISRUPTED_EDGE
    if G.has_edge(d1, d2):
        G.remove_edge(d1, d2)
    return G


def _build_graph_from_instance(instance: dict) -> nx.Graph:
    """Build NetworkX graph from instance definitions, removing disrupted edges."""
    if "edges" in instance and instance["edges"]:
        G = nx.Graph()
        if "nodes" in instance and instance["nodes"]:
            for node in instance["nodes"]:
                G.add_node(tuple(node["id"]))
        for edge in instance["edges"]:
            if not edge.get("disrupted", False):
                u = tuple(edge.get("from", edge.get("from_")))
                v = tuple(edge["to"])
                G.add_edge(u, v)
        return G
    return _build_reference_grid_graph()


def _reference_build_instance(seed: int = 42) -> dict:
    """Build deterministic instance strictly conforming to Contract.md Sections 4-6."""
    nodes = [{"id": [x, y], "x": x, "y": y} for x in range(GRID_SIZE) for y in range(GRID_SIZE)]

    edges = []
    d1, d2 = DISRUPTED_EDGE
    for x in range(GRID_SIZE):
        for y in range(GRID_SIZE):
            if x + 1 < GRID_SIZE:
                is_dis = ((x, y) == d1 and (x + 1, y) == d2) or ((x, y) == d2 and (x + 1, y) == d1)
                edges.append({
                    "id": canonical_edge_id([x, y], [x + 1, y]),
                    "from": [x, y],
                    "to": [x + 1, y],
                    "capacity": EDGE_CAPACITY,
                    "free_flow_time": FREE_FLOW_TIME,
                    "flow": 0,
                    "travel_time": FREE_FLOW_TIME,
                    "disrupted": is_dis,
                })
            if y + 1 < GRID_SIZE:
                is_dis = ((x, y) == d1 and (x, y + 1) == d2) or ((x, y) == d2 and (x, y + 1) == d1)
                edges.append({
                    "id": canonical_edge_id([x, y], [x, y + 1]),
                    "from": [x, y],
                    "to": [x, y + 1],
                    "capacity": EDGE_CAPACITY,
                    "free_flow_time": FREE_FLOW_TIME,
                    "flow": 0,
                    "travel_time": FREE_FLOW_TIME,
                    "disrupted": is_dis,
                })

    rng = random.Random(seed)
    trips = []
    for i in range(TOTAL_TRIPS):
        ox, oy = rng.randint(0, GRID_SIZE - 1), rng.randint(0, GRID_SIZE - 1)
        dx, dy = rng.randint(0, GRID_SIZE - 1), rng.randint(0, GRID_SIZE - 1)
        while (ox, oy) == (dx, dy):
            dx, dy = rng.randint(0, GRID_SIZE - 1), rng.randint(0, GRID_SIZE - 1)
        trips.append({
            "id": i,
            "origin": [ox, oy],
            "destination": [dx, dy],
        })

    return {
        "seed": seed,
        "nodes": nodes,
        "edges": edges,
        "trips": trips,
    }


def _compute_flows_and_travel_times(
    routes: List[dict],
) -> Tuple[Dict[str, int], List[dict]]:
    """Compute aggregated edge flows and update route travel times using BPR formula."""
    edge_flows: Dict[str, int] = {}
    for r in routes:
        path = r["path"]
        for i in range(len(path) - 1):
            eid = canonical_edge_id(path[i], path[i + 1])
            edge_flows[eid] = edge_flows.get(eid, 0) + 1

    # Update each route's travel time based on final edge flows
    updated_routes = []
    for r in routes:
        path = r["path"]
        tt = 0.0
        for i in range(len(path) - 1):
            eid = canonical_edge_id(path[i], path[i + 1])
            flow = edge_flows.get(eid, 0)
            tt += compute_edge_travel_time(flow)
        updated_routes.append({
            "trip_id": r["trip_id"],
            "path": path,
            "travel_time": round(tt, 4),
        })

    return edge_flows, updated_routes


def _reference_solve_baseline(instance: dict) -> dict:
    """Solve baseline shortest paths avoiding disrupted edge."""
    G = _build_graph_from_instance(instance)
    raw_routes = []
    for trip in instance["trips"]:
        orig = tuple(trip["origin"])
        dest = tuple(trip["destination"])
        path = nx.shortest_path(G, source=orig, target=dest)
        raw_routes.append({
            "trip_id": trip["id"],
            "path": [[x, y] for x, y in path],
            "travel_time": float(len(path) - 1),
        })

    edge_flows, final_routes = _compute_flows_and_travel_times(raw_routes)
    metrics = fallback_calculate_metrics(final_routes, edge_flows)
    return {
        "routes": final_routes,
        "edge_flows": edge_flows,
        "metrics": metrics,
    }


def _reference_solve_optimized(instance: dict) -> dict:
    """Congestion-aware incremental loading solver as described in Contract Section 14."""
    G = _build_graph_from_instance(instance)
    for u, v in G.edges():
        G[u][v]["weight"] = FREE_FLOW_TIME
        G[u][v]["flow"] = 0

    routes = []
    for trip in instance["trips"]:
        orig = tuple(trip["origin"])
        dest = tuple(trip["destination"])
        path = nx.shortest_path(G, source=orig, target=dest, weight="weight")
        routes.append({
            "trip_id": trip["id"],
            "path": [[x, y] for x, y in path],
        })
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            G[u][v]["flow"] += 1
            G[u][v]["weight"] = compute_edge_travel_time(G[u][v]["flow"])

    edge_flows, final_routes = _compute_flows_and_travel_times(routes)
    metrics = fallback_calculate_metrics(final_routes, edge_flows)
    return {
        "routes": final_routes,
        "edge_flows": edge_flows,
        "metrics": metrics,
    }


# ---------------------------------------------------------------------------
# Public Adapter Functions
# ---------------------------------------------------------------------------

def get_instance(seed: int = 42) -> dict:
    """Get instance from Person 3's optimizer or reference implementation."""
    fn = _find_optimizer_callable("build_instance", ["graph", "trips"])
    if fn:
        return fn(seed)
    return _reference_build_instance(seed)


def run_baseline(instance: dict) -> dict:
    """Run baseline solver via Person 3's optimizer or reference implementation."""
    fn = _find_optimizer_callable("solve_baseline", ["baseline"])
    if fn:
        res = fn(instance)
        routes = res.get("routes", [])
        edge_flows = res.get("edge_flows", {})
        metrics = res.get("metrics", {})
        if (
            not edge_flows
            or not metrics
            or any("_" in k for k in edge_flows.keys())
            or any("travel_time" not in r for r in routes)
            or not all(m in metrics for m in ("mean_travel_time", "p95_travel_time", "max_congestion_ratio"))
        ):
            computed_flows, final_routes = _compute_flows_and_travel_times(routes)
            computed_metrics = fallback_calculate_metrics(final_routes, computed_flows)
            return {
                "routes": final_routes,
                "edge_flows": computed_flows,
                "metrics": computed_metrics,
            }
        return res
    return _reference_solve_baseline(instance)


def run_optimized(instance: dict) -> dict:
    """Run optimized solver via Person 3's optimizer or reference implementation."""
    fn = _find_optimizer_callable("solve_optimized", ["optimize"])
    if fn:
        res = fn(instance)
        routes = res.get("routes", [])
        edge_flows = res.get("edge_flows", {})
        metrics = res.get("metrics", {})
        if (
            not edge_flows
            or not metrics
            or any("_" in k for k in edge_flows.keys())
            or any("travel_time" not in r for r in routes)
            or not all(m in metrics for m in ("mean_travel_time", "p95_travel_time", "max_congestion_ratio"))
        ):
            computed_flows, final_routes = _compute_flows_and_travel_times(routes)
            computed_metrics = fallback_calculate_metrics(final_routes, computed_flows)
            return {
                "routes": final_routes,
                "edge_flows": computed_flows,
                "metrics": computed_metrics,
            }
        return res
    return _reference_solve_optimized(instance)


def run_calculate_metrics(routes: list, edge_flows: dict) -> dict:
    """Run metrics calculation via Person 3's optimizer or reference implementation."""
    fn = _find_optimizer_callable("calculate_metrics", ["metrics"])
    if fn:
        return fn(routes, edge_flows)
    return fallback_calculate_metrics(routes, edge_flows)
