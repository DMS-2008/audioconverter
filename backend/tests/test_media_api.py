import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.media_service import validate_url, format_duration

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_validate_url_valid():
    url = "youtube.com/watch?v=dQw4w9WgXcQ"
    validated = validate_url(url)
    assert validated.startswith("https://")
    assert "youtube.com" in validated

def test_validate_url_invalid():
    with pytest.raises(ValueError):
        validate_url("not_a_valid_url")

def test_validate_url_localhost_blocked():
    with pytest.raises(ValueError, match="Localhost URLs are not allowed"):
        validate_url("http://localhost:8000/test")

def test_format_duration():
    assert format_duration(65) == "1:05"
    assert format_duration(3665) == "1:01:05"
    assert format_duration(0) == "Unknown"

def test_info_endpoint_invalid_url():
    response = client.post("/api/info", json={"url": "invalid_url_string"})
    assert response.status_code == 400
    assert "detail" in response.json()

def test_download_endpoint_invalid_body():
    response = client.post("/api/download", json={"invalid": "payload"})
    assert response.status_code == 422  # Unprocessable Entity

def test_download_endpoint_valid_queue():
    payload = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "type": "audio",
        "target_quality": "320kbps",
        "target_ext": "mp3"
    }
    response = client.post("/api/download", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "job_id" in data
    assert data["status"] == "queued"
