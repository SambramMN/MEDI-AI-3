"""
MedSafe AI — AI Assistant API Router
POST /api/assistant/ask
GET  /api/assistant/history
"""

from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai.assistant import AssistantService
from app.database import get_db
from app.models.models import User
from app.schemas.assistant import AssistantRequest, AssistantResponse
from app.utils.dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/api/assistant", tags=["AI Assistant"])


@router.post(
    "/ask",
    response_model=AssistantResponse,
    summary="Ask the MedSafe AI assistant a medicine-related question",
)
async def ask_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Ask a medicine-related question.

    The assistant uses a RAG (Retrieval-Augmented Generation) architecture:
    1. Your question is classified for safety
    2. Relevant information is retrieved from the medical knowledge base
    3. An LLM synthesises an answer based on retrieved facts
    4. The response is safety-validated

    **The assistant will refuse requests to:**
    - Prescribe medicines
    - Diagnose conditions
    - Recommend personalised dosages
    - Advise stopping prescription medication

    Always consult a healthcare professional for personalised medical advice.
    """
    user_id = current_user.id if current_user else None
    service = AssistantService(db)
    return await service.answer(user_id, request)


@router.get(
    "/history",
    summary="Get AI query history for the authenticated user",
)
def get_query_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the user's recent AI assistant queries (most recent first)."""
    from app.models.models import AIQuery

    queries = (
        db.query(AIQuery)
        .filter(AIQuery.user_id == current_user.id)
        .order_by(AIQuery.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": q.id,
            "question": q.question,
            "query_type": q.query_type,
            "was_refused": q.was_refused,
            "created_at": q.created_at.isoformat(),
        }
        for q in queries
    ]
