import asyncio
from collections.abc import AsyncIterator
import re
from urllib.parse import parse_qs, urlencode, urlsplit, urlunsplit

import asyncpg
from fastapi import HTTPException

from app.config import settings

pool: asyncpg.Pool | None = None
pool_lock = asyncio.Lock()


async def database_pool() -> asyncpg.Pool:
    global pool
    if pool is not None:
        return pool
    async with pool_lock:
        if pool is None:
            url = urlsplit(settings.DATABASE_URL.get_secret_value().strip())
            if url.scheme not in {'postgresql', 'postgres'} or not url.hostname:
                raise ValueError('Invalid PostgreSQL URL')
            options = parse_qs(url.query)
            schema = options.get('schema', ['public'])[-1]
            if not schema.isidentifier():
                raise ValueError('Unsupported PostgreSQL schema')
            supported = {key: options[key][-1] for key in ('sslmode', 'sslrootcert', 'sslcert', 'sslkey') if key in options}
            dsn = urlunsplit(('postgresql', url.netloc, url.path, urlencode(supported), ''))
            pool = await asyncpg.create_pool(dsn, min_size=1, max_size=6, timeout=4, command_timeout=5,
                server_settings={'search_path': f'"{schema}"', 'default_transaction_read_only': 'on'})
    return pool


async def get_db() -> AsyncIterator[asyncpg.Pool]:
    try:
        engine = await database_pool()
    except (OSError, TimeoutError, ValueError, asyncpg.PostgresError):
        raise HTTPException(503, 'Trợ lý chưa kết nối được dữ liệu tour.') from None
    yield engine


async def close_database() -> None:
    global pool
    if pool is not None:
        await pool.close()
        pool = None


async def fetch_rows(db: asyncpg.Connection | asyncpg.Pool, sql: str, **params) -> list[asyncpg.Record]:
    """Keep the reference SQL's named parameters and bind them through asyncpg."""
    names = []

    def bind(match):
        name = match[1]
        if name not in names:
            names.append(name)
        return f'${names.index(name) + 1}'

    statement = re.sub(r'(?<!:):([a-zA-Z_]\w*)', bind, sql)
    values = [params[name] for name in names]
    if isinstance(db, asyncpg.Pool):
        async with db.acquire(timeout=4) as connection:
            return await connection.fetch(statement, *values)
    return await db.fetch(statement, *values)
