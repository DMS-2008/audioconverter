# V2A - Web Video & Lossless Audio Downloader

V2A is a modern, full-stack web application built with **React, Vite, TypeScript, Tailwind CSS**, and **Python (FastAPI)** powered by **yt-dlp** and **FFmpeg**. It enables users to paste video URLs from YouTube and other web platforms, select custom resolutions or audio bitrates, and download files with real-time SSE progress tracking.

---

## 📂 Project Architecture

```text
audioconverter/
│
├── 🎨 frontend/                     # ALL UI & INTERFACE CODE
│   ├── index.html                   # HTML Entrypoint
│   ├── package.json                 # React, Tailwind & Lucide dependencies
│   ├── vite.config.ts               # Vite bundler & API proxy configuration
│   ├── dist/                        # Production compiled web build (served by FastAPI)
│   └── src/                         # React components, design system & state
│
├── ⚙️ backend/                      # ALL WORKING LOGIC & CONVERSION ENGINE
│   ├── main.py                      # MAIN LAUNCHER SCRIPT (Runs server & opens browser)
│   ├── app.py                      # Entrypoint alias
│   ├── requirements.txt             # Python dependencies (FastAPI, yt-dlp, static-ffmpeg, pytest)
│   ├── temp_downloads/              # Temporary file storage (auto-cleaned after delivery)
│   ├── app/                         # FastAPI routes, schemas & services
│   └── tests/                       # Pytest unit tests
│
└── 📄 README.md                     # Documentation & setup guide
```

---

## 🚀 Quick Start (Single Command)

To run the application:

1. Open your terminal and navigate to the **`backend`** directory:
   ```bash
   cd backend
   ```

2. Run the main Python script:
   ```bash
   python main.py
   ```

3. **Your web browser will automatically open** to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**!

---

## 🛠️ Prerequisites & Manual Setup

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm** (only needed if modifying frontend code)

### 2. Python Dependencies
If installing on a new machine:
```bash
cd backend
python -m pip install -r requirements.txt
```
*(Note: `static-ffmpeg` automatically manages static FFmpeg binaries on first boot.)*

---

## 🧪 Running Unit Tests

To run the backend Pytest suite:
```bash
cd backend
python -m pytest tests/
```

To re-build the production frontend UI bundle (if modifying `frontend/src`):
```bash
cd frontend
npm run build
```

---

## 📜 Fair Use & Terms

Only download content you have the rights to download, and respect source platform Terms of Service. V2A does not bypass DRM-protected or paywalled content.
