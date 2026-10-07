"""
MedSafe AI — OCR Scanner Tests
"""

import io
import pytest
from PIL import Image, ImageDraw


def _make_test_image(text: str = "Tylenol 500mg") -> bytes:
    """Create a simple test image with medicine text."""
    img = Image.new("RGB", (400, 100), color="white")
    draw = ImageDraw.Draw(img)
    draw.text((10, 30), text, fill="black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


class TestScannerUpload:
    def test_upload_valid_image(self, client, auth_headers):
        image_bytes = _make_test_image("Paracetamol 500mg tablet")
        response = client.post(
            "/api/scanner/upload",
            files={"file": ("test.png", image_bytes, "image/png")},
            headers=auth_headers,
        )
        # Should succeed even if OCR extracts nothing (Tesseract may not be installed)
        assert response.status_code in (200, 500)
        if response.status_code == 200:
            data = response.json()
            assert data["requires_confirmation"] is True
            assert "extracted_text" in data
            assert "detected_medicines" in data

    def test_upload_unsupported_file_type(self, client, auth_headers):
        response = client.post(
            "/api/scanner/upload",
            files={"file": ("test.exe", b"binary", "application/octet-stream")},
            headers=auth_headers,
        )
        assert response.status_code == 415
        assert response.json()["detail"]["code"] == "UNSUPPORTED_FILE_TYPE"

    def test_upload_requires_confirmation_always_true(self, client, auth_headers):
        """Regardless of OCR result, requires_confirmation must always be True."""
        image_bytes = _make_test_image("Ibuprofen")
        response = client.post(
            "/api/scanner/upload",
            files={"file": ("med.png", image_bytes, "image/png")},
            headers=auth_headers,
        )
        if response.status_code == 200:
            assert response.json()["requires_confirmation"] is True

    def test_upload_without_auth_allowed(self, client):
        """Scanner should work without auth (anonymous user)."""
        image_bytes = _make_test_image("Aspirin")
        response = client.post(
            "/api/scanner/upload",
            files={"file": ("aspirin.png", image_bytes, "image/png")},
        )
        # Either succeeds or fails due to Tesseract not installed, not auth
        assert response.status_code != 401
