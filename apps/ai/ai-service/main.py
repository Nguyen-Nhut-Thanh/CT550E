"""Stable Uvicorn entry point; HTTP implementation lives in src.api."""
from src.api.app import app, decode_upload
