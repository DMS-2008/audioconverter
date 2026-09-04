import sys
import time
import argparse
import threading
import webbrowser
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import uvicorn
from app.config import APP_NAME, APP_VERSION, HOST as DEFAULT_HOST, PORT as DEFAULT_PORT
from app.main import app

def open_browser(host: str, port: int):
    time.sleep(1.5)
    url_host = "localhost" if host in ("0.0.0.0", "127.0.0.1") else host
    url = f"http://{url_host}:{port}"
    print(f"✨ Opening {APP_NAME} in your default browser ({url})...")
    webbrowser.open(url)

def parse_args():
    parser = argparse.ArgumentParser(description=f"{APP_NAME} — Production Media Studio Launcher")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host address to bind the server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to bind the server")
    parser.add_argument("--no-browser", action="store_true", help="Do not automatically open web browser")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()

    print("\n" + "=" * 62)
    print(f"  🎬 {APP_NAME} v{APP_VERSION} — Universal Web Video & Audio Studio")
    print(f"  🚀 Server active at: http://{args.host}:{args.port}")
    print(f"  📖 API Documentation: http://{args.host}:{args.port}/docs")
    print("=" * 62 + "\n")
    
    if not args.no_browser and not args.reload:
        threading.Thread(target=open_browser, args=(args.host, args.port), daemon=True).start()

    uvicorn.run(
        "app.main:app" if args.reload else app,
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1,
        log_level="info"
    )
