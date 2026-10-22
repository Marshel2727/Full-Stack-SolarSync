"""Server-side Google OIDC: browser-bound, single-use state and verified identity."""
import base64
import hashlib
import json
import re
import secrets
from datetime import datetime
from functools import partial
from urllib.parse import urlencode, urlsplit

import httpx
import requests
from fastapi import HTTPException
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from redis.exceptions import RedisError
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from app.model.user import User, AuthSession
from app.service import auth
from app.utils.config import get_settings
from app.utils.passwords import passwords
from app.utils.rate_limit import auth_redis, check_global_login_rate, check_registration_rate
from app.utils.tokens import digest

TTL = 600
_TAKE = """
local value = redis.call('GET', KEYS[1])
if not value then return false end
if cjson.decode(value).binding ~= ARGV[1] then return false end
redis.call('DEL', KEYS[1])
return value
"""


class GoogleFailure(Exception):
    def __init__(self, code):
        self.code = code


def safe_next(value):
    if not isinstance(value, str) or not value.startswith("/") or value.startswith("//"):
        return "/dashboard"
    parsed = urlsplit(value)
    if (parsed.netloc or parsed.scheme or "\\" in value or any(ord(c) < 32 for c in value)
            or parsed.path not in ("/dashboard", "/dashboard/installation", "/installation-request")):
        return "/dashboard"
    return parsed.path + ("?" + parsed.query if parsed.query else "")


def require_config():
    settings = get_settings()
    if not settings.google_enabled:
        raise HTTPException(503, "Login Google belum diaktifkan oleh pengelola.")
    return settings


def start(next_path, previous, origin, legacy_user=None):
    settings = require_config()
    if origin != settings.google_frontend_origin:
        raise HTTPException(400, "Buka halaman masuk melalui " + settings.google_frontend_origin)
    check_global_login_rate()
    state, binding, nonce, verifier = (secrets.token_urlsafe(48) for _ in range(4))
    payload = dict(binding=digest(binding), nonce=nonce, verifier=verifier, next=safe_next(next_path),
                   previous_hash=digest(previous) if auth.valid_token(previous) else None)
    if legacy_user:
        payload.update(link_user_id=str(legacy_user.id), link_password_digest=digest(legacy_user.password_hash))
    try:
        if not auth_redis().set("auth:google:v1:" + digest(state), json.dumps(payload), ex=TTL, nx=True):
            raise GoogleFailure("unavailable")
    except RedisError:
        raise HTTPException(503, "Login sementara tidak tersedia. Coba lagi nanti.") from None
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(dict(
        client_id=settings.google_client_id, redirect_uri=settings.google_redirect_uri,
        response_type="code", scope="openid email profile", state=state, nonce=nonce,
        code_challenge=challenge, code_challenge_method="S256", prompt="select_account"))
    return url, binding


def take_state(state, binding):
    if not auth.valid_token(state) or not auth.valid_token(binding):
        raise GoogleFailure("expired")
    try:
        value = auth_redis().eval(_TAKE, 1, "auth:google:v1:" + digest(state), digest(binding))
    except RedisError:
        raise GoogleFailure("unavailable") from None
    if not value:
        raise GoogleFailure("expired")
    return json.loads(value)


def exchange_identity(code, payload):
    settings = require_config()
    try:
        with httpx.Client(timeout=10, follow_redirects=False) as client:
            response = client.post("https://oauth2.googleapis.com/token", data=dict(
                code=code, client_id=settings.google_client_id,
                client_secret=settings.google_client_secret.get_secret_value(),
                redirect_uri=settings.google_redirect_uri, grant_type="authorization_code",
                code_verifier=payload["verifier"]))
            response.raise_for_status()
            token = response.json().get("id_token")
        if not isinstance(token, str):
            raise ValueError("Missing ID token")
        # Google's library verifies signature, audience, expiry and issuer.
        with requests.Session() as session:
            claims = id_token.verify_oauth2_token(token,
                partial(GoogleRequest(session=session), timeout=5), settings.google_client_id)
    except (httpx.HTTPError, requests.RequestException, GoogleAuthError, ValueError):
        raise GoogleFailure("verification_failed") from None
    if not isinstance(claims.get("nonce"), str) or not secrets.compare_digest(claims["nonce"], payload["nonce"]):
        raise GoogleFailure("verification_failed")
    subject, email = claims.get("sub"), claims.get("email")
    if (not isinstance(subject, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,255}", subject)
            or not isinstance(email, str) or len(email) > 254 or claims.get("email_verified") is not True
            or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email)):
        raise GoogleFailure("verification_failed")
    # Google must be authoritative for this address, including Workspace accounts.
    if not email.casefold().endswith("@gmail.com") and not claims.get("hd"):
        raise GoogleFailure("unsupported_email")
    return claims


def finish(claims, payload, db):
    subject, email = claims["sub"], claims["email"].strip().casefold()
    now = datetime.utcnow()
    user = db.scalar(select(User).where(User.google_subject == subject).with_for_update())
    link_id = payload.get("link_user_id")
    if link_id:
        if user and str(user.id) != link_id:
            raise GoogleFailure("account_conflict")
        user = db.scalar(select(User).where(User.id == int(link_id)).with_for_update())
        if (not user or not user.is_active or user.role != "customer"
                or not secrets.compare_digest(digest(user.password_hash), payload["link_password_digest"])
                or not user.email or user.email.casefold() != email
                or (user.google_subject and user.google_subject != subject)):
            raise GoogleFailure("account_conflict")
        user.google_subject = subject
        user.email_verified_at = now
        # Complete the one-time migration; old password sessions are revoked.
        db.execute(update(AuthSession).where(AuthSession.user_id == user.id,
            AuthSession.revoked_at.is_(None)).values(revoked_at=now))
    elif not user:
        # Unverified local email is never sufficient proof for merging accounts.
        if db.scalar(select(User.id).where(User.email == email)):
            raise GoogleFailure("link_required")
        check_registration_rate(email)
        user = User(name=str(claims.get("name") or email.split("@")[0])[:255], email=email,
                    google_subject=subject, role="customer", is_active=True, email_verified_at=now,
                    password_hash=passwords.hash(secrets.token_urlsafe(48)))
        db.add(user)
    if not user.is_active or user.role != "customer":
        raise GoogleFailure("access_denied")
    try:
        db.flush()
        token = auth.issue_session(user, payload.get("previous_hash"), db)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise GoogleFailure("account_conflict") from None
    return token, safe_next(payload.get("next"))
