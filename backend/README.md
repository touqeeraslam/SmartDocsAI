---
title: SmartDocsAI API
emoji: 📄
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# SmartDocsAI — Backend API

FastAPI + ChromaDB RAG backend for [SmartDocsAI](https://github.com/touqeeraslam/SmartDocsAI).
This Space runs the Docker image defined by `Dockerfile`.

## Configuration

Set these as **Space secrets** (Settings → Variables and secrets), never in code:

| Secret | Purpose |
|---|---|
| `AZURE_OPENAI_ENDPOINT` | `https://<your-resource>.openai.azure.com/` |
| `AZURE_OPENAI_KEY` | Azure OpenAI key (rotated) |
| `ADMIN_TOKEN` | Password for the admin panel |
| `CORS_ORIGINS` | Your Vercel URL, e.g. `https://smart-docs-ai.vercel.app` |

Optional: `AZURE_EMBEDDING_DEPLOYMENT`, `AZURE_CHAT_DEPLOYMENT`, `SEED_DEMO`.

Health check: `GET /health`.

> Free Spaces use ephemeral storage — the demo document re-seeds on each start,
> but admin-uploaded PDFs do not persist across restarts.
