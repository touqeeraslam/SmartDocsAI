"""Seed a demo document on startup so the public demo always has something to
query, even on free hosting tiers where storage is wiped on each cold start.

The sample text is embedded here (no external file / no reportlab needed).
Seeding is idempotent and only runs when the collection is empty.
"""
from app.config import get_settings
from app.schemas.chunk import DocumentChunk
from app import services

settings = get_settings()

DEMO_DOC_ID = "demo-novatech-handbook"
DEMO_TITLE = "NovaTech Employee Handbook (Demo)"

# A few self-contained "pages" of fictional company content to make the demo
# feel real and give the model concrete, citable facts to retrieve.
DEMO_PAGES: list[str] = [
    # Page 1
    "NovaTech Solutions Employee Handbook. NovaTech Solutions is a fictional "
    "software company founded in 2018 and headquartered in Austin, Texas. The "
    "company builds developer tools and cloud infrastructure products. NovaTech "
    "has 240 employees across three offices: Austin, Berlin, and Singapore. Our "
    "mission is to make building software faster, safer, and more enjoyable for "
    "engineering teams everywhere.",
    # Page 2
    "Working Hours and Remote Work. NovaTech operates on a flexible schedule. "
    "Core collaboration hours are 10:00 AM to 4:00 PM in each employee's local "
    "time zone. Employees may work remotely up to four days per week, and fully "
    "remote arrangements are available with manager approval. The standard work "
    "week is 40 hours.",
    # Page 3
    "Paid Time Off. Full-time employees receive 25 days of paid vacation per "
    "year, in addition to local public holidays. Unused vacation of up to 5 days "
    "may be carried over into the next calendar year. NovaTech also offers 10 "
    "paid sick days annually and 16 weeks of paid parental leave for all new "
    "parents regardless of gender.",
    # Page 4
    "Equipment and Expenses. Every new engineer receives a laptop of their "
    "choice (MacBook Pro or a Linux ThinkPad) and a 200 US dollar home-office "
    "stipend. NovaTech reimburses internet costs up to 50 US dollars per month "
    "for remote employees. Work-related travel and conference tickets are "
    "covered with prior manager approval.",
    # Page 5
    "Security Policy. All employees must use the company password manager and "
    "enable multi-factor authentication on every work account. Source code may "
    "only be stored in NovaTech's approved Git hosting. Customer data must never "
    "be copied to personal devices. Suspected security incidents must be "
    "reported to security@novatech.example within one hour of discovery.",
]


async def seed_demo_document() -> dict:
    """Insert the demo document if the collection has no data yet."""
    if not settings.seed_demo or not settings.is_llm_configured:
        return {"seeded": False, "reason": "disabled or LLM not configured"}

    try:
        existing = services.collection.count()
    except Exception:
        existing = 0
    if existing > 0:
        return {"seeded": False, "reason": "collection not empty"}

    chunks: list[DocumentChunk] = []
    for page_number, text in enumerate(DEMO_PAGES, start=1):
        for idx, piece in enumerate(
            services.chunk_text(
                text, settings.max_tokens_per_chunk, settings.chunk_overlap
            )
        ):
            chunks.append(
                DocumentChunk(
                    document_id=DEMO_DOC_ID,
                    title=DEMO_TITLE,
                    page_number=page_number,
                    chunk_index=idx,
                    text=piece,
                )
            )

    stored = await services.store_chunks(chunks)
    return {"seeded": True, "chunks": stored, "title": DEMO_TITLE}
