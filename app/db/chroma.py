import chromadb
from ..core.config import settings

_client = None
_collection = None


def get_chroma_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection
