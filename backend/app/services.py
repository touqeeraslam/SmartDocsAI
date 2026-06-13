"""Shared services: PDF extraction, chunking, embeddings, vector store.

Centralising these means the Azure client and the Chroma collection are
configured in exactly one place (previously each route re-declared them with
slightly different settings).
"""
import os
from typing import List, Optional

import chromadb
import pdfplumber
from openai import AsyncAzureOpenAI

from app.config import get_settings
from app.schemas.chunk import DocumentChunk

settings = get_settings()

# Make sure storage dirs exist before Chroma tries to use them.
os.makedirs(settings.docs_dir, exist_ok=True)
os.makedirs(settings.vector_dir, exist_ok=True)

# ----- Vector store (single source of truth) -----
_chroma_client = chromadb.PersistentClient(path=settings.vector_dir)
collection = _chroma_client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"},
)

# ----- Azure OpenAI client (lazy so the app can boot without keys) -----
_openai_client: Optional[AsyncAzureOpenAI] = None


def get_openai() -> AsyncAzureOpenAI:
    global _openai_client
    if not settings.is_llm_configured:
        raise RuntimeError(
            "Azure OpenAI is not configured. Set AZURE_OPENAI_ENDPOINT and "
            "AZURE_OPENAI_KEY environment variables."
        )
    if _openai_client is None:
        _openai_client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_key,
            azure_endpoint=settings.azure_openai_endpoint,
            api_version=settings.azure_openai_api_version,
        )
    return _openai_client


# ----- Chunking -----
def count_tokens(text: str) -> int:
    """Cheap whitespace token estimate (good enough for chunk sizing)."""
    return len(text.split())


def chunk_text(text: str, max_tokens: int, overlap: int = 0) -> List[str]:
    """Split text into ~max_tokens word windows with a sliding overlap so that
    context isn't lost at chunk boundaries."""
    words = text.split()
    if not words:
        return []

    chunks: List[str] = []
    step = max(1, max_tokens - overlap)
    start = 0
    while start < len(words):
        piece = words[start : start + max_tokens]
        chunks.append(" ".join(piece))
        if start + max_tokens >= len(words):
            break
        start += step
    return chunks


def extract_pages(file_path: str) -> List[tuple[int, str]]:
    """Return [(page_number, text), ...] for non-empty pages."""
    pages: List[tuple[int, str]] = []
    with pdfplumber.open(file_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if text and text.strip():
                pages.append((i, text))
    return pages


def build_chunks(document_id: str, title: str, file_path: str) -> List[DocumentChunk]:
    chunks: List[DocumentChunk] = []
    for page_number, text in extract_pages(file_path):
        for idx, piece in enumerate(
            chunk_text(text, settings.max_tokens_per_chunk, settings.chunk_overlap)
        ):
            chunks.append(
                DocumentChunk(
                    document_id=document_id,
                    title=title,
                    page_number=page_number,
                    chunk_index=idx,
                    text=piece,
                )
            )
    return chunks


# ----- Embeddings -----
async def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    client = get_openai()
    response = await client.embeddings.create(
        model=settings.azure_embedding_deployment,
        input=texts,
    )
    return [item.embedding for item in response.data]


async def embed_query(text: str) -> List[float]:
    return (await embed_texts([text]))[0]


async def store_chunks(chunks: List[DocumentChunk]) -> int:
    """Embed and persist a list of chunks into Chroma. Returns count stored."""
    if not chunks:
        return 0

    texts = [c.text for c in chunks]
    ids = [f"{c.document_id}_{c.page_number}_{c.chunk_index}" for c in chunks]
    metadatas = [
        {
            "document_id": c.document_id,
            "title": c.title,
            "page_number": c.page_number,
            "chunk_index": c.chunk_index,
        }
        for c in chunks
    ]
    embeddings = await embed_texts(texts)
    collection.add(documents=texts, metadatas=metadatas, ids=ids, embeddings=embeddings)
    return len(chunks)


# ----- High level pipeline -----
async def ingest_pdf(document_id: str, title: str, file_path: str) -> dict:
    """Full pipeline for a single PDF: extract -> chunk -> embed -> store."""
    chunks = build_chunks(document_id, title, file_path)
    if not chunks:
        return {"document_id": document_id, "title": title, "pages": 0, "chunks": 0}
    stored = await store_chunks(chunks)
    pages = len({c.page_number for c in chunks})
    return {
        "document_id": document_id,
        "title": title,
        "pages": pages,
        "chunks": stored,
    }


# ----- Document listing / deletion (derived from vector metadata) -----
def list_documents() -> List[dict]:
    """Aggregate stored chunks into one row per document."""
    data = collection.get(include=["metadatas"])
    metadatas = data.get("metadatas") or []

    docs: dict[str, dict] = {}
    for meta in metadatas:
        doc_id = meta.get("document_id")
        if not doc_id:
            continue
        entry = docs.setdefault(
            doc_id,
            {"document_id": doc_id, "title": meta.get("title"), "chunks": 0, "pages": set()},
        )
        entry["chunks"] += 1
        entry["pages"].add(meta.get("page_number"))

    result = []
    for entry in docs.values():
        result.append(
            {
                "document_id": entry["document_id"],
                "title": entry["title"],
                "chunks": entry["chunks"],
                "pages": len(entry["pages"]),
            }
        )
    result.sort(key=lambda d: (d["title"] or "").lower())
    return result


def delete_document(document_id: str) -> None:
    collection.delete(where={"document_id": document_id})
    pdf_path = os.path.join(settings.docs_dir, f"{document_id}.pdf")
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
