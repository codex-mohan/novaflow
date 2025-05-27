import torch
import pdf2image
from PIL.Image import Image
from colpali_engine import ColPali, ColPaliProcessor

from typing import cast, TypeAlias

from ..models.rag import ImageRagResponse

Embeddings: TypeAlias = list[float]


class VectorDB:
    def __init__(self, index:str = '', processor_batch_size: int = 10,dtype: torch.dtype = torch.bfloat16, device: str = "cuda:0"):
        self.image_model_name = "vidore/colpali-v1.3"
        self.image_model = cast(ColPali, ColPali.from_pretrained(self.image_model_name, dtype=dtype, device=device))
        self.processor = cast(ColPaliProcessor, ColPaliProcessor.from_pretrained(self.image_model_name))
        self.index = None
        self.processor_batch_size = processor_batch_size

    def embed_pdf(self, pdf_path: str | bytes):
        if isinstance(pdf_path, str):
            images = pdf2image.convert_from_path(pdf_path)
        elif isinstance(pdf_path, bytes):
            images = pdf2image.convert_from_bytes(pdf_path)
        else:
            raise ValueError("pdf_path must be a string or bytes")
        
        embeddings = []

        for i in range(0, len(images), self.processor_batch_size):
            outputs = self.embed_images(images[i:i+self.processor_batch_size])
            embeddings.extend(outputs)

    def embed_images(self, images: list[Image], include_):
        batch_processed_images = self.processor.process_images(images).to(self.image_model.device)

        with torch.no_grad():
            embeddings = self.image_model(**batch_processed_images) 
            return embeddings.tolist()