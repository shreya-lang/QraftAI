import logging
import os

import cv2
import pytesseract

logger = logging.getLogger(__name__)


def extract_text(image_path):
    if not image_path or not os.path.exists(image_path):
        logger.warning(
            "OCR called with missing image: %s",
            image_path
        )
        return ""

    try:
        # Read image
        image = cv2.imread(image_path)

        if image is None:
            logger.warning(
                "Could not read image: %s",
                image_path
            )
            return ""

        # Resize large images to reduce memory usage
        height, width = image.shape[:2]

        max_dimension = 1600

        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)

            image = cv2.resize(
                image,
                None,
                fx=scale,
                fy=scale,
                interpolation=cv2.INTER_AREA
            )

        # Convert to grayscale
        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        # Improve text readability
        gray = cv2.threshold(
            gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )[1]

        # OCR
        text = pytesseract.image_to_string(
            gray,
            config="--psm 6"
        )

        return text.strip()

    except Exception:
        logger.exception(
            "OCR processing failed for %s",
            image_path
        )
        return ""