from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import validate_pdf
from backend.config import IMAGE_EXPORT_DPI
import fitz
import zipfile
from io import BytesIO

router = APIRouter()


@router.post("/api/pdf-to-image")
async def pdf_to_image(
    file: UploadFile = File(...),
    format: str = Form("png"),
    dpi: int = Form(IMAGE_EXPORT_DPI)
):
    if format not in ["png", "jpeg"]:
        raise HTTPException(400, "Format must be 'png' or 'jpeg'")
    
    if dpi > 300:
        dpi = 300
    
    pdf_bytes = await validate_pdf(file)
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(doc)
    
    try:
        if page_count == 1:
            page = doc[0]
            pix = page.get_pixmap(dpi=dpi)
            img_bytes = pix.tobytes(format)
            
            mime_type = f"image/{format}"
            filename = f"page.{format}"
            
            return StreamingResponse(
                BytesIO(img_bytes),
                media_type=mime_type,
                headers={"Content-Disposition": f"attachment; filename=\"{filename}\""}
            )
        else:
            zip_buffer = BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
                for i in range(page_count):
                    page = doc[i]
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes(format)
                    filename = f"page_{i+1:03d}.{format}"
                    zf.writestr(filename, img_bytes)
            
            zip_buffer.seek(0)
            original_name = file.filename.replace('.pdf', '') if file.filename else "output"
            
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename=\"{original_name}_images.zip\""}
            )
    finally:
        doc.close()
