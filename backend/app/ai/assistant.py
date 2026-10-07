"""
MedSafe AI — RAG Assistant Service

Architecture:
  User question
    → Guardrail classification
    → Medicine/entity extraction
    → Knowledge retrieval (ChromaDB)
    → LLM (OpenAI / other)
    → Safety validation of response
    → Structured response

The LLM is NOT the medical authority — it only synthesises retrieved facts.
"""

import re
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.ai.guardrails import classify_query, QueryType
from app.ai.knowledge_base import knowledge_base
from app.config import get_settings
from app.models.models import AIQuery, Medicine
from app.schemas.assistant import AssistantRequest, AssistantResponse, SourceReference
from app.utils.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)

# System prompt enforcing the non-prescriptive role
SYSTEM_PROMPT = """You are MedSafe AI, an intelligent medication safety and education assistant.

Your role is to provide:
- Evidence-based, factual information about medicines
- Drug interaction education (not personal advice)
- General safety information from verified sources
- Information retrieved from a trusted medical knowledge base

You MUST NOT:
- Diagnose any medical condition
- Prescribe medicines or recommend specific treatments
- Suggest personalised dosages
- Tell users to stop or change prescription medicines
- Make unsupported medical claims
- Invent interactions or side effects

Always recommend consulting a qualified healthcare professional (doctor or pharmacist)
for personalised medical advice.

Answer based ONLY on the context provided below. If the context is insufficient, say so honestly.
Do not fabricate information.
"""


