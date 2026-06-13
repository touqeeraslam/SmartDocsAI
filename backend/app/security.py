"""Admin authentication.

A single shared admin token (set via the ADMIN_TOKEN env var) gates every
write/admin endpoint. The frontend sends it in the `X-Admin-Token` header.
This is intentionally simple — enough to stop random visitors to a public
portfolio demo from uploading files or burning LLM credits.
"""
from fastapi import Header, HTTPException

from app.config import get_settings


async def require_admin(x_admin_token: str | None = Header(default=None)) -> bool:
    settings = get_settings()
    if not settings.admin_token:
        raise HTTPException(
            status_code=503,
            detail="Admin access is not configured on the server (ADMIN_TOKEN missing).",
        )
    if not x_admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(status_code=401, detail="Invalid or missing admin token.")
    return True
