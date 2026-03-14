from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from backend.services.pdf_service import validate_pdf
import fitz
import zipfile
from io import BytesIO

router = APIRouter()


@router.post("/api/split")
async def split_pdf(
    file: UploadFile = File(...),
    mode: str = Form(...),
    ranges: str = Form(None)
):
    """Split PDF into multiple files.
    
    Args:
        file: PDF file to split
        mode: "all" (split into individual pages) or "ranges" (split by specified ranges)
        ranges: Optional comma-separated ranges (e.g., "1-3,4-6,7") for mode="ranges"
    
    Returns:
        ZIP file containing split PDFs
    """
    if mode not in ["all", "ranges"]:
        raise HTTPException(400, "mode must be 'all' or 'ranges'")
    
    pdf_bytes = await validate_pdf(file)
    source_doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    page_count = len(source_doc)
    
    try:
        zip_buffer = BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            if mode == "all":
                for i in range(page_count):
                    output_doc = fitz.open()
                    output_doc.insert_pdf(source_doc, from_page=i, to_page=i)
                    pdf_buffer = BytesIO()
                    output_doc.save(pdf_buffer, garbage=4, deflate=True)
                    zf.writestr(f"page_{i+1:03d}.pdf", pdf_buffer.getvalue())
                    output_doc.close()
            
            elif mode == "ranges":
                if not ranges:
                    raise HTTPException(400, "ranges required for mode='ranges'")
                
                parsed_ranges = []
                used_pages = set()
                
                for part in ranges.strip().split(','):
                    part = part.strip()
                    if not part:
                        continue
                    
                    try:
                        if '-' in part:
                            start_str, end_str = part.split('-', 1)
                            start = int(start_str.strip()) - 1
                            end = int(end_str.strip()) - 1
                        else:
                            start = end = int(part.strip()) - 1
                    except ValueError:
                        raise HTTPException(400, f"Invalid range format: {part}")
                    
                    if start < 0 or end >= page_count or start > end:
                        raise HTTPException(
                            400,
                            f"Range {part} is invalid (PDF has {page_count} pages)"
                        )
                    
                    range_pages = set(range(start, end + 1))
                    if used_pages & range_pages:
                        raise HTTPException(400, f"Overlapping ranges detected at: {part}")
                    
                    used_pages.update(range_pages)
                    parsed_ranges.append((start, end))
                
                if not parsed_ranges:
                    raise HTTPException(400, "No valid ranges provided")
                
                for start, end in parsed_ranges:
                    output_doc = fitz.open()
                    output_doc.insert_pdf(source_doc, from_page=start, to_page=end)
                    pdf_buffer = BytesIO()
                    output_doc.save(pdf_buffer, garbage=4, deflate=True)
                    
                    if start == end:
                        filename = f"page_{start+1}.pdf"
                    else:
                        filename = f"pages_{start+1}-{end+1}.pdf"
                    
                    zf.writestr(filename, pdf_buffer.getvalue())
                    output_doc.close()
        
        zip_buffer.seek(0)
        
        original_name = file.filename.replace('.pdf', '') if file.filename else 'document'
        zip_filename = f"{original_name}_split.zip"
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=\"{zip_filename}\""}
        )
    finally:
        source_doc.close()
