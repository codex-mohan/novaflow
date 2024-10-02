import enum
import logging

from typing import Literal, Any
from rich.logging import RichHandler

FORMAT = "%(message)s"
DATE_FORMAT = "%d-%m-%Y %H:%M:%S"


def log(
    message: str | None,
    level: Literal["debug", "info", "error", "warning", "exception"] = "info",
) -> None:

    logging.basicConfig(
        level=logging.NOTSET,
        format=FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[RichHandler(markup=True, rich_tracebacks=True)],
    )
    log = logging.getLogger("rich")

    log_type_dict = {
        "debug": log.debug,
        "info": log.info,
        "error": log.error,
        "warning": log.warning,
        "exception": log.exception,
    }

    log_type_dict[level](msg=message)
