import pytest
import json
from io import BytesIO
import fitz


@pytest.mark.asyncio
async def test_preview_returns_thumbnails(test_client, sample_pdf):
    response = await test_client.post(
        "/api/preview",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "thumbnails" in data
    assert "page_count" in data
    assert data["page_count"] == 3
    assert len(data["thumbnails"]) == 3
    for thumb in data["thumbnails"]:
        assert thumb.startswith("data:image/png;base64,")


@pytest.mark.asyncio
async def test_preview_rejects_non_pdf(test_client):
    fake_content = b"This is not a PDF"
    response = await test_client.post(
        "/api/preview",
        files={"file": ("test.txt", BytesIO(fake_content), "application/pdf")}
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_preview_rejects_large_pdf(test_client, large_pdf):
    response = await test_client.post(
        "/api/preview",
        files={"file": ("large.pdf", BytesIO(large_pdf), "application/pdf")}
    )
    
    assert response.status_code == 400
    assert "maximum" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_reorder_pages_successfully(test_client, sample_pdf):
    order = [2, 0, 1]
    response = await test_client.post(
        "/api/reorder",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"order": json.dumps(order)}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    
    pdf_bytes = response.content
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) == 3
    doc.close()


@pytest.mark.asyncio
async def test_reorder_rejects_invalid_json(test_client, sample_pdf):
    response = await test_client.post(
        "/api/reorder",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"order": "not-valid-json"}
    )
    
    assert response.status_code == 400
    assert "invalid json" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_reorder_rejects_out_of_range_indices(test_client, sample_pdf):
    order = [0, 1, 5]
    response = await test_client.post(
        "/api/reorder",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"order": json.dumps(order)}
    )
    
    assert response.status_code == 400
    assert "invalid page order" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_reorder_rejects_empty_order(test_client, sample_pdf):
    response = await test_client.post(
        "/api/reorder",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"order": json.dumps([])}
    )
    
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
