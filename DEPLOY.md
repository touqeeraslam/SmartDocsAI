# Deploying SmartDocsAI

Backend (FastAPI + ChromaDB) → **Hugging Face Spaces** (free, no card) ·
Frontend (Next.js) → **Vercel**.

> A `render.yaml` is also included if you ever want to deploy the backend on
> Render instead (Render requires a card to verify the account, even on free).

---

## 0. Rotate the Azure key first (important)

The original Azure OpenAI key was committed to the old local git history, so it
must be considered compromised.

1. Azure Portal → your OpenAI resource → **Keys and Endpoint** → **Regenerate Key 1**.
2. Copy the **new** key. You'll paste it into Render in step 2 — never into the code.

---

## 1. Push the code to GitHub

The repo https://github.com/touqeeraslam/SmartDocsAI already exists (empty).
From the project root:

```bash
git remote add origin https://github.com/touqeeraslam/SmartDocsAI.git
git push -u origin main
```

(The working tree no longer tracks `venv/`, `node_modules/`, `.next/`, or
`storage/` — those are gitignored — and the history was reset to a single clean
commit with no secrets.)

---

## 2. Deploy the backend on Hugging Face Spaces

The backend lives in the [`backend/`](./backend) folder. A Space is its own git
repo, so we create a Space and push the **contents of `backend/`** to it (the
`Dockerfile` + `README.md` header tell HF to build the Docker image).

1. Create a free account at https://huggingface.co (no card required).
2. **New → Space.** Name it e.g. `smartdocsai-api`, **SDK: Docker**,
   visibility **Public**, hardware **CPU basic (free)**. Create.
3. Add your secrets: Space → **Settings → Variables and secrets → New secret**:
   | Secret | Value |
   |---|---|
   | `AZURE_OPENAI_ENDPOINT` | `https://<your-resource>.openai.azure.com/` |
   | `AZURE_OPENAI_KEY` | the **new** key from step 0 |
   | `ADMIN_TOKEN` | a long random string (your admin-panel password) |
   | `CORS_ORIGINS` | leave as `*` for now; tighten in step 4 |
4. Push the backend to the Space. Create a [write token](https://huggingface.co/settings/tokens),
   then from the project root:
   ```bash
   cd backend
   git init -b main
   git add -A
   git commit -m "SmartDocsAI backend"
   git remote add space https://<HF_USERNAME>:<HF_TOKEN>@huggingface.co/spaces/<HF_USERNAME>/smartdocsai-api
   git push space main
   ```
   (Or use the Space's web UI to upload the `backend/` files.)
5. The Space builds the Docker image automatically. When the status is
   **Running**, your API is at `https://<HF_USERNAME>-smartdocsai-api.hf.space`.
   Open `/health` — it should return
   `{"status":"ok","llm_configured":true,"admin_configured":true}`.

> **Free Space note:** storage is ephemeral and the Space sleeps after
> inactivity. The demo document re-seeds automatically on each start, but
> admin-uploaded PDFs do **not** survive a restart. For persistence, add HF
> persistent storage (paid) or deploy on a host with a volume (e.g. Fly.io).

---

## 3. Deploy the frontend on Vercel

1. Go to https://vercel.com → **Add New… → Project** → import **SmartDocsAI**.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Next.js.
3. Add an environment variable:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE` | your Space URL, e.g. `https://<HF_USERNAME>-smartdocsai-api.hf.space` |
4. **Deploy.** You'll get a URL like `https://smart-docs-ai.vercel.app`.

---

## 4. Lock CORS to your frontend

1. Back in the Space → **Settings → Variables and secrets**, edit `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://smart-docs-ai.vercel.app
   ```
   (use your real Vercel domain). Save → the Space restarts.
2. Reload the Vercel site. The chat should answer questions, and `/admin`
   should unlock with your `ADMIN_TOKEN`.

---

## Local development

```bash
# Backend
cd backend
cp .env.example .env          # fill in Azure creds + ADMIN_TOKEN
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_BASE=http://localhost:8000
npm install
npm run dev
```
