"""
MedSafe AI — FastAPI Application Entry Point
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api import auth, medicines, medications, interactions, scanner, assistant, analytics, users
from app.config import get_settings
from app.utils.logging import setup_logging, get_logger

# Setup structured logging first
setup_logging()
logger = get_logger(__name__)
settings = get_settings()

# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MedSafe AI",
    description="""
## MedSafe AI — Intelligent Medication Safety & Drug Interaction Analytics Platform

### What this API does
- 🔐 User authentication with JWT
- 💊 Medicine search and information (verified sources only)
- 📋 Personal medication list management
- ⚠️ Drug interaction checking
- 🔄 Duplicate active ingredient detection
- 📷 OCR-based medicine scanning
- 🤖 RAG-powered AI assistant (with medical safety guardrails)
- 📊 Analytics data for Tableau dashboards

### Medical Safety Notice
This system provides **educational information only**.
It does **not** diagnose, prescribe, or provide personalised medical advice.
Always consult a qualified healthcare professional.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global exception handler — consistent error format
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", path=str(request.url), error=str(exc), exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again.",
            },
        },
    )

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(medicines.router)
app.include_router(medications.router)
app.include_router(interactions.router)
app.include_router(scanner.router)
app.include_router(assistant.router)
app.include_router(analytics.router)
app.include_router(users.router)

# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"], summary="Health check endpoint")
def health_check():
    """Returns service health status."""
    return {"status": "ok", "service": settings.app_name, "version": "1.0.0"}


# ---------------------------------------------------------------------------
# Startup / shutdown events
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    import os
    os.makedirs(settings.upload_dir, exist_ok=True)
    logger.info("medsafe_ai_started", env=settings.app_env)


@app.on_event("shutdown")
async def on_shutdown():
    logger.info("medsafe_ai_stopping")
