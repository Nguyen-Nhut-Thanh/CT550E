import os
import logging
import httpx

logger = logging.getLogger(__name__)


def gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


async def call_gemini_vision(prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg", timeout: float = 25.0) -> str:
    """Call Google Gemini Vision API for landmark/image recognition."""
    api_key = gemini_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured.")

    import base64
    b64_img = base64.b64encode(image_bytes).decode("utf-8")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_img
                        }
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        candidates = data.get("candidates", [])
        if candidates and "content" in candidates[0]:
            parts = candidates[0]["content"].get("parts", [])
            if parts and "text" in parts[0]:
                return parts[0]["text"].strip()
        raise ValueError("Gemini returned empty response.")

