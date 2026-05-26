import easyocr

reader = None

def extract_text(image_path):
    global reader

    if reader is None:
        reader = easyocr.Reader(["en"])

    result = reader.readtext(image_path)

    text = " ".join([item[1] for item in result])

    return text