import asyncio
from contextlib import suppress
from dataclasses import dataclass
import hashlib
import json
import logging
from pathlib import Path
import tempfile
from time import monotonic

from langchain_community.vectorstores import FAISS
import numpy as np

from app.config import settings
from app.database import close_database, database_pool
from app.core.normalizer import plain
from app.clients.openai_client import embedding_model

logger = logging.getLogger(__name__)


@dataclass
class FlatVectorIndex:
    ids: list[int]
    vectors: np.ndarray

    def search(self, vector: list[float], limit: int) -> list[int]:
        offsets = self.vectors - np.asarray(vector, dtype=np.float32)
        squared_distances = np.einsum('ij,ij->i', offsets, offsets)
        return [self.ids[index] for index in np.argsort(squared_distances, kind='stable')[:limit]]


vector_store: FAISS | FlatVectorIndex | None = None
pending: asyncio.Task | None = None
next_refresh = 0.0


def index_file() -> Path:
    return settings.AI_INDEX_DIR / "index.npz"


def load_vectors(path: Path, expected_hash: str, expected_rows: int) -> list[list[float]] | None:
    if not path.is_file():
        return None
    try:
        with np.load(path) as data:
            if str(data.get('hash', '')) != expected_hash or int(data.get('rows', 0)) != expected_rows:
                return None
            return data['vectors'].tolist()
    except Exception:
        return None


def save_vectors(path: Path, signature: str, vectors: list[list[float]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile('wb', dir=path.parent, delete=False, suffix='.tmp') as temporary:
        tmp_path = Path(temporary.name)
    try:
        np.savez_compressed(tmp_path, hash=signature, rows=len(vectors), vectors=np.asarray(vectors, dtype=np.float32))
        tmp_path.replace(path)
    finally:
        with suppress(OSError):
            tmp_path.unlink()


def build_store(ids: list[int], documents: list[str], vectors: list[list[float]]):
    try:
        return FAISS.from_texts(documents, embedding_model(), metadatas=[{'tour_id': id_} for id_ in ids])
    except Exception:
        logger.info("Native FAISS could not be loaded; using exact L2 search for this index")
        return FlatVectorIndex(ids=ids, vectors=np.asarray(vectors, dtype=np.float32))


def search_by_vector(store: FAISS | FlatVectorIndex, vector: list[float], limit: int) -> list[int]:
    if isinstance(store, FlatVectorIndex):
        return store.search(vector, limit)
    docs = store.similarity_search_by_vector(vector, k=limit)
    return [doc.metadata['tour_id'] for doc in docs if 'tour_id' in doc.metadata]


async def index_tours() -> int:
    global vector_store
    pool = await database_pool()
    async with pool.acquire(timeout=4) as db:
        rows = await db.fetch("""
          SELECT t.tour_id, t.name, t.summary, t.description,
            (SELECT string_agg(l.name, ', ' ORDER BY d.visit_order, d.location_id)
             FROM tour_destinations d JOIN locations l USING (location_id) WHERE d.tour_id=t.tour_id) AS locations
          FROM tours t WHERE t.status=1 ORDER BY t.tour_id
        """)
    if not rows:
        vector_store = None
        return 0

    ids = [row['tour_id'] for row in rows]
    documents = [f"Tên tour: {row['name']}. Tóm tắt: {plain(row['summary'], 700)}. "
                 f"Mô tả: {plain(row['description'], 2400)}. Điểm đến: {row['locations'] or ''}." for row in rows]
    signature = hashlib.sha256(json.dumps([settings.AI_EMBEDDING_MODEL, ids, documents], ensure_ascii=False).encode()).hexdigest()
    path = index_file()
    vectors = await asyncio.to_thread(load_vectors, path, signature, len(ids))
    if vectors is None:
        vectors = await embedding_model().aembed_documents(documents)
        await asyncio.to_thread(save_vectors, path, signature, vectors)
    vector_store = await asyncio.to_thread(build_store, ids, documents, vectors)
    return len(ids)


async def semantic_tour_ids(query: str, limit: int = 4) -> list[int]:
    global pending, next_refresh
    now = monotonic()
    if vector_store is None or now >= next_refresh:
        if pending is None or pending.done():
            next_refresh = now + settings.AI_INDEX_TTL_SECONDS
            pending = asyncio.create_task(index_tours())
        if vector_store is None:
            await pending
    if vector_store is None:
        return []
    vector = await embedding_model().aembed_query(query)
    return await asyncio.to_thread(search_by_vector, vector_store, vector, limit)


async def close_index() -> None:
    global vector_store, pending
    if pending and not pending.done():
        pending.cancel()
        with suppress(asyncio.CancelledError):
            await pending
    vector_store = None
    pending = None

