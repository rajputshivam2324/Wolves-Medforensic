from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    NEONDB_URL: str = ""
    CHROMA_PERSIST_DIR: str = ".chroma"
    CHROMA_COLLECTION: str = "drug_labels"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
