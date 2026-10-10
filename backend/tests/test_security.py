import os
import unittest
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import Mock, patch

os.environ.setdefault("DB_PASSWORD", "offline-tests-only")
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request
from app.main import app
from app.routes.dependencies import current_user, admin_user
from app.utils.database import get_db


class SecurityTests(unittest.TestCase):
    def tearDown(self):
        app.dependency_overrides.clear()

    def test_missing_session_rejected_without_cache(self):
        request = Request({"type": "http", "headers": []})
        with patch("app.utils.cache.read_cached") as cache:
            with self.assertRaises(HTTPException) as result:
                current_user(request, Mock())
            self.assertEqual(result.exception.status_code, 401)
            cache.assert_not_called()

    def test_permissions_are_read_again_for_each_request(self):
        request = Request({"type": "http", "headers": [(b"cookie", b"solarsync_session=" + b"a" * 64)]})
        db = Mock()
        db.scalar.return_value = SimpleNamespace(user_id=7, last_used_at=datetime.utcnow())
        db.get.return_value = SimpleNamespace(id=7, role="customer", is_active=True)
        self.assertEqual(current_user(request, db).id, 7)
        db.get.return_value = SimpleNamespace(id=7, role="customer", is_active=False)
        with self.assertRaises(HTTPException):
            current_user(request, db)
        self.assertEqual(db.scalar.call_count, 2)

    def test_customer_cannot_write_catalog(self):
        with self.assertRaises(HTTPException) as result:
            admin_user(SimpleNamespace(role="customer"))
        self.assertEqual(result.exception.status_code, 403)

    def test_health_has_no_store(self):
        with TestClient(app) as client:
            response = client.get("/health")
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_cross_origin_login_rejected_before_database(self):
        db = Mock()
        app.dependency_overrides[get_db] = lambda: db
        with TestClient(app) as client:
            response = client.post("/api/v1/auth/login", headers={"Origin": "https://attacker.invalid"},
                                   json={"identifier": "user", "password": "wrong"})
        self.assertEqual(response.status_code, 403)
        db.scalar.assert_not_called()

    def test_private_route_rejects_anonymous_user(self):
        app.dependency_overrides[get_db] = lambda: Mock()
        with TestClient(app) as client:
            response = client.get("/api/v1/systems")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.headers["cache-control"], "no-store")
