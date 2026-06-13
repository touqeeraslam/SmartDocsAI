"""Public RAG query endpoint: embed the question, retrieve top-k chunks from
Chroma, and ask the chat model to answer using only that context.
"""
from pydantic import BaseModel

from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app import services

router = APIRouter()
settings = get_settings()

SYSTEM_PROMPT = (
    "You are a helpful assistant for answering questions about a set of "
    "documents. Use ONLY the provided context to answer. If the answer is not "
    "present in the context, say you don't know based on the available documents."
)


class QueryRequest(BaseModel):
    question: str


@router.post("/query-document/")
@router.post("/query-document")
async def query_document(payload: QueryRequest):
    if not settings.is_llm_configured:
        raise HTTPException(
            status_code=503,
            detail="LLM not configured on the server.",
        )

    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question must not be empty.")

    try:
        question_embedding = await services.embed_query(question)

        results = services.collection.query(
            query_embeddings=[question_embedding],
            n_results=settings.top_k,
            include=["documents", "metadatas", "distances"],
        )

        if not results.get("documents") or not results["documents"][0]:
            return {
                "answer": "I couldn't find any relevant information in the documents.",
                "sources": [],
            }

        chunks = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        context_parts = []
        for text, meta in zip(chunks, metadatas):
            source_info = (
                f"Source: {meta.get('title', 'Unknown')} "
                f"(Page {meta.get('page_number', 'N/A')})"
            )
            context_parts.append(f"[{source_info}]\n{text}")
        context_text = "\n\n---\n\n".join(context_parts)

        user_prompt = f"Context:\n{context_text}\n\nQuestion: {question}"

        client = services.get_openai()
        response = await client.chat.completions.create(
            model=settings.azure_chat_deployment,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0,
        )
        answer_text = response.choices[0].message.content.strip()

        sources = [
            {
                "title": m.get("title"),
                "page": m.get("page_number"),
                "score": round(float(distances[i]), 4),
            }
            for i, m in enumerate(metadatas)
        ]
        return {"answer": answer_text, "sources": sources}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
