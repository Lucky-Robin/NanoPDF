from io import BytesIO
import importlib
from typing import Annotated, Any

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from backend import config
from backend.services.pdf_service import validate_pdf

fitz: Any = importlib.import_module("fitz")

router = APIRouter()


def _reduction_percent(original_size: int, compressed_size: int) -> int:
    if original_size <= 0:
        return 0
    return max(0, round((1 - (compressed_size / original_size)) * 100))


def _build_pdf_response(data: bytes, original_size: int, compressed_size: int, method: str) -> StreamingResponse:
    reduction_percent = _reduction_percent(original_size, compressed_size)
    return StreamingResponse(
        BytesIO(data),
        media_type="application/pdf",
        headers={
            "X-Original-Size": str(original_size),
            "X-Compressed-Size": str(compressed_size),
            "X-Reduction-Percent": str(reduction_percent),
            "X-Compression-Method": method,
            "Content-Disposition": "attachment; filename=\"compressed.pdf\"",
        },
    )


@router.post("/api/compress")
async def compress_pdf(file: Annotated[UploadFile, File(...)], target: Annotated[int, Form(...)]):
    if target not in [10, 20, 30, 40, 50, 60, 70, 80, 90]:
        raise HTTPException(400, "Target must be 10-90 in 10% steps")

    pdf_bytes = await validate_pdf(file)
    original_size = len(pdf_bytes)

    lossless_doc: Any = fitz.open(stream=pdf_bytes, filetype="pdf")
    lossless_bytes = b""
    lossless_size = original_size
    try:
        lossless_buffer = BytesIO()
        lossless_doc.save(lossless_buffer, garbage=4, deflate=True, clean=True)
        lossless_bytes = lossless_buffer.getvalue()
        lossless_size = len(lossless_bytes)
        lossless_reduction = _reduction_percent(original_size, lossless_size)

        if lossless_reduction >= target:
            return _build_pdf_response(lossless_bytes, original_size, lossless_size, "lossless")
    finally:
        lossless_doc.close()

    lossy_doc: Any = fitz.open(stream=pdf_bytes, filetype="pdf")
    lossy_bytes = b""
    lossy_size = original_size
    try:
        quality_map: dict[int, int] = getattr(config, "JPEG_QUALITY_MAP")
        quality = quality_map[target]

        for page in lossy_doc:
            for image in page.get_images(full=True):
                xref = image[0]
                try:
                    pix = fitz.Pixmap(lossy_doc, xref)
                    if pix.colorspace != fitz.csRGB:
                        rgb_pix = fitz.Pixmap(fitz.csRGB, pix)
                        pix = rgb_pix
                    if pix.alpha:
                        no_alpha_pix = fitz.Pixmap(pix, 0)
                        pix = no_alpha_pix

                    jpeg_bytes = pix.tobytes("jpeg", jpg_quality=quality)
                    page.replace_image(xref, stream=jpeg_bytes)
                except Exception:
                    continue

        lossy_buffer = BytesIO()
        lossy_doc.save(lossy_buffer, garbage=4, deflate=True, clean=True)
        lossy_bytes = lossy_buffer.getvalue()
        lossy_size = len(lossy_bytes)
    finally:
        lossy_doc.close()

    if lossless_size >= original_size and lossy_size >= original_size:
        return _build_pdf_response(pdf_bytes, original_size, original_size, "already_optimized")

    if lossy_size < lossless_size:
        return _build_pdf_response(lossy_bytes, original_size, lossy_size, "lossy")

    return _build_pdf_response(lossless_bytes, original_size, lossless_size, "lossless")
