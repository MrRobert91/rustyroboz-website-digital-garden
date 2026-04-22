from httpx import ASGITransport, AsyncClient

from app.main import app


async def test_health_endpoint_reports_ready_storage():
    transport = ASGITransport(app=app)

    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["storage"]["sqlite"] == "ready"