class AssistantService:

    def __init__(self, db: Session):
        self.db = db

    async def answer(self, user_id: Optional[str], request: AssistantRequest) -> AssistantResponse:
        """
        Process a user question through the full RAG pipeline.
        """
        question = request.question.strip()

        # Step 1: Guardrail classification
        query_type, should_refuse, refusal_message = classify_query(question)

        if should_refuse:
            query_record = self._persist_query(
                user_id=user_id,
                question=question,
                response=refusal_message,
                query_type=query_type.value,
                was_refused=True,
            )
            return AssistantResponse(
                query_id=query_record.id,
                answer=refusal_message,
                was_refused=True,
                refusal_reason=query_type.value,
                sources=[],
                created_at=query_record.created_at,
            )

        # Step 2: Extract medicine context
        medicine_context = self._extract_medicines(question, request.medicine_context)

        # Step 3: Retrieve relevant documents
        retrieval_query = question
        if medicine_context:
            retrieval_query = f"{question} {' '.join(medicine_context)}"

        retrieved_docs = knowledge_base.retrieve(retrieval_query, n_results=5)

        # Step 4: Build context for LLM
        context_text = self._build_context(retrieved_docs, medicine_context)

        # Step 5: Call LLM
        answer_text, important_info, safety_considerations = await self._call_llm(
            question=question,
            context=context_text,
            query_type=query_type,
        )

        # Step 6: Build source references
        sources = self._build_sources(retrieved_docs)

        # Persist
        query_record = self._persist_query(
            user_id=user_id,
            question=question,
            response=answer_text,
            source_references=[s.model_dump() for s in sources],
            query_type=query_type.value,
            was_refused=False,
        )

        return AssistantResponse(
            query_id=query_record.id,
            answer=answer_text,
            important_information=important_info,
            safety_considerations=safety_considerations,
            sources=sources,
            disclaimer=(
                "This information is for general educational purposes only and does not constitute "
                "medical advice. Always consult a qualified healthcare professional."
            ) if query_type != QueryType.GENERAL_EDUCATION else None,
            was_refused=False,
            created_at=query_record.created_at,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _extract_medicines(
        self, question: str, extra_context: Optional[List[str]]
    ) -> List[str]:
        """Find medicine names mentioned in the question (DB lookup)."""
        mentions = []
        if extra_context:
            mentions.extend(extra_context)

        # Simple word-based lookup against DB medicine names
        words = re.findall(r"[A-Za-z][A-Za-z0-9\-]{2,}", question)
        for word in words:
            med = (
                self.db.query(Medicine)
                .filter(
                    (Medicine.brand_name.ilike(word)) | (Medicine.generic_name.ilike(word))
                )
                .first()
            )
            if med:
                name = med.brand_name or med.generic_name
                if name not in mentions:
                    mentions.append(name)
        return mentions

    @staticmethod
    def _build_context(docs: List[dict], medicines: List[str]) -> str:
        parts = []
        if medicines:
            parts.append(f"Medicines mentioned: {', '.join(medicines)}")
        for doc in docs:
            meta = doc.get("metadata", {})
            source = meta.get("source", "Medical knowledge base")
            parts.append(f"[Source: {source}]\n{doc['text']}")
        return "\n\n".join(parts) if parts else "No specific context available."

    async def _call_llm(
        self, question: str, context: str, query_type: QueryType
    ) -> tuple[str, Optional[str], Optional[str]]:
        """
        Call the configured LLM provider.
        Returns (answer, important_information, safety_considerations).
        Falls back gracefully if LLM is unavailable.
        """
        if not settings.llm_api_key:
            return (
                "The AI assistant is not configured. Please set LLM_API_KEY in the environment.",
                None,
                None,
            )

        prompt = f"""Context from medical knowledge base:
{context}

User question: {question}

Please provide a helpful, evidence-based answer structured as:

ANSWER:
[Your main answer here]

IMPORTANT INFORMATION:
[Key facts about the medicine(s) involved]

SAFETY CONSIDERATIONS:
[Any relevant safety notes, potential interactions, or warnings from the context]

Base your answer strictly on the provided context. If the context is insufficient, say so."""

        try:
            if settings.llm_provider == "openai":
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=settings.llm_api_key)
                response = await client.chat.completions.create(
                    model=settings.llm_model,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=settings.llm_temperature,
                    max_tokens=settings.llm_max_tokens,
                )
                raw = response.choices[0].message.content or ""
                return self._parse_llm_response(raw)

        except Exception as exc:
            logger.error("llm_call_failed", error=str(exc))
            return (
                "I'm sorry, the AI assistant is temporarily unavailable. "
                "Please try again later or consult a healthcare professional.",
                None,
                None,
            )

        return "Unable to generate a response.", None, None

    @staticmethod
    def _parse_llm_response(raw: str) -> tuple[str, Optional[str], Optional[str]]:
        """Parse structured LLM output into sections."""
        sections = {"answer": "", "important information": None, "safety considerations": None}
        current = "answer"
        lines_by_section: dict = {k: [] for k in sections}

        for line in raw.split("\n"):
            stripped = line.strip()
            lower = stripped.lower().rstrip(":")
            if lower in sections:
                current = lower
            else:
                lines_by_section[current].append(stripped)

        answer = " ".join(lines_by_section["answer"]).strip() or raw.strip()
        important = " ".join(lines_by_section.get("important information", [])).strip() or None
        safety = " ".join(lines_by_section.get("safety considerations", [])).strip() or None

        return answer, important, safety

    @staticmethod
    def _build_sources(docs: List[dict]) -> List[SourceReference]:
        seen = set()
        sources = []
        for doc in docs:
            meta = doc.get("metadata", {})
            source = meta.get("source", "Medical Knowledge Base")
            url = meta.get("url")
            if source not in seen:
                seen.add(source)
                sources.append(
                    SourceReference(
                        title=source,
                        url=url,
                        source_type=meta.get("type", "general"),
                    )
                )
        return sources

    def _persist_query(
        self,
        user_id: Optional[str],
        question: str,
        response: str,
        query_type: str,
        was_refused: bool,
        source_references: Optional[list] = None,
    ) -> AIQuery:
        record = AIQuery(
            user_id=user_id,
            question=question,
            response=response,
            source_references=source_references or [],
            query_type=query_type,
            was_refused=was_refused,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
