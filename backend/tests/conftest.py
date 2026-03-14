"""Shared test fixtures for NanoPDF backend tests."""
import pytest
import httpx
from io import BytesIO
import fitz  # PyMuPDF


@pytest.fixture
async def test_client():
    """Create an async test client for the FastAPI app."""
    from backend.main import app
    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def sample_pdf() -> bytes:
    """Generate a 3-page PDF with text content."""
    doc = fitz.open()
    for i in range(3):
        page = doc.new_page(width=595, height=842)  # A4
        page.insert_text((50, 50), f"Page {i+1}")
    buf = BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


@pytest.fixture
def sample_pdf_file(sample_pdf):
    """Wrap sample_pdf as file-like for upload."""
    return ("test.pdf", BytesIO(sample_pdf), "application/pdf")


@pytest.fixture
def sample_image_png() -> bytes:
    """Generate a 200x300 PNG image."""
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 200, 300), False)
    pix.set_rect(pix.irect, (100, 150, 200))  # Fill with color
    img_bytes = pix.tobytes("png")
    pix = None
    return img_bytes


@pytest.fixture
def sample_image_jpeg() -> bytes:
    """Generate a 200x300 JPEG image."""
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 200, 300), False)
    pix.set_rect(pix.irect, (255, 100, 100))  # Fill with reddish color
    img_bytes = pix.tobytes("jpeg")
    pix = None
    return img_bytes


@pytest.fixture
def encrypted_pdf() -> bytes:
    """Generate a password-protected PDF."""
    doc = fitz.open()
    doc.new_page()
    buf = BytesIO()
    doc.save(buf, encryption=fitz.PDF_ENCRYPT_AES_256, owner_pw="test", user_pw="test")
    doc.close()
    return buf.getvalue()


@pytest.fixture
def empty_pdf() -> bytes:
    """Generate a 0-page PDF."""
    doc = fitz.open()
    buf = BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


@pytest.fixture
def large_pdf() -> bytes:
    """Generate a 60-page PDF (exceeds MAX_THUMBNAIL_PAGES)."""
    doc = fitz.open()
    for i in range(60):
        page = doc.new_page(width=595, height=842)
        page.insert_text((50, 50), f"Page {i+1}")
    buf = BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


@pytest.fixture
def single_page_pdf() -> bytes:
    """Generate a 1-page PDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((50, 50), "Single Page")
    buf = BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()
