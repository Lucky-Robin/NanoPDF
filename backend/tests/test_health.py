import pytest


@pytest.mark.asyncio
async def test_health_endpoint_returns_ok(test_client):
    response = await test_client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
