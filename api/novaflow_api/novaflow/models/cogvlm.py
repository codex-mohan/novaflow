import torch
from PIL import Image

from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


class CogVLM:
    text_only: bool
    supported_quants = "bnd"
    quants_precision: list[int] = [4, 8]

    def __init__(self, model_path: str, version: int = 2, device: str = "cuda"):
        self.version = version
        if version == 1:
            self.text_only = True
        else:
            self.text_only = False
