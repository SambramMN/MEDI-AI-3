"""
MedSafe AI — RAG Knowledge Base

Manages the ChromaDB vector store and retrieval logic.
Trusted medicine information is indexed from structured sources.
The LLM is NOT the primary knowledge source — the retriever is.
"""

import os
from typing import List, Optional

from app.config import get_settings
from app.utils.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class MedicalKnowledgeBase:
    """
    Wraps a ChromaDB collection for medical document retrieval.
    Documents are seeded from trusted sources (OpenFDA, RxNorm, etc.).
    """

    def __init__(self):
        self._client = None
        self._collection = None
        self._embedder = None
        self._initialized = False

    def initialize(self) -> None:
        """Lazy initialization — only connects when first used."""
        if self._initialized:
            return
        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings
            from sentence_transformers import SentenceTransformer

            os.makedirs(settings.chroma_persist_directory, exist_ok=True)

            self._client = chromadb.PersistentClient(
                path=settings.chroma_persist_directory,
            )
            self._collection = self._client.get_or_create_collection(
                name=settings.chroma_collection_name,
                metadata={"hnsw:space": "cosine"},
            )
            self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            self._initialized = True
            logger.info("knowledge_base_initialized", collection=settings.chroma_collection_name)

        except ImportError as exc:
            logger.warning("vector_db_unavailable", error=str(exc))
        except Exception as exc:
            logger.error("knowledge_base_init_failed", error=str(exc))

    def add_document(self, doc_id: str, text: str, metadata: Optional[dict] = None) -> None:
        """Add a document to the vector store."""
        self.initialize()
        if not self._initialized:
            return
        try:
            embedding = self._embedder.encode(text).tolist()
            self._collection.upsert(
                ids=[doc_id],
                documents=[text],
                embeddings=[embedding],
                metadatas=[metadata or {}],
            )
        except Exception as exc:
            logger.error("knowledge_base_add_failed", error=str(exc))

    def retrieve(self, query: str, n_results: int = 5) -> List[dict]:
        """
        Retrieve the top-N relevant documents for a query.
        Returns list of {"text": ..., "metadata": ...}.
        """
        self.initialize()
        if not self._initialized:
            return []
        try:
            embedding = self._embedder.encode(query).tolist()
            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
            output = []
            for doc, meta, dist in zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            ):
                output.append({"text": doc, "metadata": meta, "distance": dist})
            return output
        except Exception as exc:
            logger.error("knowledge_base_retrieve_failed", error=str(exc))
            return []

    def index_medicine(self, medicine_id: str, name: str, description: str, source: str) -> None:
        """Helper to index a medicine's information document."""
        text = f"Medicine: {name}\n\n{description}"
        self.add_document(
            doc_id=f"medicine_{medicine_id}",
            text=text,
            metadata={"type": "medicine", "medicine_id": medicine_id, "source": source},
        )


# Module-level singleton
knowledge_base = MedicalKnowledgeBase()
