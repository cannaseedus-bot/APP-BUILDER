"""
I/O Utilities for ASX Runtime
"""
import json
import base64
import io
from typing import Dict, List, Optional, Any

try:
    import PIL.Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


def load_json(filepath: str) -> Any:
    """Load JSON from file"""
    with open(filepath, "r") as f:
        return json.load(f)


def save_json(data: Any, filepath: str, indent: int = 2) -> None:
    """Save data to JSON file"""
    with open(filepath, "w") as f:
        json.dump(data, f, indent=indent)


def load_pil_images(conversations: List[Dict[str, str]]) -> List:
    """
    Load PIL images from conversation messages.

    Supports file paths or base64-encoded images.

    Args:
        conversations: List of message dicts with optional 'images' key

    Returns:
        List of PIL.Image objects
    """
    if not PIL_AVAILABLE:
        raise ImportError("PIL not installed. Run: pip install pillow")

    pil_images = []

    for message in conversations:
        if "images" not in message:
            continue

        for image_data in message["images"]:
            if image_data.startswith("data:image"):
                # Base64 encoded image
                _, image_data = image_data.split(",", 1)
                image_bytes = base64.b64decode(image_data)
                pil_img = PIL.Image.open(io.BytesIO(image_bytes))
            else:
                # File path
                pil_img = PIL.Image.open(image_data)

            pil_img = pil_img.convert("RGB")
            pil_images.append(pil_img)

    return pil_images


def image_to_base64(image_path: str) -> str:
    """Convert image file to base64 string"""
    if not PIL_AVAILABLE:
        raise ImportError("PIL not installed. Run: pip install pillow")

    with PIL.Image.open(image_path) as img:
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()


def base64_to_image(base64_str: str) -> "PIL.Image.Image":
    """Convert base64 string to PIL Image"""
    if not PIL_AVAILABLE:
        raise ImportError("PIL not installed. Run: pip install pillow")

    if base64_str.startswith("data:image"):
        _, base64_str = base64_str.split(",", 1)

    image_bytes = base64.b64decode(base64_str)
    return PIL.Image.open(io.BytesIO(image_bytes))
