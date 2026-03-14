from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import health, preview, merge, compress, split, pdf_to_image, image_to_pdf

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
app.include_router(preview.router)
app.include_router(merge.router)
app.include_router(compress.router)
app.include_router(split.router)
app.include_router(pdf_to_image.router)
app.include_router(image_to_pdf.router)


# TODO: SPA catch-all route - Activated in Task 19
# @app.get("/{full_path:path}")
# async def spa_fallback(full_path: str):
#     from fastapi.responses import FileResponse
#     return FileResponse("../frontend/dist/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
