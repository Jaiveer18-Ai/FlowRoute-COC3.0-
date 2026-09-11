"""FlowRoute FastAPI Entrypoint."""

import sys
from pathlib import Path
from fastapi import FastAPI, Request
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

# CORS configuration for local development with Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure predictable JSON error formatting per Contract.md Section 20."""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
