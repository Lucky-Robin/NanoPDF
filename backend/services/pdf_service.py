import os
from fastapi import UploadFile, HTTPException
import fitz


async def validate_pdf(file: UploadFile) -> bytes:
    """Validate and read PDF file.
    
    Raises HTTPException for:
    - Non-PDF files
    - Encrypted PDFs
    - Files exceeding size limit
    """
    from backend.config import MAX_FILE_SIZE, ALLOWED_PDF_MIME
    
    if file.content_type not in ALLOWED_PDF_MIME:
        raise HTTPException(400, "File must be a PDF")
    
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(413, f"File exceeds maximum size of {MAX_FILE_SIZE} bytes")
    
    file_bytes = await file.read()
    
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        if doc.is_encrypted:
            raise HTTPException(400, "Encrypted PDFs not supported")
        doc.close()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, f"Invalid PDF file: {str(e)}")
    
    return file_bytes


async def validate_images(files: list[UploadFile]) -> list[bytes]:
    """Validate and read image files."""
    from backend.config import MAX_FILE_SIZE, ALLOWED_IMAGE_MIME
    
    validated = []
    for file in files:
        if file.content_type not in ALLOWED_IMAGE_MIME:
            raise HTTPException(400, f"File {file.filename} must be JPEG, PNG, or WebP")
        
        if file.size > MAX_FILE_SIZE:
            raise HTTPException(413, f"File {file.filename} exceeds maximum size")
        
        validated.append(await file.read())
    
    return validated


def cleanup_temp_file(file_path: str) -> None:
    """Safely delete temporary file."""
    try:
        os.unlink(file_path)
    except:
        pass
