"""FlowRoute FastAPI Entrypoint."""

import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root directory is in sys.path for clean teammate module imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.api.routes import router
from backend.app.config import CORS_ORIGINS

app = FastAPI(
    title="FlowRoute AI Backend",
    version="1.0",
    description="Backend orchestration service for AI-02 System-Optimal Transit Rerouting",
)

# CORS configuration for local development with Vite frontend (Contract.md Section 24)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints defined in Contract.md
app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors as clean string detail per Contract.md Section 20."""
    errors = exc.errors()
    messages = []
    for err in errors:
        field = err.get("loc", [""])[-1]
        msg = err.get("msg", "Invalid value")
        messages.append(f"{field}: {msg}")
    detail_str = "; ".join(messages) if messages else "Invalid request body"
    return JSONResponse(
        status_code=422,
        content={"detail": f"Validation Error - {detail_str}"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Format HTTP errors as {'detail': ...} per Contract.md Section 20."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail if isinstance(exc.detail, str) else str(exc.detail)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global fallback error handler ensuring predictable JSON output."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
