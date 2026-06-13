"""Legacy step 2 of the manual pipeline: process an already-uploaded PDF into
chunks. Kept for completeness / debugging; the admin UI now uses /admin/ingest.
"""
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.config import get_settings
from app.schemas.chunk import DocumentChunk
from app.security import require_admin
from app import services

router = APIRouter()
settings = get_settings()


@router.post("/admin/process-document/{document_id}", response_model=List[DocumentChunk])
async def process_document(
    document_id: str,
    title: str,
    _: bool = Depends(require_admin),
):
    file_path = os.path.join(settings.docs_dir, f"{document_id}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF not found")

    try:
        return services.build_chunks(document_id, title, file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process document: {str(e)}"
        )
