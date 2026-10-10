"""Offline cache contracts. No Redis/MySQL server is contacted."""
import os
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
os.environ.setdefault("DB_PASSWORD", "offline-tests-only")
from redis.exceptions import ConnectionError
from fastapi import HTTPException
from app.utils.cache import read_cached, bump_epoch
from app.service.dashboard import dashboard
from app.service.energy import energy
from app.service.system import system_for_user
from datetime import date


class FakeRedis:
    def __init__(self):
        self.values = {}
        self.now = 0

    def get(self, key):
        item = self.values.get(key)
        return item[0] if item and item[1] > self.now else None

    def set(self, key, value, ex):
        self.values[key] = (value, self.now + ex)


class CacheTests(unittest.TestCase):
    def setUp(self):
        self.db = Mock()
        self.db.scalar.return_value = "epoch-a"
        self.redis = FakeRedis()
        self.loader = Mock(return_value={"production": 12})
        self.redis_patch = patch("app.utils.cache.redis_client", return_value=self.redis)
        self.settings_patch = patch("app.utils.cache.get_settings", return_value=SimpleNamespace(cache_enabled=True))
        self.redis_patch.start()
        self.settings_patch.start()
        self.addCleanup(self.redis_patch.stop)
        self.addCleanup(self.settings_patch.stop)

    def read(self, suffix="user-1"):
        return read_cached(self.db, "system-1", suffix, 15, self.loader)

    def test_hit_and_expiry(self):
        self.assertEqual(self.read(), self.read())
        self.assertEqual(self.loader.call_count, 1)
        self.redis.now = 16
        self.read()
        self.assertEqual(self.loader.call_count, 2)

    def test_identity_is_in_key(self):
        self.read("user-1")
        self.read("user-2")
        self.assertEqual(self.loader.call_count, 2)

    def test_new_committed_epoch_cannot_read_old_cache(self):
        self.read()
        self.db.scalar.return_value = "epoch-b"
        self.loader.return_value = {"production": 99}
        self.assertEqual(self.read()["production"], 99)

    def test_redis_failure_falls_back(self):
        with patch.object(self.redis, "get", side_effect=ConnectionError("secret-host")):
            self.assertEqual(self.read()["production"], 12)

    def test_corrupt_cache_falls_back(self):
        self.read()
        for key in self.redis.values:
            self.redis.values[key] = ("not-json", 99)
        self.assertEqual(self.read()["production"], 12)

    def test_write_failure_does_not_fail_response(self):
        with patch.object(self.redis, "set", side_effect=ConnectionError()):
            self.assertEqual(self.read()["production"], 12)

    def test_bump_does_not_commit_domain_transaction(self):
        bump_epoch(self.db, "packages")
        self.db.execute.assert_called_once()
        self.db.commit.assert_not_called()

    def test_ownership_checked_before_cache(self):
        with patch("app.service.dashboard.system_for_user", side_effect=HTTPException(404)), patch("app.service.dashboard.read_cached") as cache:
            with self.assertRaises(HTTPException):
                dashboard(42, SimpleNamespace(id=2), self.db)
            cache.assert_not_called()

    def test_energy_checks_ownership_before_cache(self):
        with patch("app.service.energy.system_for_user", side_effect=HTTPException(404)), patch("app.service.energy.read_cached") as cache:
            with self.assertRaises(HTTPException):
                energy(42, date(2026, 1, 1), date(2026, 1, 2), SimpleNamespace(id=2), self.db)
            cache.assert_not_called()

    def test_customer_ownership_filter_is_applied(self):
        self.db.scalar.return_value = None
        with self.assertRaises(HTTPException):
            system_for_user(self.db, SimpleNamespace(id=7, role="customer"), 42)
        statement = self.db.scalar.call_args.args[0]
        self.assertEqual(statement.compile().params["user_id_1"], 7)


if __name__ == "__main__":
    unittest.main()
