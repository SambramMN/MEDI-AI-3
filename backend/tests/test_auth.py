"""
MedSafe AI — Authentication Tests
"""

import pytest


class TestRegistration:
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Alice",
            "email": "alice@example.com",
            "password": "SecurePass1!",
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "alice@example.com"
        assert "password_hash" not in data
        assert "password" not in data

    def test_register_duplicate_email(self, client):
        payload = {
            "name": "Bob",
            "email": "bob@example.com",
            "password": "SecurePass1!",
        }
        client.post("/api/auth/register", json=payload)
        response = client.post("/api/auth/register", json=payload)
        assert response.status_code == 409
        assert response.json()["detail"]["code"] == "EMAIL_TAKEN"

    def test_register_weak_password(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Carol",
            "email": "carol@example.com",
            "password": "short",
        })
        assert response.status_code == 422

    def test_register_invalid_email(self, client):
        response = client.post("/api/auth/register", json={
            "name": "Dave",
            "email": "not-an-email",
            "password": "SecurePass1!",
        })
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json={
            "name": "Eve",
            "email": "eve@example.com",
            "password": "SecurePass1!",
        })
        response = client.post("/api/auth/login", json={
            "email": "eve@example.com",
            "password": "SecurePass1!",
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json={
            "name": "Frank",
            "email": "frank@example.com",
            "password": "CorrectPass1!",
        })
        response = client.post("/api/auth/login", json={
            "email": "frank@example.com",
            "password": "WrongPassword",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        response = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "AnyPass123!",
        })
        assert response.status_code == 401


class TestProtectedRoutes:
    def test_get_me_authenticated(self, client, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert "email" in response.json()

    def test_get_me_no_token(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code in (401, 422)

    def test_get_me_invalid_token(self, client):
        response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert response.status_code == 401
