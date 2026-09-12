from typing import List, Dict, Any

def get_canonical_edge_id(u: List[int], v: List[int]) -> str:
    """Returns canonical edge ID, ordering endpoints deterministically."""
    # Ensure u and v are properly sorted to be canonical
    # We sort by x first, then y.
    if u[0] < v[0] or (u[0] == v[0] and u[1] < v[1]):
        first, second = u, v
    else:
        first, second = v, u
    return f"{first[0]},{first[1]}-{second[0]},{second[1]}"

def build_nodes() -> List[Dict[str, Any]]:
    """Generates the 5x5 grid nodes."""
    nodes = []
    for x in range(5):
        for y in range(5):
            nodes.append({
                "id": [x, y],
                "x": x,
                "y": y
            })
    return nodes

def build_edges() -> List[Dict[str, Any]]:
    """Generates the bidirectional edges for the 5x5 grid."""
    edges = []
    
    for x in range(5):
        for y in range(5):
            u = [x, y]
            # right edge
            if x < 4:
                v = [x + 1, y]
                edge_id = get_canonical_edge_id(u, v)
                disrupted = (u == [2, 2] and v == [3, 2]) or (u == [3, 2] and v == [2, 2])
                edges.append({
                    "id": edge_id,
                    "from": u,
                    "to": v,
                    "capacity": 8,
                    "free_flow_time": 1,
                    "flow": 0,
                    "travel_time": 1.0,
                    "disrupted": disrupted
                })
            # down edge
            if y < 4:
                v = [x, y + 1]
                edge_id = get_canonical_edge_id(u, v)
                disrupted = (u == [2, 2] and v == [3, 2]) or (u == [3, 2] and v == [2, 2])
                edges.append({
                    "id": edge_id,
                    "from": u,
                    "to": v,
                    "capacity": 8,
                    "free_flow_time": 1,
                    "flow": 0,
                    "travel_time": 1.0,
                    "disrupted": disrupted
                })
    return edges
