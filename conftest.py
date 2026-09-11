"""Root pytest configuration and shared fixtures for FlowRoute."""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


@pytest.fixture(scope="session")
def client():
    """Session-scoped TestClient."""
    return TestClient(app)
