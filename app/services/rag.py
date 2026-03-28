from ..db.chroma import get_chroma_collection


async def query_drug_labels(query: str, n_results: int = 5) -> list[dict]:
    """Query ChromaDB for drug label chunks matching the query."""
    collection = get_chroma_collection()
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        include=["documents", "metadatas"],
    )
    chunks = []
    if results["documents"] and results["metadatas"]:
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            chunks.append({"text": doc, "source": meta.get("drug_name", "unknown")})
    return chunks
