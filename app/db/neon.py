import ssl as ssl_module
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from ..core.config import settings


def _fix_neon_url(url: str) -> tuple[str, dict]:
    """Strip sslmode from URL and return (clean_url, connect_args)."""
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    connect_args = {}

    if "sslmode" in params or "ssl" in params:
        params.pop("sslmode", None)
        params.pop("ssl", None)
        # Create an SSL context for NeonDB
        ctx = ssl_module.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl_module.CERT_NONE
        connect_args["ssl"] = ctx

    # Rebuild query string without sslmode
    new_query = urlencode({k: v[0] for k, v in params.items()})
    clean_url = urlunparse(parsed._replace(query=new_query))
    return clean_url, connect_args


_clean_url, _connect_args = _fix_neon_url(settings.NEONDB_URL)

engine = create_async_engine(
    _clean_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=_connect_args,
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
