FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for chromadb (hnswlib)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render free tier uses $PORT environment variable
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}