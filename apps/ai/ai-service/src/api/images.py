"""Image upload validation shared by HTTP handlers."""
import io
import warnings
from fastapi import HTTPException
from PIL import Image, UnidentifiedImageError
from src.common import open_rgb

MAX_BYTES = 10 * 1024 * 1024
MAX_PIXELS = 25_000_000
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_FORMAT = {"JPEG", "PNG", "WEBP"}

def decode_upload(data):
    if not data:
        raise HTTPException(400, "Ảnh rỗng.")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(data)) as image:
                if image.format not in ALLOWED_FORMAT:
                    raise HTTPException(415, "Chỉ hỗ trợ JPEG, PNG và WEBP.")
                if image.width * image.height > MAX_PIXELS:
                    raise HTTPException(413, "Ảnh vượt quá 25 megapixel.")
                if min(image.size) < 64:
                    raise HTTPException(400, "Cạnh ngắn của ảnh cần ít nhất 64 pixel.")
                if getattr(image, "n_frames", 1) != 1:
                    raise HTTPException(415, "Không hỗ trợ ảnh động.")
                image.verify()
            return open_rgb(io.BytesIO(data))
    except HTTPException:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(413, "Ảnh có kích thước giải nén quá lớn.")
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError):
        raise HTTPException(400, "Nội dung ảnh không hợp lệ hoặc bị hỏng.")


