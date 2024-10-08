from pydantic import BaseModel, Field
from typing import Literal
from collections import defaultdict


class GenerationRequest(BaseModel):
    name: str
    type: Literal["llm", "vlm"]
    input_text: str
    image_urls: defaultdict[str, str]
    temperature: float = Field(default=0.8, ge=0.0, le=1.0, strict=True)
    top_k: float = Field(default=40, ge=0, le=100, strict=True)
    top_p: float = Field(default=0.9, ge=0, le=1.0, strict=True)
    context_length: int = Field(
        default=2048,
        ge=500,
        le=32000,
        strict=True,
    )
    max_tokens: int = Field(default=350, le=16000, strict=True)
    provider: Literal[
        "in-built", "ollama", "groq", "openai", "google", "replicate", "huggingface"
    ]
