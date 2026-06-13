# Deploying SmartDocsAI

Backend (FastAPI + ChromaDB) → **Render** · Frontend (Next.js) → **Vercel**.

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

## 2. Deploy the backend on Render

1. Go to https://dashboard.render.com → **New** → **Blueprint**.
2. Connect your GitHub and pick the **SmartDocsAI** repo. Render reads
   [`render.yaml`](./render.yaml) and proposes the `smartdocsai-api` service.
3. Click **Apply**. When prompted, fill in the secret env vars:
   | Variable | Value |
   |---|---|
   | `AZURE_OPENAI_ENDPOINT` | `https://<your-resource>.openai.azure.com/` |
   | `AZURE_OPENAI_KEY` | the **new** key from step 0 |
   | `ADMIN_TOKEN` | a long random string (this is your admin panel password) |
   | `CORS_ORIGINS` | leave as `*` for now; tighten in step 4 |
4. Wait for the build. When live you'll get a URL like
   `https://smartdocsai-api.onrender.com`. Open `/health` — it should return
   `{"status":"ok","llm_configured":true,"admin_configured":true}`.

> **Free tier note:** the instance sleeps after inactivity and its disk is wiped
> on cold start. The demo document re-seeds automatically, but admin-uploaded
> PDFs do **not** survive a restart. For persistent uploads, upgrade the plan and
> add a Render Disk mounted at `/app/storage`, or switch the host to Fly.io.

---

## 3. Deploy the frontend on Vercel

1. Go to https://vercel.com → **Add New… → Project** → import **SmartDocsAI**.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Next.js.
3. Add an environment variable:
   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE` | your Render URL, e.g. `https://smartdocsai-api.onrender.com` |
4. **Deploy.** You'll get a URL like `https://smart-docs-ai.vercel.app`.

---

## 4. Lock CORS to your frontend

1. Back in Render → `smartdocsai-api` → **Environment**, set:
   ```
   CORS_ORIGINS=https://smart-docs-ai.vercel.app
   ```
   (use your real Vercel domain). Save → the service redeploys.
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
