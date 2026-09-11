from .graph import build_nodes, build_edges
from .trips import generate_trips

def build_instance(seed: int = 20260911) -> dict:
    """Builds the complete deterministic simulation instance."""
    return {
        "seed": seed,
        "nodes": build_nodes(),
        "edges": build_edges(),
        "trips": generate_trips(seed)
    }

