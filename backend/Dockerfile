FROM python:3.11-slim

# System deps for pdfplumber/pillow and friends
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY app ./app

# Storage lives on the (ephemeral) container filesystem
ENV STORAGE_DIR=/app/storage
RUN mkdir -p /app/storage/docs /app/storage/vector_db

EXPOSE 8000

# Render/most PaaS inject $PORT; default to 8000 locally.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
