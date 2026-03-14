# NanoPDF

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

> A minimalist, privacy-focused, local-first PDF toolkit. No cloud uploads, no tracking, just pure PDF processing.

## Features

- 📄 **Preview & Sort** — View thumbnails and drag-drop to reorder pages
- 🔗 **Merge PDFs** — Combine multiple PDFs into one
- 🗜️ **Smart Compress** — Reduce file size with adjustable compression (10-90%)
- ✂️ **Split PDF** — Extract pages or split by custom ranges
- 🖼️ **PDF to Image** — Convert pages to PNG/JPEG
- 📋 **Image to PDF** — Convert images to PDF

## Quick Start

```bash
git clone https://github.com/Lucky-Robin/NanoPDF.git
cd NanoPDF
docker-compose up
```

Open http://localhost:3000 in your browser.

## Development

### Backend
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack

- **Backend**: Python 3.11, FastAPI, PyMuPDF (fitz)
- **Frontend**: React 19, Tailwind CSS v4, Vite
- **Deployment**: Docker (single-container with multi-stage build)
- **Testing**: pytest (backend), vitest (frontend)

## Architecture

- **No database** — Stateless processing, files are processed and immediately deleted
- **No authentication** — Designed for local use, no user accounts
- **Privacy-first** — All processing happens locally, no cloud uploads or analytics
- **Single-container deployment** — FastAPI serves both API and static frontend

## License

GPLv3 — See [LICENSE](LICENSE) for details.

---

Built with a focus on simplicity, privacy, and local-first processing.
