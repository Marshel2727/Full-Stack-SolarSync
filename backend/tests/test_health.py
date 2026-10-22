"""Readiness reflects the database schema and security-critical Redis storage."""
import os
import unittest
from unittest.mock import Mock, patch

os.environ.setdefault("DB_PASSWORD", "offline-tests-only")
from fastapi import HTTPException
from redis.exceptions import ConnectionError
from sqlalchemy.exc import OperationalError
from app.service import health


class HealthTests(unittest.TestCase):
    def setUp(self):
        self.db = Mock()
        self.db.execute.return_value.scalar_one.return_value = "0003_google_identity"
        self.redis = Mock()
        self.redis.ping.return_value = True
        self.redis.config_get.return_value = {"maxmemory-policy": "noeviction"}

    def test_all_required_services_ready(self):
        with patch.object(health, "auth_redis", return_value=self.redis):
            self.assertEqual(health.readiness(self.db)["status"], "ready")

    def test_security_store_outage_or_unsafe_eviction_is_not_ready(self):
        for policy in ("allkeys-lru", None):
            self.redis.config_get.return_value = {"maxmemory-policy": policy}
            with patch.object(health, "auth_redis", return_value=self.redis), self.assertRaises(HTTPException) as result:
                health.readiness(self.db)
            self.assertEqual(result.exception.status_code, 503)
        self.redis.ping.side_effect = ConnectionError("private connection details")
        with patch.object(health, "auth_redis", return_value=self.redis), self.assertRaises(HTTPException) as result:
            health.readiness(self.db)
        self.assertNotIn("private", result.exception.detail)

    def test_missing_migration_is_not_ready(self):
        self.db.execute.return_value.scalar_one.return_value = "0002_cache_epochs"
        with patch.object(health, "auth_redis") as redis, self.assertRaises(HTTPException) as result:
            health.readiness(self.db)
        self.assertEqual(result.exception.status_code, 503)
        redis.assert_not_called()

    def test_database_failure_is_not_ready(self):
        self.db.execute.side_effect = OperationalError("sql", {}, Exception("private connection details"))
        with self.assertRaises(HTTPException) as result: health.readiness(self.db)
        self.assertEqual(result.exception.status_code, 503)
        self.assertNotIn("private", result.exception.detail)
