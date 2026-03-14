from typing import cast

from fastapi import FastAPI, HTTPException
from fastapi import APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from backend.routes import health

preview_router = cast(APIRouter, __import__("backend.routes.preview", fromlist=["router"]).router)
merge_router = cast(APIRouter, __import__("backend.routes.merge", fromlist=["router"]).router)
compress_router = cast(APIRouter, __import__("backend.routes.compress", fromlist=["router"]).router)
split_router = cast(APIRouter, __import__("backend.routes.split", fromlist=["router"]).router)
pdf_to_image_router = cast(APIRouter, __import__("backend.routes.pdf_to_image", fromlist=["router"]).router)
image_to_pdf_router = cast(APIRouter, __import__("backend.routes.image_to_pdf", fromlist=["router"]).router)

app = FastAPI(title="NanoPDF", version="0.1.0")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(preview_router)
app.include_router(merge_router)
app.include_router(compress_router)
app.include_router(split_router)
app.include_router(pdf_to_image_router)
app.include_router(image_to_pdf_router)

app.mount("/assets", StaticFiles(directory="backend/static/assets"), name="assets")


@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not Found")
    return FileResponse("backend/static/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
