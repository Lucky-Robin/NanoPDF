import pytest
from io import BytesIO
import zipfile
import fitz


@pytest.mark.asyncio
async def test_split_all_mode_creates_zip(test_client, sample_pdf):
    response = await test_client.post(
        "/api/split",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"mode": "all"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    
    zip_bytes = response.content
    with zipfile.ZipFile(BytesIO(zip_bytes), 'r') as zf:
        filenames = zf.namelist()
        assert len(filenames) == 3
        assert "page_001.pdf" in filenames
        assert "page_002.pdf" in filenames
        assert "page_003.pdf" in filenames


@pytest.mark.asyncio
async def test_split_ranges_mode_with_valid_ranges(test_client, sample_pdf):
    response = await test_client.post(
        "/api/split",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"mode": "ranges", "ranges": "1-2,3"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    
    zip_bytes = response.content
    with zipfile.ZipFile(BytesIO(zip_bytes), 'r') as zf:
        filenames = zf.namelist()
        assert len(filenames) == 2
        assert "pages_1-2.pdf" in filenames
        assert "page_3.pdf" in filenames


@pytest.mark.asyncio
async def test_split_rejects_invalid_mode(test_client, sample_pdf):
    response = await test_client.post(
        "/api/split",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"mode": "invalid"}
    )
    
    assert response.status_code == 400
    assert "mode must be" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_split_rejects_out_of_range(test_client, sample_pdf):
    response = await test_client.post(
        "/api/split",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"mode": "ranges", "ranges": "1-10"}
    )
    
    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_split_rejects_ranges_without_ranges_param(test_client, sample_pdf):
    response = await test_client.post(
        "/api/split",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"mode": "ranges"}
    )
    
    assert response.status_code == 400
    assert "ranges required" in response.json()["detail"].lower()
