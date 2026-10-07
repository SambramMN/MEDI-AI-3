# ---------------------------------------------------------------------------
# MedSafe AI — Dockerfile
# Multi-stage build: slim production image
# ---------------------------------------------------------------------------

FROM python:3.11-slim AS base

# Install system dependencies for Tesseract, psycopg2, and OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------------------------------------
# Builder stage: install Python dependencies
# ---------------------------------------------------------------------------
FROM base AS builder

WORKDIR /install
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------------------------------------------------------------------------
# Final stage
# ---------------------------------------------------------------------------
FROM base AS final

WORKDIR /app

# Copy installed packages
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Create data directories
RUN mkdir -p /app/data/uploads /app/data/chroma

# Non-root user for security
RUN addgroup --system medsafe && adduser --system --ingroup medsafe medsafe
RUN chown -R medsafe:medsafe /app
USER medsafe

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health').raise_for_status()"

EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
