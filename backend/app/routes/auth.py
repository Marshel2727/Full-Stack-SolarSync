from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import RedirectResponse
from app.model.schemas.auth import LoginInput, GoogleStartInput, GoogleLinkInput
from app.routes.dependencies import current_user
from app.service import auth as service
from app.service import google_auth
from app.utils.config import get_settings
from app.utils.database import get_db
from app.utils.cookies import session_token, set_session_cookie, delete_session_cookie

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register")
def register():
    raise HTTPException(410, "Pendaftaran pelanggan kini menggunakan Google. Buka halaman masuk.")


def flow_cookie():
    return "__Host-solarsync_google" if get_settings().cookie_secure else "solarsync_google"


def begin_google(data, request, response, legacy_user=None):
    url, binding = google_auth.start(data.next, session_token(request), request.headers.get("origin"), legacy_user)
    response.set_cookie(flow_cookie(), binding, max_age=google_auth.TTL, httponly=True,
                        secure=get_settings().cookie_secure, samesite="lax", path="/")
    return {"authorizationUrl": url}


@router.get("/google/config")
def google_config():
    settings = get_settings()
    return {"enabled": settings.google_enabled}


@router.post("/google/start")
def google_start(data: GoogleStartInput, request: Request, response: Response):
    return begin_google(data, request, response)


@router.post("/google/link")
def google_link(data: GoogleLinkInput, request: Request, response: Response, db=Depends(get_db)):
    google_auth.require_config()
    user = service.verify_password(data, db, required_role="customer")
    if user.google_subject:
        raise HTTPException(409, "Akun sudah terhubung. Gunakan tombol Lanjutkan dengan Google.")
    # Persist a possible hash upgrade before binding its digest to the flow.
    db.commit()
    return begin_google(data, request, response, user)


@router.get("/google/callback")
def google_callback(request: Request, state: str = Query(default="", max_length=128),
                    code: str = Query(default="", max_length=4096),
                    error: str = Query(default="", max_length=255), db=Depends(get_db)):
    settings = get_settings()
    origin = settings.google_frontend_origin if settings.google_enabled else settings.cors_origins[0]
    next_path = "/dashboard"
    try:
        google_auth.require_config()
        payload = google_auth.take_state(state, request.cookies.get(flow_cookie()))
        next_path = google_auth.safe_next(payload.get("next"))
        if error or not code:
            raise google_auth.GoogleFailure("cancelled")
        claims = google_auth.exchange_identity(code, payload)
        token, next_path = google_auth.finish(claims, payload, db)
        # Return to a same-origin page before its /me request reads the Strict cookie.
        response = RedirectResponse(origin + "/login?" + urlencode({"google": "success", "next": next_path}), status_code=303)
        set_session_cookie(response, token)
    except (google_auth.GoogleFailure, HTTPException) as failure:
        db.rollback()
        error_code = failure.code if isinstance(failure, google_auth.GoogleFailure) else "unavailable"
        response = RedirectResponse(origin + "/login?" + urlencode({"google_error": error_code, "next": next_path}), status_code=303)
    response.delete_cookie(flow_cookie(), path="/", secure=settings.cookie_secure, httponly=True, samesite="lax")
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@router.post("/login")
def login(data: LoginInput, request: Request, response: Response, db=Depends(get_db)):
    user, token = service.login(data, session_token(request), db)
    set_session_cookie(response, token)
    return user


@router.get("/me")
def me(user=Depends(current_user)):
    return service.user_data(user)


@router.post("/logout")
def logout(request: Request, response: Response, db=Depends(get_db)):
    result = service.logout(session_token(request), db)
    delete_session_cookie(response)
    return result
