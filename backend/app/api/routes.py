"""API Route definitions strictly adhering to Contract.md Sections 15-20."""

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


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    responses={500: {"model": ErrorResponse}},
)
async def health_check() -> HealthResponse:
    """Check health status of the backend API."""
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
async def create_instance(request: InstanceRequest) -> InstanceResponse:
    """Generate a deterministic 5x5 grid instance with 120 trips."""
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
async def solve_baseline_endpoint(request: BaselineRequest) -> BaselineResponse:
    """Compute baseline shortest path routing and congestion metrics."""
    if request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    result = SimulationService.execute_baseline(seed=request.seed)
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
async def solve_optimize_endpoint(request: OptimizeRequest) -> OptimizeResponse:
    """Compute congestion-aware optimized routing and metrics."""
    if request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    result = SimulationService.execute_optimized(seed=request.seed)
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
async def compare_endpoint(request: CompareRequest) -> CompareResponse:
    """Primary frontend endpoint comparing baseline and optimized runs."""
    if request.seed < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seed must be a non-negative integer.",
        )
    result = SimulationService.execute_compare(seed=request.seed)
    return CompareResponse(**result)
