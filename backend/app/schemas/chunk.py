from pydantic import BaseModel

class DocumentChunk(BaseModel):
    document_id: str
    title: str
    page_number: int
    chunk_index: int
    text: str