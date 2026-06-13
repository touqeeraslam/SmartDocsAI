from pydantic import BaseModel
from typing import Optional, Dict


class DocumentMetadata(BaseModel):
    title: str
    metadata: Optional[Dict] = None