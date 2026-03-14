from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import validate_pdf
from backend.config import MAX_FILES_PER_REQUEST
import fitz
from io import BytesIO

router = APIRouter()


@router.post("/api/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "At least 2 PDFs required for merge")
    if len(files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(400, f"Maximum {MAX_FILES_PER_REQUEST} files allowed")
    
    output_doc = fitz.open()
    source_docs = []
    
    try:
        for file in files:
            pdf_bytes = await validate_pdf(file)
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            source_docs.append(doc)
            output_doc.insert_pdf(doc)
        
        buffer = BytesIO()
        output_doc.save(buffer, garbage=4, deflate=True)
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=\"merged.pdf\""}
        )
    finally:
        output_doc.close()
        for doc in source_docs:
            doc.close()
