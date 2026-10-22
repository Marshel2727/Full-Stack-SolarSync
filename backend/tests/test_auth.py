"""Offline auth contracts. Redis/MySQL integration still needs operator verification."""
import os
import unittest
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import Mock, patch

os.environ.setdefault("DB_PASSWORD", "offline-tests-only")

from fastapi import HTTPException, Response
from fastapi.testclient import TestClient
from pydantic import ValidationError
from redis.exceptions import ConnectionError as RedisConnectionError
from starlette.requests import Request

from app.main import app
from app.model.schemas.auth import LoginInput
from app.service import auth
from app.utils.config import Settings
from app.utils.cookies import set_session_cookie, delete_session_cookie, session_token
from app.utils.database import get_db
from app.utils.rate_limit import check_login_rate
from app.utils.tokens import digest


TOKEN = "a" * 64


def account():
    return SimpleNamespace(id=7, email="person@example.com", phone=None, name="Person",
                           role="admin", is_active=True, password_hash="stored-hash")


class AuthTests(unittest.TestCase):
    def setUp(self):
        self.settings = Settings(_env_file=None, db_password="offline-tests-only",
                                 app_environment="test", cookie_secure=False,
                                 session_idle_seconds=1800, session_lifetime_seconds=28800,
                                 cors_origins=["http://localhost:3000"])
        # Keep route origin/cookie tests deterministic even in a production Compose env.
        self.patches = [patch("app.utils.middleware.settings", self.settings)]
        for module in ("app.service.auth", "app.utils.cookies", "app.utils.rate_limit"):
            self.patches.append(patch(module + ".get_settings", return_value=self.settings))
        for item in self.patches:
            item.start()

    def tearDown(self):
        app.dependency_overrides.clear()
        for item in reversed(self.patches):
            item.stop()

    def test_production_rejects_http_and_insecure_cookie(self):
        for overrides in ({"cookie_secure": False}, {"cors_origins": ["http://site.example"]},
                          {"cors_origins": ["https://*.example"]},
                          {"auth_redis_url": "redis://cache:6379/1"}):
            data = dict(db_password="test", app_environment="production", cookie_secure=True,
                        cors_origins=["https://site.example"], redis_url="redis://cache:6379/0",
                        auth_redis_url="redis://auth:6379/0")
            with self.subTest(overrides=overrides), self.assertRaises(ValidationError):
                Settings(_env_file=None, **(data | overrides))

    def test_secure_cookie_and_deletion_have_same_scope(self):
        self.settings.cookie_secure = True
        response = Response()
        set_session_cookie(response, TOKEN)
        value = next(value for value in response.headers.getlist("set-cookie")
                     if value.startswith("__Host-solarsync_session="))
        for attribute in ("HttpOnly", "Secure", "SameSite=strict", "Path=/", "Max-Age=28800"):
            self.assertIn(attribute, value)
        self.assertNotIn("Domain=", value)
        response = Response()
        delete_session_cookie(response)
        value = next(value for value in response.headers.getlist("set-cookie")
                     if value.startswith("__Host-solarsync_session="))
        self.assertIn("Max-Age=0", value)
        self.assertIn("Path=/;", value)
        legacy = Request({"type": "http", "headers": [(b"cookie", b"solarsync_session=" + TOKEN.encode())]})
        self.assertIsNone(session_token(legacy))

    def test_credentials_never_echo_in_validation_response(self):
        db = Mock()
        app.dependency_overrides[get_db] = lambda: db
        with TestClient(app) as client:
            result = client.post("/api/v1/auth/login", headers={"Origin": "http://localhost:3000"},
                                 json={"identifier": " ", "password": "private-password", "extra": "secret"})
        self.assertEqual(result.status_code, 422)
        self.assertNotIn("private-password", result.text)
        self.assertNotIn("secret", result.text)
        self.assertEqual(result.headers["cache-control"], "no-store")
        db.scalar.assert_not_called()

    def test_success_rotates_token_hash_and_upgrades_password_hash(self):
        user, db = account(), Mock()
        db.scalar.side_effect = [user, user]
        data = LoginInput(identifier=" person@example.com ", password="long secret password")
        with patch.object(auth, "check_global_login_rate"), patch.object(auth, "check_login_rate") as limit, \
                patch.object(auth.passwords, "verify_and_update", return_value=(True, "upgraded-hash")):
            result, token = auth.login(data, TOKEN, db)
        limit.assert_called_once_with("person@example.com", 7)
        self.assertEqual(result["id"], "7")
        self.assertNotIn("password_hash", result)
        self.assertTrue(auth.valid_token(token))
        self.assertNotEqual(token, TOKEN)
        session = db.add.call_args.args[0]
        self.assertEqual(session.refresh_token_hash, digest(token))
        self.assertNotEqual(session.refresh_token_hash, token)
        self.assertEqual(user.password_hash, "upgraded-hash")
        self.assertEqual(session.expires_at - session.last_used_at, timedelta(hours=8))
        revocation = db.execute.call_args.args[0].compile()
        self.assertIn(digest(TOKEN), revocation.params.values())
        self.assertIn("revoked_at", str(revocation))
        db.commit.assert_called_once()

    def test_unknown_disabled_and_wrong_password_have_same_failure(self):
        messages = []
        for user, valid in ((None, False), (account(), False), (account(), True)):
            if user and valid:
                user.is_active = False
            db = Mock()
            db.scalar.return_value = user
            with patch.object(auth, "check_global_login_rate"), patch.object(auth, "check_login_rate"), \
                    patch.object(auth.passwords, "verify_and_update", return_value=(valid, None)) as verify:
                with self.assertRaises(HTTPException) as caught:
                    auth.login(LoginInput(identifier="person@example.com", password="wrong"), None, db)
            messages.append((caught.exception.status_code, caught.exception.detail))
            verify.assert_called_once()
            db.add.assert_not_called()
            db.commit.assert_not_called()
        self.assertEqual(len(set(messages)), 1)

    def test_concurrent_account_disable_prevents_new_session(self):
        db = Mock()
        user, disabled = account(), account()
        disabled.is_active = False
        db.scalar.side_effect = [user, disabled]
        with patch.object(auth, "check_global_login_rate"), patch.object(auth, "check_login_rate"), \
                patch.object(auth.passwords, "verify_and_update", return_value=(True, None)):
            with self.assertRaises(HTTPException):
                auth.login(LoginInput(identifier="person@example.com", password="password"), None, db)
        db.add.assert_not_called()

    def test_session_query_enforces_absolute_idle_and_revocation(self):
        db = Mock()
        db.scalar.return_value = None
        with self.assertRaises(HTTPException) as caught:
            auth.current_user(TOKEN, db)
        self.assertEqual(caught.exception.status_code, 401)
        statement = str(db.scalar.call_args.args[0])
        for fragment in ("expires_at >", "revoked_at IS NULL", "coalesce(auth_sessions.last_used_at, auth_sessions.created_at) >"):
            self.assertIn(fragment, statement)
        db.get.assert_not_called()

    def test_idle_touch_does_not_extend_absolute_expiry(self):
        db = Mock()
        db.scalar.return_value = SimpleNamespace(id=1, user_id=7, last_used_at=datetime.utcnow() - timedelta(minutes=2))
        db.get.return_value = account()
        db.execute.return_value.rowcount = 1
        auth.current_user(TOKEN, db)
        statement = str(db.execute.call_args.args[0])
        self.assertIn("last_used_at=", statement)
        self.assertNotIn("SET expires_at", statement)
        self.assertIn("revoked_at IS NULL", statement)
        db.commit.assert_called_once()

    def test_revoked_while_touching_session_is_rejected(self):
        db = Mock()
        db.scalar.return_value = SimpleNamespace(id=1, user_id=7, last_used_at=datetime.utcnow() - timedelta(minutes=2))
        db.get.return_value = account()
        db.execute.return_value.rowcount = 0
        with self.assertRaises(HTTPException):
            auth.current_user(TOKEN, db)

    def test_logout_does_not_clear_cookie_if_commit_fails(self):
        db = Mock()
        db.commit.side_effect = RuntimeError("database unavailable")
        app.dependency_overrides[get_db] = lambda: db
        with TestClient(app, raise_server_exceptions=False) as client:
            client.cookies.set("solarsync_session", TOKEN)
            result = client.post("/api/v1/auth/logout", headers={"Origin": "http://localhost:3000"})
        self.assertEqual(result.status_code, 500)
        self.assertNotIn("set-cookie", result.headers)
        self.assertEqual(result.headers["cache-control"], "no-store")

    def test_logout_without_cookie_is_idempotent(self):
        db = Mock()
        self.assertEqual(auth.logout(None, db), {"ok": True})
        db.execute.assert_not_called()

    def test_rate_limiter_shares_account_aliases_and_returns_retry_after(self):
        redis = Mock()
        redis.eval.side_effect = [0, 42]
        with patch("app.utils.rate_limit.auth_redis", return_value=redis):
            check_login_rate("email@example.com", 7)
            with self.assertRaises(HTTPException) as caught:
                check_login_rate("0812345", 7)
        self.assertEqual(redis.eval.call_args_list[0].args[2], redis.eval.call_args_list[1].args[2])
        self.assertEqual(caught.exception.status_code, 429)
        self.assertEqual(caught.exception.headers["Retry-After"], "42")

    def test_redis_outage_fails_closed_without_db_lookup(self):
        redis, db = Mock(), Mock()
        redis.eval.side_effect = RedisConnectionError("sensitive redis connection detail")
        with patch("app.utils.rate_limit.auth_redis", return_value=redis):
            with self.assertRaises(HTTPException) as caught:
                auth.login(LoginInput(identifier="person@example.com", password="password"), None, db)
        self.assertEqual(caught.exception.status_code, 503)
        self.assertNotIn("sensitive", caught.exception.detail)
        db.scalar.assert_not_called()
