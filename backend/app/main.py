import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes import admin, ingestion, embedding, query
from app.seed import seed_demo_document

logger = logging.getLogger("uvicorn.error")
settings = get_settings()

app = FastAPI(title="AI Document Q&A API")

# CORS: credentials cannot be combined with the "*" wildcard per the spec, so
# only enable credentials when explicit origins are configured.
allow_origins = settings.cors_origin_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router)
app.include_router(ingestion.router)
app.include_router(embedding.router)
app.include_router(query.router)


@app.on_event("startup")
async def startup() -> None:
    if not settings.is_llm_configured:
        logger.warning("Azure OpenAI is not configured — ingest/query will return 503.")
    if not settings.admin_token:
        logger.warning("ADMIN_TOKEN is not set — admin endpoints will return 503.")
    try:
        result = await seed_demo_document()
        if result.get("seeded"):
            logger.info("Seeded demo document: %s", result)
    except Exception as e:  # never block startup on seeding
        logger.warning("Demo seeding skipped: %s", e)


@app.get("/")
def root():
    return {"message": "AI Document Q&A API running"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_configured": settings.is_llm_configured,
        "admin_configured": bool(settings.admin_token),
    }
