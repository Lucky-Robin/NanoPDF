"""PDF preview and reordering endpoints."""
import base64
import json
from io import BytesIO

import fitz
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from backend.config import MAX_THUMBNAIL_PAGES, THUMBNAIL_DPI
from backend.services.pdf_service import validate_pdf

router = APIRouter()


@router.post("/api/preview")
async def preview_pdf(file: UploadFile = File(...)):
    """Generate base64-encoded PNG thumbnails for PDF pages.
    
    Args:
        file: PDF file to preview
        
    Returns:
        JSON with thumbnails array (data URIs) and page_count
        
    Raises:
        HTTPException 400: If PDF exceeds max thumbnail pages or validation fails
    """
    pdf_bytes = await validate_pdf(file)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    try:
        page_count = len(doc)
        
        if page_count > MAX_THUMBNAIL_PAGES:
            raise HTTPException(
                status_code=400,
                detail=f"PDF has {page_count} pages, maximum {MAX_THUMBNAIL_PAGES} allowed for preview"
            )
        
        thumbnails = []
        for page_num in range(page_count):
            page = doc[page_num]
            pix = page.get_pixmap(dpi=THUMBNAIL_DPI)
            png_bytes = pix.tobytes("png")
            b64 = base64.b64encode(png_bytes).decode()
            thumbnails.append(f"data:image/png;base64,{b64}")
        
        return {"thumbnails": thumbnails, "page_count": page_count}
    
    finally:
        doc.close()


@router.post("/api/reorder")
async def reorder_pdf(file: UploadFile = File(...), order: str = Form(...)):
    """Reorder PDF pages according to provided order array.
    
    Args:
        file: PDF file to reorder
        order: JSON array of 0-indexed page numbers (e.g., "[2, 0, 1]")
        
    Returns:
        StreamingResponse with reordered PDF
        
    Raises:
        HTTPException 400: If order is invalid or contains out-of-range page numbers
    """
    pdf_bytes = await validate_pdf(file)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    
    try:
        try:
            order_list = json.loads(order)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in order parameter")
        
        if not isinstance(order_list, list):
            raise HTTPException(status_code=400, detail="Order must be a JSON array")
        
        if not order_list:
            raise HTTPException(status_code=400, detail="Order array cannot be empty")
        
        page_count = len(doc)
        
        if not all(isinstance(i, int) and 0 <= i < page_count for i in order_list):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid page order: all indices must be integers between 0 and {page_count - 1}"
            )
        
        doc.select(order_list)
        
        buffer = BytesIO()
        doc.save(buffer, garbage=4, deflate=True)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=\"reordered.pdf\""}
        )
    
    finally:
        doc.close()
