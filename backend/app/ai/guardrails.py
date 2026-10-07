"""
MedSafe AI — AI Guardrails

Classifies user questions and enforces medical safety boundaries.
The assistant will NOT prescribe, diagnose, or suggest dosages.
"""

import re
from enum import Enum
from typing import Tuple


class QueryType(str, Enum):
    MEDICINE_INFO = "medicine_info"
    INTERACTION_INFO = "interaction_info"
    GENERAL_EDUCATION = "general_education"
    PRESCRIPTION_REQUEST = "prescription_request"
    DOSAGE_REQUEST = "dosage_request"
    DIAGNOSIS_REQUEST = "diagnosis_request"
    STOP_MEDICATION = "stop_medication"
    UNCLEAR = "unclear"


# Patterns that trigger a guardrail refusal
GUARDRAIL_PATTERNS = [
    (QueryType.PRESCRIPTION_REQUEST, [
        r"what (medicine|medication|drug|pill|tablet) should i take",
        r"prescribe",
        r"give me (a )?prescription",
        r"recommend (a )?medicine for my",
        r"which (antibiotic|painkiller|medicine) (should|do) i (take|use)",
        r"best medicine for",
        r"suggest (a )?drug",
    ]),
    (QueryType.DOSAGE_REQUEST, [
        r"how much (should|can) i take",
        r"what (dose|dosage) should i (take|use)",
        r"my (exact|correct) dose",
        r"how many (mg|milligrams|tablets|pills) should",
        r"tell me (exactly|precisely) (what|how much)",
    ]),
    (QueryType.DIAGNOSIS_REQUEST, [
        r"do i have",
        r"am i (sick|ill|infected|pregnant)",
        r"diagnose",
        r"what (disease|condition|illness) do i have",
        r"is this (cancer|diabetes|covid|flu|infection)",
    ]),
    (QueryType.STOP_MEDICATION, [
        r"should i stop (taking|using|my)",
        r"can i stop (taking|using|my)",
        r"stop my (prescription|medication|medicine)",
        r"quit taking",
        r"discontinue my",
    ]),
]

# Refusal messages for each guardrail type
REFUSAL_MESSAGES = {
    QueryType.PRESCRIPTION_REQUEST: (
        "I'm sorry, but MedSafe AI cannot prescribe medicines or recommend "
        "specific treatments for medical conditions. "
        "Please consult a qualified doctor or pharmacist for personalised medical advice."
    ),
    QueryType.DOSAGE_REQUEST: (
        "MedSafe AI cannot provide a personalised dosage recommendation. "
        "Dosage depends on individual factors that only a healthcare professional can assess. "
        "Please consult your doctor or pharmacist."
    ),
    QueryType.DIAGNOSIS_REQUEST: (
        "MedSafe AI cannot diagnose medical conditions. "
        "If you are concerned about your health, please consult a qualified healthcare professional."
    ),
    QueryType.STOP_MEDICATION: (
        "MedSafe AI cannot advise you to stop, change, or discontinue any prescription medication. "
        "Please speak with your prescribing doctor before making any changes to your medication."
    ),
}


def classify_query(question: str) -> Tuple[QueryType, bool, str]:
    """
    Classify a user question.

    Returns:
        (query_type, should_refuse, refusal_message_or_empty_string)
    """
    q_lower = question.lower()

    for query_type, patterns in GUARDRAIL_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, q_lower):
                return (
                    query_type,
                    True,
                    REFUSAL_MESSAGES[query_type],
                )

    # Classify safe queries
    if any(kw in q_lower for kw in ["interaction", "react", "mix", "combine", "together"]):
        return QueryType.INTERACTION_INFO, False, ""

    if any(kw in q_lower for kw in ["medicine", "drug", "medication", "tablet", "capsule", "pill"]):
        return QueryType.MEDICINE_INFO, False, ""

    return QueryType.GENERAL_EDUCATION, False, ""
