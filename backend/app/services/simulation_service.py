"""Simulation orchestration service.

Coordinates instance generation, baseline solution, optimization solution,
and output validation.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException

from backend.app.services.optimizer_adapter import (
    get_instance,
    run_baseline,
    run_calculate_metrics,
    run_optimized,
)
from backend.app.services.validation import ValidationError, validate_simulation_result


class SimulationService:
    """Orchestrates simulation execution and enforces contract validation."""

    @staticmethod
    def get_instance_data(seed: int = 42) -> Dict[str, Any]:
        """Generate or retrieve simulation network instance."""
        try:
            return get_instance(seed=seed)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to build instance: {str(e)}")

    @classmethod
    def execute_baseline(
        cls, seed: int = 42, instance: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Run baseline solver on given instance or generate one for seed."""
        if instance is None:
            instance = cls.get_instance_data(seed=seed)
        try:
            result = run_baseline(instance)
            validate_simulation_result(result, instance["trips"])
            return result
        except ValidationError as ve:
            raise HTTPException(status_code=500, detail=f"Baseline validation failed: {str(ve)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Baseline simulation failed: {str(e)}")

    @classmethod
    def execute_optimized(
        cls, seed: int = 42, instance: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Run optimized solver on given instance or generate one for seed."""
        if instance is None:
            instance = cls.get_instance_data(seed=seed)
        try:
            result = run_optimized(instance)
            validate_simulation_result(result, instance["trips"])
            return result
        except ValidationError as ve:
            raise HTTPException(status_code=500, detail=f"Optimization validation failed: {str(ve)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Optimization simulation failed: {str(e)}")

    @classmethod
    def execute_compare(
        cls, seed: int = 42, instance: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute both baseline and optimized workflows for full comparison."""
        if instance is None:
            instance = cls.get_instance_data(seed=seed)
        resolved_seed = instance.get("seed", seed)
        try:
            baseline_result = run_baseline(instance)
            validate_simulation_result(baseline_result, instance["trips"])
        except ValidationError as ve:
            raise HTTPException(status_code=500, detail=f"Baseline validation failed during compare: {str(ve)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Baseline execution failed during compare: {str(e)}")

        try:
            optimized_result = run_optimized(instance)
            validate_simulation_result(optimized_result, instance["trips"])
        except ValidationError as ve:
            raise HTTPException(status_code=500, detail=f"Optimization validation failed during compare: {str(ve)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Optimization execution failed during compare: {str(e)}")

        return {
            "seed": resolved_seed,
            "baseline": baseline_result,
            "optimized": optimized_result,
        }
