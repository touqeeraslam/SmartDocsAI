"""Admin routes: upload, one-click ingest, list and delete documents.

All routes here require the admin token except the public document listing
used by the chat UI to show what's available.
"""
import json
import os
import shutil
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import get_settings
from app.security import require_admin
from app import services

router = APIRouter()
settings = get_settings()


def _validate_pdf(file: UploadFile) -> int:
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file.file.seek(0, 2)  # move cursor to end
    file_size = file.file.tell()
    file.file.seek(0)  # reset cursor
    if file_size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {settings.max_file_size // (1024 * 1024)}MB limit",
        )
    return file_size


def _save_pdf(file: UploadFile, document_id: str) -> str:
    file_path = os.path.join(settings.docs_dir, f"{document_id}.pdf")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path


@router.post("/admin/verify")
async def verify_admin(_: bool = Depends(require_admin)):
    """Lightweight endpoint the frontend calls to validate an admin token."""
    return {"ok": True}


@router.post("/admin/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    metadata: str | None = Form(None),
    _: bool = Depends(require_admin),
):
    file_size = _validate_pdf(file)

    metadata_json = None
    if metadata:
        try:
            metadata_json = json.loads(metadata)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid metadata JSON format")

    document_id = str(uuid4())
    file_path = os.path.join(settings.docs_dir, f"{document_id}.pdf")
    try:
        _save_pdf(file, document_id)
        return {
            "document_id": document_id,
            "title": title,
            "metadata": metadata_json,
            "file_path": file_path,
            "file_size": file_size,
            "message": "Document uploaded successfully",
        }
    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to upload document")


@router.post("/admin/ingest")
async def ingest_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    _: bool = Depends(require_admin),
):
    """One-click pipeline: upload -> extract -> chunk -> embed -> store."""
    if not settings.is_llm_configured:
        raise HTTPException(
            status_code=503,
            detail="LLM not configured on the server. Set Azure OpenAI env vars.",
        )

    _validate_pdf(file)
    document_id = str(uuid4())
    file_path = os.path.join(settings.docs_dir, f"{document_id}.pdf")
    try:
        _save_pdf(file, document_id)
        result = await services.ingest_pdf(document_id, title, file_path)
        if result["chunks"] == 0:
            # Nothing extractable (e.g. scanned image PDF) — clean up.
            services.delete_document(document_id)
            raise HTTPException(
                status_code=422,
                detail="No extractable text found in this PDF (is it a scanned image?).",
            )
        result["message"] = "Document ingested successfully"
        return result
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {e}")


@router.get("/documents")
async def public_list_documents():
    """Public listing so the chat UI can show what's available."""
    return {"documents": services.list_documents()}


@router.get("/admin/documents")
async def admin_list_documents(_: bool = Depends(require_admin)):
    return {"documents": services.list_documents()}


@router.delete("/admin/documents/{document_id}")
async def remove_document(document_id: str, _: bool = Depends(require_admin)):
    services.delete_document(document_id)
    return {"message": "Document deleted", "document_id": document_id}
