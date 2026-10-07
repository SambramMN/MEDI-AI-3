"""
MedSafe AI — Pydantic Schemas for AI Assistant
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class AssistantRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)
    medicine_context: Optional[List[str]] = Field(
        None, description="Medicine names to provide context for the question"
    )


class SourceReference(BaseModel):
    title: str
    url: Optional[str] = None
    source_type: str  # database | openfda | rxnorm | pubmed | general


class AssistantResponse(BaseModel):
    query_id: str
    answer: str
    important_information: Optional[str] = None
    safety_considerations: Optional[str] = None
    sources: List[SourceReference] = []
    disclaimer: Optional[str] = None
    was_refused: bool = False
    refusal_reason: Optional[str] = None
    created_at: datetime
