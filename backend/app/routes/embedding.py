"""Legacy step 3 of the manual pipeline: embed a list of chunks. Kept for
completeness; the admin UI now uses /admin/ingest which does this internally.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.schemas.chunk import DocumentChunk
from app.security import require_admin
from app import services

router = APIRouter()


@router.post("/admin/embed-chunks/")
async def embed_chunks(
    chunks: List[DocumentChunk],
    _: bool = Depends(require_admin),
):
    if not chunks:
        return {"message": "No chunks provided", "count": 0}
    try:
        count = await services.store_chunks(chunks)
        return {"message": "Chunks embedded and stored successfully", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to embed chunks: {str(e)}")
