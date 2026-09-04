# 🎵 AudioStream — High-Speed Web Video & Audio Downloader

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Integrated-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![yt-dlp](https://img.shields.io/badge/Engine-yt--dlp-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://github.com/yt-dlp/yt-dlp)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **AudioStream** is a fast, modern media web application built with **React, TypeScript, Tailwind CSS**, and a **Python (FastAPI)** backend powered by **yt-dlp** and **FFmpeg**.
>
> 🌐 **Dual Media Engine**: AudioStream is designed to download **both high-definition Video and studio-grade Audio directly from any media URL**. Simply paste a web link from YouTube, Vimeo, TikTok, Twitter/X, Reddit, SoundCloud, or Twitch to extract and download media straight to your device.

---

## ⚡ How It Works (3 Easy Steps)

```text
 1. Paste Media URL  ──►  2. Choose Video OR Audio  ──►  3. Direct Download to PC
(YouTube, Vimeo, etc.)    (Pick Resolution or Bitrate)     (Auto-saved to Downloads)
```

1. **Paste URL**: Enter or paste any video or audio link into the glowing search bar.
2. **Select Output Mode**:
   - **Video Mode**: Pick your desired resolution (**4K 2160p**, **2K 1440p**, **1080p Full HD**, **720p HD**, **480p**) and container (`.mp4` / `.webm`).
   - **Audio Mode**: Pick your preferred format (`.mp3`, `.m4a`, `.opus`) and bitrate (**320 kbps Master**, **192 kbps High**, **128 kbps Standard**).
3. **Generate & Download**: Hit **Run / Extract** — track live progress via Server-Sent Events (SSE) with real-time transfer speed (`MB/s`) and ETA countdown. The file downloads directly into your local machine's Downloads folder!

---

## 📊 Media Capabilities Matrix

| Download Mode | Supported Formats | Available Qualities & Bitrates | Processing Pipeline |
| :--- | :--- | :--- | :--- |
| 🎥 **Video Stream** | `.mp4`, `.webm` | **4K (2160p)**, **2K (1440p)**, **1080p FHD**, **720p HD**, **480p**, **360p** | `yt-dlp` stream extraction + `FFmpegVideoConvertor` |
| 🎵 **Audio Stream** | `.mp3`, `.m4a`, `.opus` | **320 kbps** (Master Lossless), **192 kbps** (High), **128 kbps** (Standard) | `yt-dlp` stream extraction + `FFmpegExtractAudio` |

---

## ✨ Key Features

- 🎥 **Full-Resolution Video Downloads**:
  - Supports download and remuxing up to **4K (2160p)** and **1080p 60fps** with synchronized audio.
  - Multi-container selection (`.mp4` for universal compatibility or `.webm` for efficient web playback).
- 🎵 **Studio-Fidelity Audio Extraction**:
  - Extract pristine audio tracks transcoding directly to `.mp3`, `.m4a` (AAC), or `.opus`.
  - Audiophile bitrate choices: **320 kbps** (master quality), **192 kbps**, and **128 kbps**.
  - Real-time automatic file size calculation based on duration.
- ⚡ **Real-Time Progress Tracking (SSE)**:
  - Zero-polling Server-Sent Events stream live progress percentage, download speed (`MB/s`), and ETA timer.
- 📥 **Zero-Click Browser Delivery**:
  - Automatically triggers the browser's native download prompt upon file readiness.
  - Confetti celebration on successful download.
- 🎨 **Remodeled Studio Interface**:
  - Dark aesthetic featuring an interactive particle thread background canvas (`QuantumThreadCanvas`).
  - Ambient glowing input bar with clipboard paste and quick-prompt presets.
  - Media preview card displaying thumbnail, duration, channel author, and format readiness.
- 🧹 **Automatic Storage Hygiene**:
  - Temporary server files are automatically cleaned up immediately after delivery to keep disk usage near zero.

---

## 📂 Project Architecture

```text
audioconverter/
│
├── 🎨 frontend/                             # React 19 + TypeScript + Vite UI
│   ├── index.html                           # HTML Entrypoint
│   ├── package.json                         # Dependencies (React 19, Tailwind CSS v4, Lucide)
│   ├── vite.config.ts                       # Bundler & /api reverse-proxy configuration
│   ├── dist/                                # Production web build (served by FastAPI)
│   ├── public/                              # Static public assets
│   │   └── favicon.svg                      # Custom AudioStream soundwave & play icon
│   └── src/                                 # Application source code
│       ├── main.tsx                         # React DOM root mounting
│       ├── App.tsx                          # Primary state coordinator & SSE listener
│       ├── index.css                        # Studio design system & Tailwind CSS tokens
│       ├── types/media.ts                   # TypeScript interfaces (MediaInfo, JobProgress)
│       └── components/                      # Modular UI components
│           ├── UrlForm.tsx                  # URL intake bar with paste button & quick presets
│           ├── MediaCard.tsx                # Video metadata card (thumbnail, duration, channel)
│           ├── FormatPicker.tsx             # Dual Video/Audio selector & live progress bar
│           ├── ErrorAlert.tsx               # Glassmorphic error feedback banner with retry
│           └── QuantumThreadCanvas.tsx      # Interactive particle thread background
│
├── ⚙️ backend/                              # Python FastAPI backend service
│   ├── main.py                              # MAIN LAUNCHER: Runs Uvicorn server & opens browser
│   ├── requirements.txt                     # Dependencies (FastAPI, yt-dlp, static-ffmpeg, pytest)
│   ├── temp_downloads/                      # Temporary storage for downloaded media (auto-cleaned)
│   │
│   ├── app/                                 # Core backend application package
│   │   ├── main.py                          # FastAPI instance, CORS, routers & static UI mount
│   │   ├── config.py                        # Settings, static-ffmpeg initialization & retention limits
│   │   ├── schemas.py                       # Pydantic models for requests, media info & progress
│   │   ├── routers/                         # API route controllers
│   │   │   ├── media.py                     # /api/info, /api/download, /api/stream endpoints
│   │   │   └── progress.py                  # /api/progress/{job_id} SSE streaming endpoint
│   │   └── services/                        # Business logic & background workers
│   │       ├── media_service.py             # URL validation & yt-dlp metadata extraction
│   │       └── job_queue.py                 # Async job queue, concurrency semaphore & FFmpeg post-processing
│   │
│   └── tests/                               # Backend test suite
│       └── test_media_api.py                # Pytest unit tests for API routes and URL validation
│
└── 📄 README.md                             # Documentation & user guide
```

---

## 🚀 Quick Start (Single Command)

AudioStream includes an automated launcher that starts the FastAPI server and automatically opens your default web browser:

1. **Open your terminal** and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. **Run the launcher script**:
   ```bash
   python main.py
   ```

3. **That's it!** Your default browser will automatically open to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**!

---

## 🛠️ Prerequisites & Manual Setup

### 1. Requirements
- **Python 3.10 or newer**
- **Node.js 18+ & npm** *(only required if modifying or developing frontend code)*

### 2. Backend Setup
Install Python dependencies into your environment:
```bash
cd backend
python -m pip install -r requirements.txt
```
> ℹ️ *Note: `static-ffmpeg` automatically manages static FFmpeg and FFprobe binaries on first launch — no manual system FFmpeg installation needed!*

### 3. Frontend Development (Optional)
To run the frontend in Vite development mode with hot reloading:
```bash
cd frontend
npm install
npm run dev
```

To re-build the production web bundle that FastAPI serves:
```bash
cd frontend
npm run build
```

---

## 🔌 API Reference

AudioStream exposes clean REST and SSE endpoints with interactive Swagger docs at `/docs`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/info` | Inspects a media URL and returns title, thumbnail, duration, author, and available video/audio options. |
| `POST` | `/api/download` | Enqueues an asynchronous download and conversion job for either video or audio. |
| `GET` | `/api/progress/{job_id}` | Real-time Server-Sent Events (SSE) stream broadcasting percent, speed (`MB/s`), and ETA. |
| `GET` | `/api/stream/{job_id}` | Streams the completed file directly to the client browser and purges server copy. |
| `GET` | `/api/health` | Service health status check returning uptime, active jobs, and server metrics. |

---

## 🧪 Testing

Run the automated backend Pytest suite:
```bash
cd backend
python -m pytest tests/
```

---

## 🌐 Supported URL Sources

AudioStream leverages the latest `yt-dlp` extraction engine, supporting media retrieval and conversion from hundreds of platforms:
- **YouTube** (Videos, Shorts, Playlists)
- **Vimeo**
- **TikTok**
- **Twitter / X**
- **Reddit**
- **SoundCloud**
- **Twitch**
- *...and hundreds more web hosts!*

---

## 📜 Fair Use & Disclaimer

This software is intended for personal archiving, educational exploration, and fair-use media downloading. Users must comply with the Terms of Service of content providers and copyright laws. AudioStream does not circumvent DRM protections or paywalls.
