"""Root pytest configuration and shared fixtures for FlowRoute."""

import asyncio
import sys
import pytest
from fastapi.testclient import TestClient

# Use WindowsSelectorEventLoopPolicy on Windows to avoid WinError 10013 socketpair restrictions
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

from backend.app.main import app


@pytest.fixture(scope="session")
def client():
    """Session-scoped TestClient maintaining a single persistent portal."""
    with TestClient(app) as test_client:
        yield test_client
