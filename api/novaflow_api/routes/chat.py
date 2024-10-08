from fastapi import APIRouter, HTTPException

from novaflow_api.models.generate_request import GenerationRequest

router = APIRouter()


@router.post("/api/generate")
async def generate(request: GenerationRequest):
    return {"response": ""}
