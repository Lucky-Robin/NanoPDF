import pytest
from io import BytesIO
import zipfile


@pytest.mark.asyncio
async def test_pdf_to_image_single_page_returns_image(test_client, single_page_pdf):
    response = await test_client.post(
        "/api/pdf-to-image",
        files={"file": ("test.pdf", BytesIO(single_page_pdf), "application/pdf")},
        data={"format": "png"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert len(response.content) > 0


@pytest.mark.asyncio
async def test_pdf_to_image_multi_page_returns_zip(test_client, sample_pdf):
    response = await test_client.post(
        "/api/pdf-to-image",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"format": "png"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    
    zip_bytes = response.content
    with zipfile.ZipFile(BytesIO(zip_bytes), 'r') as zf:
        filenames = zf.namelist()
        assert len(filenames) == 3
        assert all(f.endswith(".png") for f in filenames)


@pytest.mark.asyncio
async def test_pdf_to_image_jpeg_format(test_client, single_page_pdf):
    response = await test_client.post(
        "/api/pdf-to-image",
        files={"file": ("test.pdf", BytesIO(single_page_pdf), "application/pdf")},
        data={"format": "jpeg"}
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"


@pytest.mark.asyncio
async def test_pdf_to_image_rejects_invalid_format(test_client, sample_pdf):
    response = await test_client.post(
        "/api/pdf-to-image",
        files={"file": ("test.pdf", BytesIO(sample_pdf), "application/pdf")},
        data={"format": "bmp"}
    )
    
    assert response.status_code == 400
    assert "format must be" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_pdf_to_image_rejects_non_pdf(test_client):
    fake_content = b"Not a PDF"
    response = await test_client.post(
        "/api/pdf-to-image",
        files={"file": ("fake.pdf", BytesIO(fake_content), "application/pdf")},
        data={"format": "png"}
    )
    
    assert response.status_code == 400
