"""Central application settings, all sourced from environment variables.

No secrets live in code anymore. Locally these come from backend/.env
(loaded via python-dotenv); in production they are set in the host dashboard
(e.g. Render → Environment).
"""
import os
from functools import lru_cache

from dotenv import load_dotenv

# Load backend/.env if present (no-op in production where real env vars are set).
load_dotenv()


class Settings:
    def __init__(self) -> None:
        # ---- Azure OpenAI ----
        self.azure_openai_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
        self.azure_openai_key = os.getenv("AZURE_OPENAI_KEY", "").strip()
        self.azure_openai_api_version = os.getenv(
            "AZURE_OPENAI_API_VERSION", "2024-02-15-preview"
        ).strip()
        self.azure_embedding_deployment = os.getenv(
            "AZURE_EMBEDDING_DEPLOYMENT", "embeddings"
        ).strip()
        self.azure_chat_deployment = os.getenv(
            "AZURE_CHAT_DEPLOYMENT", "chat-gpt40"
        ).strip()

        # ---- Admin auth (shared password/token for the admin panel) ----
        self.admin_token = os.getenv("ADMIN_TOKEN", "").strip()

        # ---- Storage ----
        self.storage_dir = os.getenv("STORAGE_DIR", "storage").strip()

        # ---- Retrieval / chunking ----
        self.max_tokens_per_chunk = int(os.getenv("MAX_TOKENS_PER_CHUNK", "800"))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", "100"))
        self.top_k = int(os.getenv("TOP_K", "5"))
        self.max_file_size = int(os.getenv("MAX_FILE_SIZE", str(20 * 1024 * 1024)))

        # ---- CORS (comma separated, or "*") ----
        self.cors_origins = os.getenv("CORS_ORIGINS", "*").strip()

        # ---- Demo seeding ----
        self.seed_demo = os.getenv("SEED_DEMO", "true").strip().lower() == "true"

    @property
    def docs_dir(self) -> str:
        return os.path.join(self.storage_dir, "docs")

    @property
    def vector_dir(self) -> str:
        return os.path.join(self.storage_dir, "vector_db")

    @property
    def is_llm_configured(self) -> bool:
        return bool(self.azure_openai_endpoint and self.azure_openai_key)

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
