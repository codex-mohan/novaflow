from fastapi import APIRouter, HTTPException

from novaflow_api.models.generate_request import GenerationRequest

generation_route = APIRouter()


@generation_route.post("/api/generate")
async def generate(request: GenerationRequest):
    return {"response": ""}
