import os
import uvicorn
from fastapi import FastAPI
from novaflow_api.routes.generation_route import generation_route

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

app = FastAPI()
app.title = "NovaFlow Backend"
app.description = "The backend for NovaFlow"
app.version = "0.1"

app.include_router(generation_route)

if __name__ == "__main__":
    if is_dev:
        log("Starting the Dev server")
        uvicorn.run("server:app", host="127.0.0.1", port=9560, timeout_keep_alive=200)
    else:
        uvicorn.run(
            "server:app", host="0.0.0.0", port=port, reload=True, reload_delay=10
        )
