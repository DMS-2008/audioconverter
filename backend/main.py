import sys
import time
import threading
import webbrowser
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import uvicorn
from app.main import app

def open_browser():
    time.sleep(1.5)
    print("Opening V2A Web Application in your default browser...")
    webbrowser.open("http://127.0.0.1:8000")

if __name__ == "__main__":
    print("\n========================================================")
    print("🚀 Starting V2A Web Application at http://127.0.0.1:8000")
    print("========================================================\n")
    
    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)
