"""
MedSafe AI — Common API error helpers and response wrappers.
"""

from typing import Any, Optional

from fastapi import HTTPException
from fastapi.responses import JSONResponse


def error_response(code: str, message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": code, "message": message},
        },
    )


def success_response(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data},
    )


# Reusable HTTP exceptions

class MedicineNotFound(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=404,
            detail={"code": "MEDICINE_NOT_FOUND", "message": "The medicine could not be verified."},
        )


class Unauthorized(HTTPException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(
            status_code=401,
            detail={"code": "UNAUTHORIZED", "message": detail},
        )


class Forbidden(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail={"code": "FORBIDDEN", "message": "You do not have permission to access this resource."},
        )


class ValidationError(HTTPException):
    def __init__(self, message: str):
        super().__init__(
            status_code=422,
            detail={"code": "VALIDATION_ERROR", "message": message},
        )
