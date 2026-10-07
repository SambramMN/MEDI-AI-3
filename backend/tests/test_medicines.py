"""
MedSafe AI — Medicine Search Tests
"""

import pytest


class TestMedicineSearch:
    def test_search_by_brand_name(self, client, sample_medicine):
        response = client.get("/api/medicines/search?q=Tylenol")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1
        names = [r["brand_name"] for r in data["results"]]
        assert "Tylenol" in names

    def test_search_by_generic_name(self, client, sample_medicine):
        response = client.get("/api/medicines/search?q=paracetamol")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] >= 1

    def test_search_unknown_medicine(self, client):
        response = client.get("/api/medicines/search?q=XXXXXXXXUNKNOWNMED")
        assert response.status_code == 200
        assert response.json()["total"] == 0

    def test_search_returns_pagination(self, client, sample_medicine):
        response = client.get("/api/medicines/search?q=para&page=1&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 5

    def test_search_query_too_short(self, client):
        response = client.get("/api/medicines/search?q=a")
        assert response.status_code == 422

    def test_get_medicine_by_id(self, client, sample_medicine):
        response = client.get(f"/api/medicines/{sample_medicine.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_medicine.id
        assert data["brand_name"] == "Tylenol"
        assert "description" in data
        assert "side_effects" in data
        assert "warnings" in data

    def test_get_medicine_not_found(self, client):
        response = client.get("/api/medicines/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404
        assert response.json()["detail"]["code"] == "MEDICINE_NOT_FOUND"
