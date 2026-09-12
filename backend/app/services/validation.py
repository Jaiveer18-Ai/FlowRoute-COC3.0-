"""Validation service for routes, instances, and simulation results."""

import re
from typing import Any, Dict, List, Set, Tuple
from backend.app.config import DISRUPTED_EDGE, GRID_SIZE, TOTAL_TRIPS

CANONICAL_EDGE_REGEX = re.compile(r"^([0-4]),([0-4])-([0-4]),([0-4])$")


class ValidationError(Exception):
    """Raised when simulation output violates graph or contract rules."""
    pass


def is_valid_grid_node(node: List[int]) -> bool:
    """Verify coordinate is within 0..GRID_SIZE-1."""
    return len(node) == 2 and 0 <= node[0] < GRID_SIZE and 0 <= node[1] < GRID_SIZE


def is_disrupted_segment(u: List[int], v: List[int]) -> bool:
    """Check if step (u, v) attempts to traverse the disrupted edge (2,2) <-> (3,2)."""
    pt1 = (u[0], u[1])
    pt2 = (v[0], v[1])
    d1, d2 = DISRUPTED_EDGE
    return (pt1 == d1 and pt2 == d2) or (pt1 == d2 and pt2 == d1)


def is_adjacent(u: List[int], v: List[int]) -> bool:
    """Check Manhattan distance == 1 on 5x5 grid."""
    return (abs(u[0] - v[0]) + abs(u[1] - v[1])) == 1


def validate_canonical_edge_id(edge_id: str) -> None:
    """Ensure edge ID conforms to 'x1,y1-x2,y2' with canonical endpoint sorting."""
    match = CANONICAL_EDGE_REGEX.match(edge_id)
    if not match:
        raise ValidationError(f"Invalid canonical edge ID format: '{edge_id}'. Expected 'x1,y1-x2,y2'.")
    x1, y1, x2, y2 = map(int, match.groups())
    if (x1, y1) > (x2, y2):
        raise ValidationError(
            f"Edge ID '{edge_id}' endpoints are not canonically ordered. Expected '{x2},{y2}-{x1},{y1}'."
        )
    if not is_adjacent([x1, y1], [x2, y2]):
        raise ValidationError(f"Edge ID '{edge_id}' references non-adjacent nodes.")


def validate_routes(routes: List[dict], trips: List[dict]) -> None:
    """Validate all routes against trip specifications and network constraints.
    
    Rules:
    - Exactly TOTAL_TRIPS (120) routes represented.
    - Every route corresponds to a known trip.
    - Each trip represented exactly once.
    - Path starts at origin and ends at destination.
    - Path uses valid adjacent grid edges.
    - Disrupted edge is NEVER traversed.
    - Simple path (no repeated nodes).
    """
    if len(routes) != len(trips):
        raise ValidationError(
            f"Expected {len(trips)} routes, but received {len(routes)} routes."
        )

    trip_map: Dict[int, dict] = {t["id"]: t for t in trips}
    seen_trip_ids: Set[int] = set()

    for idx, route in enumerate(routes):
        trip_id = route.get("trip_id")
        if trip_id is None or trip_id not in trip_map:
            raise ValidationError(f"Route at index {idx} has invalid or unknown trip_id: {trip_id}")

        if trip_id in seen_trip_ids:
            raise ValidationError(f"Trip ID {trip_id} is represented multiple times in routes.")
        seen_trip_ids.add(trip_id)

        path = route.get("path")
        if not path or not isinstance(path, list) or len(path) < 2:
            raise ValidationError(f"Route for trip {trip_id} has invalid path: {path}")

        trip = trip_map[trip_id]
        origin = trip["origin"]
        destination = trip["destination"]

        if path[0] != origin:
            raise ValidationError(
                f"Trip {trip_id} path does not start at origin {origin}, starts at {path[0]}"
            )
        if path[-1] != destination:
            raise ValidationError(
                f"Trip {trip_id} path does not end at destination {destination}, ends at {path[-1]}"
            )

        # Simple path check (no repeated nodes)
        visited_nodes: Set[Tuple[int, int]] = set()
        for node in path:
            if not is_valid_grid_node(node):
                raise ValidationError(f"Trip {trip_id} contains out-of-grid node: {node}")
            coord = (node[0], node[1])
            if coord in visited_nodes:
                raise ValidationError(
                    f"Trip {trip_id} path is not a simple path (node {node} revisited)."
                )
            visited_nodes.add(coord)

        # Edge adjacency and disruption checks
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            if not is_adjacent(u, v):
                raise ValidationError(
                    f"Trip {trip_id} has non-adjacent step: {u} -> {v}"
                )
            if is_disrupted_segment(u, v):
                raise ValidationError(
                    f"Trip {trip_id} traversed disrupted edge: {u} -> {v}"
                )


def validate_simulation_result(result: Dict[str, Any], trips: List[dict]) -> None:
    """Validate full simulation output structure (routes, edge_flows, metrics)."""
    if "routes" not in result or not isinstance(result["routes"], list):
        raise ValidationError("Simulation result missing 'routes' list.")
    if "edge_flows" not in result or not isinstance(result["edge_flows"], dict):
        raise ValidationError("Simulation result missing or invalid 'edge_flows'.")
    if "metrics" not in result or not isinstance(result["metrics"], dict):
        raise ValidationError("Simulation result missing or invalid 'metrics'.")

    # Validate route paths
    validate_routes(result["routes"], trips)

    # Validate canonical edge flow keys
    for edge_id, flow in result["edge_flows"].items():
        validate_canonical_edge_id(edge_id)
        if not isinstance(flow, int) or flow < 0:
            raise ValidationError(f"Edge flow for '{edge_id}' must be a non-negative integer, got {flow}.")

    # Validate metrics
    metrics = result["metrics"]
    for required_metric in ("mean_travel_time", "p95_travel_time", "max_congestion_ratio"):
        if required_metric not in metrics:
            raise ValidationError(f"Simulation metrics missing '{required_metric}'.")
        if not isinstance(metrics[required_metric], (int, float)) or metrics[required_metric] < 0:
            raise ValidationError(f"Metric '{required_metric}' has invalid value: {metrics[required_metric]}")
