FROM python:3.11-slim

# System deps for pdfplumber/pillow and friends
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Run as a non-root user (recommended by Hugging Face Spaces)
RUN useradd -m -u 1000 user

WORKDIR /app

# Install Python deps first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY --chown=user app ./app

# Storage lives on the (ephemeral) container filesystem, owned by the runtime user
ENV STORAGE_DIR=/app/storage
RUN mkdir -p /app/storage/docs /app/storage/vector_db && chown -R user /app/storage

USER user

# Hugging Face Spaces require port 7860. Render/other PaaS inject $PORT instead.
EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
