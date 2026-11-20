from functools import lru_cache
import httpx

from fastapi import HTTPException
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.config import settings


class OpenAIInvocationError(Exception):
    def __init__(self, status_code: int | None):
        self.status_code = status_code
        super().__init__('OpenAI generation failed')


def api_key() -> str:
    key = settings.OPENAI_API_KEY.get_secret_value().strip()
    if not key:
        raise HTTPException(503, "Chưa cấu hình OPENAI_API_KEY cho trợ lý tư vấn.")
    return key


async def call_chat_completion(messages: list[dict], timeout: float = 22.0) -> str:
    url = f"{settings.OPENAI_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key()}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.AI_CHAT_MODEL,
        "messages": messages,
    }
    if settings.AI_CHAT_MODEL != 'gpt-6-luna':
        payload["temperature"] = 0.2

    async with httpx.AsyncClient(timeout=timeout) as client:
        res = await client.post(url, headers=headers, json=payload)
        res.raise_for_status()
        data = res.json()
        return data["choices"][0]["message"]["content"].strip()


@lru_cache(maxsize=1)
def chat_model():
    model = settings.AI_CHAT_MODEL
    options = {} if model == 'gpt-6-luna' else {'temperature': 0.2}
    return ChatOpenAI(model=model, api_key=api_key(), base_url=settings.OPENAI_BASE_URL,
                      use_responses_api=False, timeout=30, max_retries=0, **options)


@lru_cache(maxsize=1)
def embedding_model():
    return OpenAIEmbeddings(model=settings.AI_EMBEDDING_MODEL, api_key=api_key(),
                            base_url=settings.OPENAI_BASE_URL, request_timeout=12,
                            max_retries=0, check_embedding_ctx_length=False)

