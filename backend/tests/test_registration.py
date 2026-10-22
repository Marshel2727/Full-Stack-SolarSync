"""Legacy registration is closed; guest ownership still requires verification."""
import os
import unittest
from types import SimpleNamespace
from unittest.mock import Mock

os.environ.setdefault("DB_PASSWORD", "offline-tests-only")

from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError
from app.main import app
from app.model.schemas.installation import LinkAccountInput
from app.service import installation
from app.utils.database import get_db


class RegistrationTests(unittest.TestCase):
    def test_password_registration_is_closed_without_creating_or_issuing_session(self):
        db = Mock()
        app.dependency_overrides[get_db] = lambda: db
        try:
            with TestClient(app) as client:
                result = client.post('/api/v1/auth/register', headers={'Origin': 'http://localhost:3000'},
                                     json={'name': 'New', 'email': 'new@gmail.com', 'password': 'test passphrase'})
            self.assertEqual(result.status_code, 410)
            self.assertNotIn('set-cookie', result.headers)
            db.add.assert_not_called()
        finally:
            app.dependency_overrides.clear()

    def test_guest_account_link_requires_explicit_ownership_confirmation(self):
        with self.assertRaises(ValidationError):
            LinkAccountInput(userId=17, ownershipConfirmed=False, verificationNote="Sudah dikonfirmasi")
        db = Mock()
        with self.assertRaises(HTTPException) as caught:
            installation.link_account("REQ-test", LinkAccountInput(userId=17, ownershipConfirmed=True,
                verificationNote="Sudah diverifikasi"), SimpleNamespace(role="customer"), db)
        self.assertEqual(caught.exception.status_code, 403)
        db.scalar.assert_not_called()

    def test_link_cannot_move_a_request_owned_by_another_account(self):
        db = Mock()
        db.scalar.side_effect = [SimpleNamespace(id=17, role="customer", is_active=True),
                                SimpleNamespace(submitted_by_user_id=99)]
        with self.assertRaises(HTTPException) as caught:
            installation.link_account("REQ-test", LinkAccountInput(userId=17, ownershipConfirmed=True,
                verificationNote="Konfirmasi melalui kontak pemohon"), SimpleNamespace(id=1, role="admin"), db)
        self.assertEqual(caught.exception.status_code, 409)
        db.commit.assert_not_called()

    def test_whitespace_verification_note_is_rejected(self):
        with self.assertRaises(HTTPException) as caught:
            installation.link_account("REQ-test", LinkAccountInput(userId=17, ownershipConfirmed=True,
                verificationNote=" "*15), SimpleNamespace(id=1, role="admin"), Mock())
        self.assertEqual(caught.exception.status_code, 422)
