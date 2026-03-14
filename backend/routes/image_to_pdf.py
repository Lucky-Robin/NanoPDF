from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import validate_images
from backend.config import A4_WIDTH, A4_HEIGHT
import fitz
from io import BytesIO

router = APIRouter()


@router.post("/api/image-to-pdf")
async def image_to_pdf(files: list[UploadFile] = File(...)):
    if len(files) < 1:
        raise HTTPException(400, "At least 1 image required")
    
    image_bytes_list = await validate_images(files)
    
    output_doc = fitz.open()
    
    try:
        for img_bytes in image_bytes_list:
            page = output_doc.new_page(width=A4_WIDTH, height=A4_HEIGHT)
            page.insert_image(page.rect, stream=img_bytes, keep_proportion=True)
        
        buffer = BytesIO()
        output_doc.save(buffer, garbage=4, deflate=True)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=\"images.pdf\""}
        )
    finally:
        output_doc.close()
