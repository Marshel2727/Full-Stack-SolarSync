"""Offline OIDC security contracts, including locally signed RSA ID tokens."""
import json
import logging
import os
import time
import unittest
from types import SimpleNamespace
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

os.environ.setdefault('DB_PASSWORD', 'offline-tests-only')

from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from fastapi import HTTPException
from fastapi.testclient import TestClient
from google.auth import crypt, jwt
from pydantic import ValidationError
from redis.exceptions import ConnectionError
from sqlalchemy.exc import IntegrityError
from app.main import app
from app.model.user import AuthSession, User
from app.model.schemas.auth import GoogleStartInput, LoginInput
from app.service import auth, google_auth as google
from app.utils.config import Settings
from app.utils.database import get_db
from app.utils.middleware import RedactOAuthQuery
from app.utils.tokens import digest


def customer(**changes):
    return SimpleNamespace(**(dict(id=17, role='customer', email='person@gmail.com', is_active=True,
        google_subject='subject123', name='Person', phone=None, password_hash='old hash') | changes))


class GoogleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        private = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
                                   serialization.NoEncryption())
        cls.signer = crypt.RSASigner.from_string(private, key_id='offline-key')
        cls.certs = {'offline-key': key.public_key().public_bytes(serialization.Encoding.PEM,
                        serialization.PublicFormat.SubjectPublicKeyInfo).decode()}

    def setUp(self):
        self.settings = Settings(_env_file=None, db_password='offline', google_client_id='test.apps.googleusercontent.com',
            google_client_secret='offline-secret', cors_origins=['http://localhost:3000'])
        self.patches = [patch('app.service.google_auth.get_settings', return_value=self.settings),
            patch('app.routes.auth.get_settings', return_value=self.settings),
            patch('app.utils.cookies.get_settings', return_value=self.settings),
            patch('app.utils.middleware.settings', self.settings)]
        for item in self.patches: item.start()

    def tearDown(self):
        app.dependency_overrides.clear()
        for item in reversed(self.patches): item.stop()

    def claims(self, **changes):
        return dict(iss='https://accounts.google.com', aud=self.settings.google_client_id,
            sub='subject123', email='person@gmail.com', email_verified=True, name='Person',
            iat=int(time.time()), exp=int(time.time())+300, nonce='expected nonce') | changes

    def verify(self, changes=None, tamper=False):
        token = jwt.encode(self.signer, self.claims(**(changes or {}))).decode()
        if tamper:
            parts = token.split('.')
            parts[2] = ('A' if parts[2][0] != 'A' else 'B') + parts[2][1:]
            token = '.'.join(parts)
        response = Mock()
        response.json.return_value = {'id_token': token}
        transport = Mock(return_value=SimpleNamespace(status=200, data=json.dumps(self.certs).encode()))
        with patch.object(google.httpx, 'Client') as http, patch.object(google, 'GoogleRequest', return_value=transport):
            http.return_value.__enter__.return_value.post.return_value = response
            return google.exchange_identity('offline-code', {'nonce': 'expected nonce', 'verifier': 'offline-verifier'})

    def test_valid_signature_and_claims_are_accepted(self):
        self.assertEqual(self.verify()['sub'], 'subject123')

    def test_bad_signature_issuer_audience_expiry_and_nonce_are_rejected(self):
        for changes in ({'aud': 'another-app'}, {'iss': 'https://attacker.invalid'},
                        {'exp': int(time.time())-120}, {'nonce': 'wrong'}, {'email_verified': False},
                        {'email': 'thirdparty@example.com'}, {'sub': ''}):
            with self.subTest(changes=changes), self.assertRaises(google.GoogleFailure):
                self.verify(changes)
        with self.assertRaises(google.GoogleFailure): self.verify(tamper=True)

    def test_workspace_authoritative_address_is_accepted(self):
        self.assertEqual(self.verify({'email': 'person@company.test', 'hd': 'company.test'})['hd'], 'company.test')

    def test_start_binds_browser_and_uses_pkce_without_exposing_secret(self):
        redis = Mock()
        redis.set.return_value = True
        with patch.object(google, 'auth_redis', return_value=redis), patch.object(google, 'check_global_login_rate'):
            url, binding = google.start('//attacker.invalid', 'a'*64, 'http://localhost:3000')
        query = parse_qs(urlsplit(url).query)
        self.assertEqual(query['scope'], ['openid email profile'])
        self.assertEqual(query['code_challenge_method'], ['S256'])
        self.assertNotIn('offline-secret', url)
        self.assertNotIn('client_secret', query)
        stored = json.loads(redis.set.call_args.args[1])
        self.assertEqual(stored['binding'], digest(binding))
        self.assertEqual(stored['previous_hash'], digest('a'*64))
        self.assertEqual(stored['next'], '/dashboard')
        self.assertEqual(redis.set.call_args.kwargs['ex'], 600)
        self.assertTrue(redis.set.call_args.kwargs['nx'])

    def test_wrong_origin_or_missing_configuration_never_creates_state(self):
        with patch.object(google, 'auth_redis') as redis:
            with self.assertRaises(HTTPException): google.start('/dashboard', None, 'https://attacker.invalid')
            self.settings.google_client_id = ''
            with self.assertRaises(HTTPException): google.start('/dashboard', None, 'http://localhost:3000')
        redis.assert_not_called()

    def test_state_missing_binding_expired_or_redis_outage_fails_closed(self):
        with patch.object(google, 'auth_redis') as redis:
            with self.assertRaises(google.GoogleFailure): google.take_state('a'*64, None)
            redis.assert_not_called()
            redis.return_value.eval.return_value = None
            with self.assertRaises(google.GoogleFailure): google.take_state('a'*64, 'b'*64)
            redis.return_value.eval.side_effect = ConnectionError('private redis details')
            with self.assertRaises(google.GoogleFailure) as result: google.take_state('a'*64, 'b'*64)
            self.assertEqual(result.exception.code, 'unavailable')

    def test_new_identity_creates_only_customer_and_hashed_session(self):
        db, added = Mock(), []
        db.scalar.return_value = None
        db.add.side_effect = added.append
        db.flush.side_effect = lambda: setattr(added[0], 'id', 17)
        with patch.object(google, 'check_registration_rate'), patch.object(google.passwords, 'hash', return_value='random-secret-hash'):
            token, path = google.finish(self.claims(), {'next': '/dashboard/installation'}, db)
        self.assertIsInstance(added[0], User)
        self.assertEqual(added[0].role, 'customer')
        self.assertEqual(added[0].google_subject, 'subject123')
        self.assertIsNotNone(added[0].email_verified_at)
        self.assertIsInstance(added[1], AuthSession)
        self.assertEqual(added[1].refresh_token_hash, digest(token))
        self.assertEqual(path, '/dashboard/installation')
        db.execute.assert_not_called()  # No request/customer ownership inferred from email.
        db.commit.assert_called_once()

    def test_duplicate_unverified_local_email_requires_explicit_link(self):
        db = Mock()
        db.scalar.side_effect = [None, 17]
        with self.assertRaises(google.GoogleFailure) as result: google.finish(self.claims(), {}, db)
        self.assertEqual(result.exception.code, 'link_required')
        db.add.assert_not_called()

    def test_existing_google_identity_uses_subject_and_never_grants_admin(self):
        for role, active in (('admin', True), ('customer', False)):
            db = Mock()
            db.scalar.return_value = customer(role=role, is_active=active)
            with self.assertRaises(google.GoogleFailure): google.finish(self.claims(), {}, db)
            db.commit.assert_not_called()
        db = Mock()
        db.scalar.return_value = customer(email='previous@gmail.com')
        token, _ = google.finish(self.claims(), {}, db)
        self.assertTrue(auth.valid_token(token))
        self.assertEqual(db.scalar.call_count, 1)
        self.assertIn('google_subject', str(db.scalar.call_args.args[0]))

    def test_explicit_link_preserves_user_id_and_revokes_old_sessions(self):
        db = Mock()
        user = customer(google_subject=None)
        db.scalar.side_effect = [None, user]
        token, _ = google.finish(self.claims(), dict(link_user_id='17', link_password_digest=digest('old hash')), db)
        self.assertEqual(user.id, 17)
        self.assertEqual(user.google_subject, 'subject123')
        self.assertTrue(auth.valid_token(token))
        self.assertEqual(len([x for x in db.add.call_args_list if isinstance(x.args[0], User)]), 0)
        self.assertIn('auth_sessions.user_id', str(db.execute.call_args.args[0]))

    def test_link_rejects_changed_password_email_admin_and_other_identity(self):
        for changes in ({'password_hash': 'changed'}, {'email': 'someone@gmail.com'}, {'role': 'admin'},
                        {'google_subject': 'another'}, {'is_active': False}):
            db = Mock()
            db.scalar.side_effect = [None, customer(**changes)]
            with self.subTest(changes=changes), self.assertRaises(google.GoogleFailure):
                google.finish(self.claims(), dict(link_user_id='17', link_password_digest=digest('old hash')), db)
            db.commit.assert_not_called()

    def test_duplicate_race_rolls_back_without_granting_session(self):
        db = Mock()
        db.scalar.return_value = None
        db.flush.side_effect = IntegrityError('insert', {}, Exception('duplicate'))
        with patch.object(google, 'check_registration_rate'), patch.object(google.passwords, 'hash', return_value='hash'):
            with self.assertRaises(google.GoogleFailure): google.finish(self.claims(), {}, db)
        db.rollback.assert_called_once()
        db.commit.assert_not_called()

    def test_password_login_rejects_customer_even_with_correct_password(self):
        db = Mock()
        db.scalar.return_value = customer()
        with patch.object(auth, 'check_global_login_rate'), patch.object(auth, 'check_login_rate'), \
                patch.object(auth.passwords, 'verify_and_update', return_value=(True, None)):
            with self.assertRaises(HTTPException): auth.login(LoginInput(identifier='person@gmail.com', password='correct'), None, db)
        db.commit.assert_not_called()

    def test_unsafe_redirects_and_injected_roles_are_rejected(self):
        for value in ('//evil.test', '/admin', '/\\evil.test', 'https://evil.test', '/dashboard\n'):
            self.assertEqual(google.safe_next(value), '/dashboard')
        self.assertEqual(google.safe_next('/installation-request?package=abc'), '/installation-request?package=abc')
        with self.assertRaises(ValidationError): GoogleStartInput(role='admin')

    def test_callback_issues_http_only_session_and_clears_temporary_cookie(self):
        db = Mock()
        app.dependency_overrides[get_db] = lambda: db
        with patch.object(google, 'take_state', return_value={}), patch.object(google, 'exchange_identity', return_value={}), \
                patch.object(google, 'finish', return_value=('a'*64, '/dashboard/installation')):
            with TestClient(app) as client:
                result = client.get('/api/v1/auth/google/callback?state=stub&code=stub', follow_redirects=False)
        self.assertEqual(result.status_code, 303)
        self.assertIn('/login?google=success', result.headers['location'])
        cookies = result.headers.get_list('set-cookie')
        self.assertTrue(any('solarsync_session=' in x and 'HttpOnly' in x and 'SameSite=strict' in x for x in cookies))
        self.assertTrue(any('solarsync_google=' in x and 'Max-Age=0' in x for x in cookies))
        self.assertEqual(result.headers['referrer-policy'], 'no-referrer')

    def test_bad_callback_never_exchanges_code_or_creates_session(self):
        app.dependency_overrides[get_db] = lambda: Mock()
        with patch.object(google, 'exchange_identity') as exchange:
            with TestClient(app) as client:
                result = client.get('/api/v1/auth/google/callback?state=bad&code=secret', follow_redirects=False)
        self.assertIn('google_error=expired', result.headers['location'])
        self.assertNotIn('secret', result.headers['location'])
        self.assertFalse(any('solarsync_session=' in x for x in result.headers.get_list('set-cookie')))
        exchange.assert_not_called()

    def test_cookie_bound_start_requires_origin_and_returns_no_secrets(self):
        with patch.object(google, 'auth_redis') as redis, patch.object(google, 'check_global_login_rate'):
            redis.return_value.set.return_value = True
            with TestClient(app) as client:
                blocked = client.post('/api/v1/auth/google/start', json={})
                result = client.post('/api/v1/auth/google/start', json={}, headers={'Origin': 'http://localhost:3000'})
        self.assertEqual(blocked.status_code, 403)
        self.assertEqual(result.status_code, 200)
        self.assertIn('HttpOnly', result.headers['set-cookie'])
        self.assertIn('SameSite=lax', result.headers['set-cookie'])
        self.assertNotIn('offline-secret', result.text)

    def test_callback_access_log_removes_code_and_state(self):
        record = logging.LogRecord('uvicorn.access', logging.INFO, '', 0, '%s %s %s %s %s',
            ('127.0.0.1', 'GET', '/api/v1/auth/google/callback?code=secret&state=private', '1.1', 303), None)
        RedactOAuthQuery().filter(record)
        self.assertNotIn('secret', record.getMessage())
        self.assertNotIn('private', record.getMessage())

    def test_configuration_requires_secret_pair_and_exact_allowed_callback(self):
        for changes in ({'google_client_secret': ''}, {'google_redirect_uri': 'https://evil.test/api/v1/auth/google/callback'},
                        {'google_redirect_uri': 'http://localhost:3000/other'}):
            with self.assertRaises(ValidationError):
                values = dict(db_password='offline', google_client_id='client', google_client_secret='secret') | changes
                Settings(_env_file=None, **values)
