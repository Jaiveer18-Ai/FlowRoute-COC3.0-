"""Pydantic schemas strictly conforming to Contract.md."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class Node(BaseModel):
    """Canonical node model: [x, y] with integer coordinates 0..4."""
    id: List[int]
    x: int
    y: int


class Edge(BaseModel):
    """Canonical edge model with bidirectional canonical ID 'x1,y1-x2,y2'."""
    model_config = ConfigDict(populate_by_name=True)

    id: str
    from_: List[int] = Field(..., alias="from")
    to: List[int]
    capacity: int = 8
    free_flow_time: float = 1.0
    flow: int = 0
    travel_time: float = 1.0
    disrupted: bool = False


class Trip(BaseModel):
    """Canonical trip model with deterministic ID 0..119."""
    id: int
    origin: List[int]
    destination: List[int]


class Route(BaseModel):
    """Canonical route model representing path as an ordered list of nodes."""
    trip_id: int
    path: List[List[int]]
    travel_time: float


class Metrics(BaseModel):
    """Required metrics defined in Contract.md Section 12."""
    mean_travel_time: float
    p95_travel_time: float
    max_congestion_ratio: float


class SimulationResult(BaseModel):
    """Standard simulation output structure."""
    routes: List[Route]
    edge_flows: Dict[str, int]
    metrics: Metrics


# Request Models
class InstanceRequest(BaseModel):
    seed: int = 42


class BaselineRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    seed: Optional[int] = 42
    instance: Optional[Dict[str, Any]] = None


class OptimizeRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    seed: Optional[int] = 42
    instance: Optional[Dict[str, Any]] = None


class CompareRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    seed: Optional[int] = 42
    instance: Optional[Dict[str, Any]] = None


# Response Models
class HealthResponse(BaseModel):
    status: str = "ok"


class InstanceResponse(BaseModel):
    seed: int
    nodes: List[Node]
    edges: List[Edge]
    trips: List[Trip]


class BaselineResponse(BaseModel):
    baseline: SimulationResult


class OptimizeResponse(BaseModel):
    optimized: SimulationResult


class CompareResponse(BaseModel):
    seed: int
    baseline: SimulationResult
    optimized: SimulationResult


class ErrorResponse(BaseModel):
    detail: str
