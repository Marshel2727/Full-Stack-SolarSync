"""Create/clean exact disposable browser-test accounts; forbidden in production."""
import json
from pathlib import Path
import secrets
import sys

from sqlalchemy import delete, select
from app.model import User, AuthSession, InstallationRequest, RequestStatusLog, RequestDocument, StoredFile
from app.service.auth import issue_session
from app.utils.config import get_settings
from app.utils.database import SessionLocal
from app.utils.passwords import passwords


def main():
    settings = get_settings()
    if settings.app_environment not in ('development', 'test'):
        raise SystemExit('Disposable fixtures are forbidden in production.')
    if sys.argv[1] == 'create':
        tag, password = secrets.token_hex(8), secrets.token_urlsafe(32)
        with SessionLocal() as db:
            accounts = {}
            for role in ('admin', 'customer'):
                user = User(name='QA Browser ' + role, email=f'qa-e2e-{tag}-{role}@example.invalid',
                            role=role, is_active=True, password_hash=passwords.hash(password))
                db.add(user); db.flush()
                accounts[role] = dict(id=str(user.id), email=user.email)
                if role == 'customer': accounts[role]['token'] = issue_session(user, None, db)
            db.commit()
            print(json.dumps(dict(tag=tag, password=password, **accounts)))
    elif sys.argv[1] == 'cleanup':
        data = json.load(sys.stdin)
        tag = data['tag']
        if len(tag) != 16 or any(c not in '0123456789abcdef' for c in tag):
            raise SystemExit('Invalid fixture marker')
        ids = [int(data[role]['id']) for role in ('admin', 'customer')]
        emails = [f'qa-e2e-{tag}-{role}@example.invalid' for role in ('admin', 'customer')]
        with SessionLocal() as db:
            users = list(db.scalars(select(User).where(User.id.in_(ids))))
            if len(users) != 2 or {u.email for u in users} != set(emails):
                raise SystemExit('Cleanup identity mismatch; no records removed')
            tickets = list(db.scalars(select(InstallationRequest.id).where(InstallationRequest.submitted_by_user_id.in_(ids))))
            file_ids = list(db.scalars(select(StoredFile.id).where(StoredFile.uploaded_by_user_id.in_(ids))))
            files = list(db.scalars(select(StoredFile).where(StoredFile.id.in_(file_ids)))) if file_ids else []
            if tickets:
                db.execute(delete(RequestDocument).where(RequestDocument.request_id.in_(tickets)))
                db.execute(delete(RequestStatusLog).where(RequestStatusLog.request_id.in_(tickets)))
                db.execute(delete(InstallationRequest).where(InstallationRequest.id.in_(tickets)))
            if file_ids: db.execute(delete(StoredFile).where(StoredFile.id.in_(file_ids)))
            db.execute(delete(AuthSession).where(AuthSession.user_id.in_(ids)))
            db.execute(delete(User).where(User.id.in_(ids)))
            db.commit()
            root = settings.upload_dir.resolve()
            for file in files:
                path = (root/file.storage_key).resolve()
                if root not in path.parents: raise SystemExit('Unsafe upload cleanup path')
                path.unlink(missing_ok=True)
        print('Disposable browser fixtures removed.')


if __name__ == '__main__': main()
