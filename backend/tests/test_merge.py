import pytest
from io import BytesIO
import fitz


@pytest.mark.asyncio
async def test_merge_two_pdfs_successfully(test_client, sample_pdf):
    pdf1 = sample_pdf
    
    doc2 = fitz.open()
    for i in range(2):
        page = doc2.new_page(width=595, height=842)
        page.insert_text((50, 50), f"Second PDF Page {i+1}")
    buf2 = BytesIO()
    doc2.save(buf2)
    doc2.close()
    pdf2 = buf2.getvalue()
    
    response = await test_client.post(
        "/api/merge",
        files=[
            ("files", ("first.pdf", BytesIO(pdf1), "application/pdf")),
            ("files", ("second.pdf", BytesIO(pdf2), "application/pdf"))
        ]
    )
    
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    
    merged_pdf = response.content
    doc = fitz.open(stream=merged_pdf, filetype="pdf")
    assert len(doc) == 5
    doc.close()


@pytest.mark.asyncio
async def test_merge_rejects_single_pdf(test_client, sample_pdf):
    response = await test_client.post(
        "/api/merge",
        files=[
            ("files", ("test.pdf", BytesIO(sample_pdf), "application/pdf"))
        ]
    )
    
    assert response.status_code == 400
    assert "at least 2" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_merge_rejects_non_pdf(test_client, sample_pdf):
    fake_content = b"Not a PDF"
    response = await test_client.post(
        "/api/merge",
        files=[
            ("files", ("first.pdf", BytesIO(sample_pdf), "application/pdf")),
            ("files", ("fake.pdf", BytesIO(fake_content), "application/pdf"))
        ]
    )
    
    assert response.status_code == 400
