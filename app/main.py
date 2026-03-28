from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db.neon import engine
from .db.models import Base
from .db.seed import seed_all
from .db.chroma import get_chroma_collection
from .api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🔬 MedForensics starting up...")

    # 1. Create tables on NeonDB (CREATE TABLE IF NOT EXISTS)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ NeonDB tables ready")

    # 2. Seed demo patients if table is empty
    await seed_all()

    # 3. Init ChromaDB + seed drug labels if empty
    col = get_chroma_collection()
    if col.count() == 0:
        from .db.seed import seed_drug_labels
        await seed_drug_labels(col)
    print(f"✅ ChromaDB ready ({col.count()} drug label chunks)")

    print("🚀 MedForensics ready")
    yield

    # Shutdown
    await engine.dispose()
    print("MedForensics shut down.")


app = FastAPI(
    title="MedForensics",
    description="Clinical AI Hallucination Forensics Middleware",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
