import torch
from novaflow_api.utils.logging_handler import log


def check_gpu_memory() -> None:
    if torch.cuda.is_available():
        device_count = torch.cuda.device_count()
        log(f"GPU Available! Found {device_count} GPU(s)", "info")
        for i in range(device_count):
            log(f"GPU Name: {torch.cuda.get_device_name(device=i)}", "info")
            memory_stat = torch.cuda.memory.mem_get_info(device=i)
            log(f"Total GPU Capacity: {memory_stat[1]}, Free: {memory_stat[0]}", "info")
    else:
        log("GPU Unavailable. Using CPU instead...", "warning")


check_gpu_memory()
