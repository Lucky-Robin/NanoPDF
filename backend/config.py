"""Configuration constants for NanoPDF backend."""

# File size and count limits
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB in bytes
MAX_FILES_PER_REQUEST = 20

# PDF rendering configuration
THUMBNAIL_DPI = 72
IMAGE_EXPORT_DPI = 150
MAX_THUMBNAIL_PAGES = 50

# Paper size (A4 in points)
A4_WIDTH = 595
A4_HEIGHT = 842

# Allowed MIME types
ALLOWED_PDF_MIME = {"application/pdf"}
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}

JPEG_QUALITY_MAP = {
    10: 90,
    20: 85,
    30: 75,
    40: 65,
    50: 55,
    60: 45,
    70: 35,
    80: 25,
    90: 15,
}
