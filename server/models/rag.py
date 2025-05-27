from typing import TypeAlias
from pydantic import BaseModel, ConfigDict

Embedding: TypeAlias = list[float]
ColBERT: TypeAlias = list[Embedding]

class ImageRagResponse(BaseModel):
    embeddings: list[ColBERT]
    image: list | None
    model_config = ConfigDict(arbitrary_types_allowed=True)