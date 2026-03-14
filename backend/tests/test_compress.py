import pytest
from io import BytesIO
import fitz


@pytest.mark.asyncio
async def test_compress_returns_pdf_with_headers(test_client, sample_pdf):
    response = await test_client.post(
        "/api/compress",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"target": "50"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "x-original-size" in response.headers
    assert "x-compressed-size" in response.headers
    assert "x-reduction-percent" in response.headers
    assert "x-compression-method" in response.headers
    
    compressed_pdf = response.content
    doc = fitz.open(stream=compressed_pdf, filetype="pdf")
    assert len(doc) == 3
    doc.close()


@pytest.mark.asyncio
async def test_compress_preserves_page_count(test_client, sample_pdf):
    response = await test_client.post(
        "/api/compress",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"target": "30"}
    )
    
    assert response.status_code == 200
    
    compressed_pdf = response.content
    doc = fitz.open(stream=compressed_pdf, filetype="pdf")
    assert len(doc) == 3
    doc.close()


@pytest.mark.asyncio
async def test_compress_rejects_invalid_target(test_client, sample_pdf):
    response = await test_client.post(
        "/api/compress",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"target": "55"}
    )
    
    assert response.status_code == 400
    assert "10-90 in 10%" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_compress_rejects_non_pdf(test_client):
    fake_content = b"Not a PDF"
    response = await test_client.post(
        "/api/compress",
        files={"file": ("fake.pdf", BytesIO(fake_content), "application/pdf")},
        data={"target": "50"}
    )
    
    assert response.status_code == 400
