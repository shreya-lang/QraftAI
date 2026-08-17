import easyocr
import logging
import os

logger = logging.getLogger(__name__)

reader = None


def _init_reader():
    global reader

    if reader is None:
        try:
            reader = easyocr.Reader(["en"])
        except Exception:
            logger.exception("Failed to initialize EasyOCR reader")
            reader = None


def extract_text(image_path):
    global reader

    if not image_path or not os.path.exists(image_path):
        logger.warning("extract_text called with missing image: %s", image_path)
        return ""

    if reader is None:
        _init_reader()

    if reader is None:
        # Reader couldn't be created; return empty string to avoid crashing callers
        return ""

    try:
        result = reader.readtext(image_path)
        text = " ".join([item[1] for item in result if len(item) > 1])
        return text
    except Exception:
        logger.exception("Error during OCR processing for %s", image_path)
        return ""