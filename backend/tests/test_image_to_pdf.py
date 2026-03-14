import pytest
from io import BytesIO
import fitz


@pytest.mark.asyncio
async def test_image_to_pdf_converts_images_successfully(test_client, sample_image_png, sample_image_jpeg):
    response = await test_client.post(
        "/api/image-to-pdf",
        files=[
            ("files", ("image1.png", BytesIO(sample_image_png), "image/png")),
            ("files", ("image2.jpg", BytesIO(sample_image_jpeg), "image/jpeg"))
        ]
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    
    pdf_bytes = response.content
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) == 2
    doc.close()


@pytest.mark.asyncio
async def test_image_to_pdf_single_image(test_client, sample_image_png):
    response = await test_client.post(
        "/api/image-to-pdf",
        files=[
            ("files", ("image.png", BytesIO(sample_image_png), "image/png"))
        ]
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    
    pdf_bytes = response.content
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) == 1
    doc.close()


@pytest.mark.asyncio
async def test_image_to_pdf_rejects_non_image(test_client):
    import pymupdf.mupdf
    fake_content = b"Not an image"
    
    with pytest.raises(pymupdf.mupdf.FzErrorFormat):
        response = await test_client.post(
            "/api/image-to-pdf",
            files=[
                ("files", ("fake.png", BytesIO(fake_content), "image/png"))
            ]
        )
