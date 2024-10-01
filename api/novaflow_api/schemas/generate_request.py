from pydantic import BaseModel, confloat, Field
from typing import Literal
from collections import defaultdict


class GenerationRequest(BaseModel):
    model_name: str
    model_type: Literal["llm", "vlm"]
    input_text: str
    image_urls: defaultdict[str, str]
    temperature = Field(default=0.8, ge=0.0, le=1.0, strict=True)
    top_k = Field(default=40, ge=0, le=100, strict=True)
    top_p = Field(default=0.9, ge=0, le=1.0, strict=True)
    context_length = Field(
        default=2048,
        ge=500,
        le=32000,
        strict=True,
    )
    max_tokens = Field(default=350, le=16000, strict=True)
