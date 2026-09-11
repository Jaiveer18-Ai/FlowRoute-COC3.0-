"""Single consistent metrics calculation utility adhering strictly to Contract.md Sections 9-12."""

from typing import Dict, List
import numpy as np

from backend.app.config import BPR_ALPHA, BPR_BETA, EDGE_CAPACITY, FREE_FLOW_TIME


def compute_edge_travel_time(flow: int, capacity: int = EDGE_CAPACITY) -> float:
    """Calculate congestion-adjusted edge travel time: t_e = 1 + 0.15 * (flow / 8)^4."""
    return FREE_FLOW_TIME + BPR_ALPHA * ((flow / capacity) ** BPR_BETA)


def canonical_edge_id(u: List[int], v: List[int]) -> str:
    """Format canonical bidirectional edge ID ordering endpoints deterministically.
    
    Example: [2, 3] and [3, 3] => '2,3-3,3'
    """
    node_a = f"{u[0]},{u[1]}"
    node_b = f"{v[0]},{v[1]}"
    if (u[0], u[1]) <= (v[0], v[1]):
        return f"{node_a}-{node_b}"
    return f"{node_b}-{node_a}"


def calculate_metrics(routes: List[dict], edge_flows: Dict[str, int]) -> Dict[str, float]:
    """Calculate mean travel time, p95 travel time, and max congestion ratio.
    
    Matches the required optimizer calculate_metrics interface.
    """
    travel_times = [float(r.get("travel_time", 0.0)) for r in routes]
    if not travel_times:
        return {
            "mean_travel_time": 0.0,
            "p95_travel_time": 0.0,
            "max_congestion_ratio": 0.0,
        }

    mean_tt = float(np.mean(travel_times))
    p95_tt = float(np.percentile(travel_times, 95))
    max_cg = float(max((flow / EDGE_CAPACITY for flow in edge_flows.values()), default=0.0))

    return {
        "mean_travel_time": round(mean_tt, 4),
        "p95_travel_time": round(p95_tt, 4),
        "max_congestion_ratio": round(max_cg, 4),
    }
