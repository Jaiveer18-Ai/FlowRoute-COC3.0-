import networkx as nx
from typing import Dict, Any, List

def build_disrupted_graph(instance: Dict[str, Any]) -> nx.Graph:
    """
    Builds a NetworkX graph from the instance, excluding any disrupted edges.
    """
    G = nx.Graph()
    for node in instance["nodes"]:
        G.add_node(tuple(node["id"]))
        
    for edge in instance["edges"]:
        if not edge.get("disrupted", False):
            G.add_edge(tuple(edge["from"]), tuple(edge["to"]))
            
    return G

def solve_baseline(instance: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes the baseline shortest paths for all trips on the DISRUPTED network.
    
    Tie-breaking rule:
    If multiple shortest paths exist, they are sorted lexicographically by node coordinates
    and the first one is selected. This guarantees strict hash-independent determinism.
    """
    G = build_disrupted_graph(instance)
    routes = []
    
    for trip in instance["trips"]:
        trip_id = trip["id"]
        origin = tuple(trip["origin"])
        dest = tuple(trip["destination"])
        
        # Get all shortest paths
        all_paths = list(nx.all_shortest_paths(G, source=origin, target=dest))
        
        # Deterministic tie-breaking: lexicographical sort
        all_paths.sort()
        selected_path = all_paths[0]
        
        routes.append({
            "trip_id": trip_id,
            "path": [list(node) for node in selected_path],
            "travel_time": float(len(selected_path) - 1)  # Free-flow travel time is length - 1
        })
        
    return {
        "routes": routes,
        "edge_flows": {},
        "metrics": {}
    }
