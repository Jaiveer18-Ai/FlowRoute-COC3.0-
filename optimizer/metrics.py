import numpy as np
from typing import Dict, Any, List

from optimizer.graph import get_canonical_edge_id

def get_directional_edge_id(u: List[int], v: List[int]) -> str:
    """
    Returns a directional edge ID by extending the canonical undirected ID.
    Appends '_fwd' if the traversal matches canonical ordering, else '_rev'.
    This ensures compatibility with the existing graph's edge IDs.
    """
    canonical_id = get_canonical_edge_id(u, v)
    if u[0] < v[0] or (u[0] == v[0] and u[1] < v[1]):
        return f"{canonical_id}_fwd"
    else:
        return f"{canonical_id}_rev"

def calculate_edge_flows(instance: Dict[str, Any], routes: List[Dict[str, Any]]) -> Dict[str, int]:
    """Calculates flow for every directed edge in the network."""
    edge_flows = {}
    
    # Initialize all directed network edges with zero flow
    for edge in instance["edges"]:
        u, v = edge["from"], edge["to"]
        edge_flows[get_directional_edge_id(u, v)] = 0
        edge_flows[get_directional_edge_id(v, u)] = 0
        
    for route in routes:
        path = route["path"]
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            edge_id = get_directional_edge_id(u, v)
            if edge_id in edge_flows:
                edge_flows[edge_id] += 1
            else:
                edge_flows[edge_id] = 1
                
    return edge_flows

def calculate_edge_travel_times(instance: Dict[str, Any], edge_flows: Dict[str, int]) -> Dict[str, float]:
    """Calculates final travel time for every directed edge based on congestion."""
    props = {}
    for edge in instance["edges"]:
        u, v = edge["from"], edge["to"]
        id_uv = get_directional_edge_id(u, v)
        id_vu = get_directional_edge_id(v, u)
        c = edge.get("capacity", 8)
        t0 = edge.get("free_flow_time", 1)
        props[id_uv] = (t0, c)
        props[id_vu] = (t0, c)
        
    times = {}
    for edge_id, flow in edge_flows.items():
        t0, c = props.get(edge_id, (1, 8))
        times[edge_id] = float(t0 * (1 + 0.15 * (flow / c)**4))
        
    return times

def calculate_trip_travel_times(instance: Dict[str, Any], routes: List[Dict[str, Any]], edge_travel_times: Dict[str, float]) -> List[float]:
    """Calculates the final travel time for each trip's route."""
    trip_times = []
    for route in routes:
        path = route["path"]
        t = 0.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i+1]
            edge_id = get_directional_edge_id(u, v)
            t += edge_travel_times.get(edge_id, 1.0)
        trip_times.append(float(t))
    return trip_times

def validate_routes(instance: Dict[str, Any], routes: List[Dict[str, Any]]):
    """Validates that routes are physically possible and match trip details."""
    from optimizer.baseline import build_disrupted_graph
    
    G = build_disrupted_graph(instance)
    
    for route in routes:
        trip_id = route.get("trip_id")
        trip = instance["trips"][trip_id]
        path = route["path"]
        
        if path[0] != trip["origin"]:
            raise ValueError(f"Route for trip {trip_id} does not start at origin")
        if path[-1] != trip["destination"]:
            raise ValueError(f"Route for trip {trip_id} does not end at destination")
            
        if len(path) != len(set(tuple(n) for n in path)):
            raise ValueError(f"Route for trip {trip_id} is not simple")
            
        for i in range(len(path) - 1):
            u, v = tuple(path[i]), tuple(path[i+1])
            if not G.has_edge(u, v):
                raise ValueError(f"Route for trip {trip_id} uses invalid/disrupted edge {u}-{v}")

def calculate_metrics(instance: Dict[str, Any], routes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Evaluates the route assignment and calculates system-level congestion metrics."""
    validate_routes(instance, routes)
    
    edge_flows = calculate_edge_flows(instance, routes)
    edge_travel_times = calculate_edge_travel_times(instance, edge_flows)
    trip_travel_times = calculate_trip_travel_times(instance, routes, edge_travel_times)
    
    if trip_travel_times:
        mean_travel_time = float(np.mean(trip_travel_times))
        p95_travel_time = float(np.percentile(trip_travel_times, 95))
        total_system_travel_time = float(np.sum(trip_travel_times))
    else:
        mean_travel_time = 0.0
        p95_travel_time = 0.0
        total_system_travel_time = 0.0
        
    props = {}
    for edge in instance["edges"]:
        u, v = edge["from"], edge["to"]
        c = edge.get("capacity", 8)
        props[get_directional_edge_id(u, v)] = c
        props[get_directional_edge_id(v, u)] = c
        
    max_congestion = 0.0
    for edge_id, flow in edge_flows.items():
        c = props.get(edge_id, 8)
        max_congestion = max(max_congestion, float(flow) / c)
        
    return {
        "edge_flows": edge_flows,
        "edge_travel_times": edge_travel_times,
        "trip_travel_times": trip_travel_times,
        "mean_travel_time": mean_travel_time,
        "p95_travel_time": p95_travel_time,
        "max_congestion_ratio": max_congestion,
        "total_system_travel_time": total_system_travel_time
    }
