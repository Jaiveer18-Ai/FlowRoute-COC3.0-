"""Configuration constants for FlowRoute according to Contract.md."""

from typing import List, Tuple

# AI-02 Problem Constraints
GRID_SIZE: int = 5
EDGE_CAPACITY: int = 8
FREE_FLOW_TIME: float = 1.0
DISRUPTED_EDGE: Tuple[Tuple[int, int], Tuple[int, int]] = ((2, 2), (3, 2))
TOTAL_TRIPS: int = 120

# Congestion parameters
BPR_ALPHA: float = 0.15
BPR_BETA: float = 4.0

# CORS settings for frontend integration
CORS_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
