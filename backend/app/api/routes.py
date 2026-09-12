from typing import Any, Dict, Optional, Tuple
from fastapi import APIRouter, HTTPException, status

from backend.app.schemas import (
    BaselineRequest,
    BaselineResponse,
    CompareRequest,
    CompareResponse,
    ErrorResponse,
    HealthResponse,
    InstanceRequest,
    InstanceResponse,
    OptimizeRequest,
    OptimizeResponse,
)
from backend.app.services.simulation_service import SimulationService

router = APIRouter()


def _extract_instance_and_seed(request_obj: Any) -> Tuple[Optional[Dict[str, Any]], int]:
    """Extract optional instance dict and integer seed from request."""
    if hasattr(request_obj, "instance") and request_obj.instance:
        inst = request_obj.instance
        seed = inst.get("seed", getattr(request_obj, "seed", 42) or 42)
        return inst, seed

    extra = getattr(request_obj, "__pydantic_extra__", None) or {}
    if "trips" in extra and "nodes" in extra:
        inst = dict(extra)
        seed_val = getattr(request_obj, "seed", 42)
        if seed_val is not None:
            inst["seed"] = seed_val
        return inst, inst.get("seed", 42)

    seed_val = getattr(request_obj, "seed", 42)
    return None, 42 if seed_val is None else seed_val


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    responses={500: {"model": ErrorResponse}},
)
async def health_check() -> HealthResponse:
    """Check health status of the backend API (Contract.md Section 15)."""
    return HealthResponse(status="ok")


@router.post(
    "/api/instance",
    response_model=InstanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate simulation instance",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def create_instance(
    request: InstanceRequest = InstanceRequest(),
) -> InstanceResponse:
    """Generate a deterministic 5x5 grid instance with 120 trips (Contract.md Section 16)."""
    if request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    data = SimulationService.get_instance_data(seed=request.seed)
    return InstanceResponse(**data)


@router.post(
    "/api/baseline",
    response_model=BaselineResponse,
    status_code=status.HTTP_200_OK,
    summary="Solve baseline routing",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def solve_baseline_endpoint(
    request: BaselineRequest = BaselineRequest(),
) -> BaselineResponse:
    """Compute baseline shortest path routing and congestion metrics (Contract.md Section 17)."""
    if request.seed is not None and request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    inst, seed = _extract_instance_and_seed(request)
    if inst is not None and ("trips" not in inst or "nodes" not in inst):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided instance is invalid: must contain 'nodes' and 'trips'.",
        )
    result = SimulationService.execute_baseline(seed=seed, instance=inst)
    return BaselineResponse(baseline=result)


@router.post(
    "/api/optimize",
    response_model=OptimizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Solve optimized routing",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def solve_optimize_endpoint(
    request: OptimizeRequest = OptimizeRequest(),
) -> OptimizeResponse:
    """Compute congestion-aware optimized routing and metrics (Contract.md Section 18)."""
    if request.seed is not None and request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    inst, seed = _extract_instance_and_seed(request)
    if inst is not None and ("trips" not in inst or "nodes" not in inst):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided instance is invalid: must contain 'nodes' and 'trips'.",
        )
    result = SimulationService.execute_optimized(seed=seed, instance=inst)
    return OptimizeResponse(optimized=result)


@router.post(
    "/api/compare",
    response_model=CompareResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare baseline vs optimized routing",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def compare_endpoint(
    request: CompareRequest = CompareRequest(),
) -> CompareResponse:
    """Primary frontend endpoint comparing baseline and optimized runs (Contract.md Section 19)."""
    if request.seed is not None and request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    inst, seed = _extract_instance_and_seed(request)
    if inst is not None and ("trips" not in inst or "nodes" not in inst):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided instance is invalid: must contain 'nodes' and 'trips'.",
        )
    result = SimulationService.execute_compare(seed=seed, instance=inst)
    return CompareResponse(**result)
