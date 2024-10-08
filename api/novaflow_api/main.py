import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import chat

# CLI utilities
from dotenv import load_dotenv
from rich.traceback import install
from utils.logging_handler import log


# Initialize the fancy pretty printed traceback handler
install(show_locals=True)

# Load all the env variables
load_dotenv()

# Get the environment variables
is_dev = os.environ.get("IS_DEV", "false").lower() == "true"
port = int(os.environ.get("PORT", 9090))

app = FastAPI(
    title="NovaFlow Backend", description="The backend for NovaFlow", version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, tags=["chat"])

if __name__ == "__main__":
    if is_dev:
        log("Starting the Dev server")
        uvicorn.run("main:app", host="127.0.0.1", port=9560, timeout_keep_alive=200)
    else:
        uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, reload_delay=10)
