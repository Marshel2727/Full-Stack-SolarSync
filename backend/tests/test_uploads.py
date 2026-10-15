"""Offline upload contract tests. Run explicitly; no live database required."""
import os
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
from unittest.mock import Mock, patch

os.environ.setdefault("DB_PASSWORD", "offline-tests-only")
from fastapi import HTTPException
from fastapi.testclient import TestClient
from app.main import app
from app.routes.dependencies import optional_user, current_user
from app.utils.database import get_db
from app.utils.uploads import MAX_FILE_BYTES, validate_attachment, private_file_path, store_attachment
from app.service.installation import request_document, create_request
from app.model.schemas.installation import RequestInput

DATA = dict(fullName="Test User", phoneNumber="081234567890", email="", address="Test address",
            city="Test city", propertyType="household", plnPowerVa=2200,
            monthlyBillIdr=100000, roofAreaSqM=25, consent=True)
PNG = b"\x89PNG\r\n\x1a\n" + b"example"


class UploadTests(unittest.TestCase):
    def tearDown(self):
        app.dependency_overrides.clear()

    def test_size_extension_and_signature(self):
        self.assertEqual(validate_attachment("roof_photo", "roof.png", PNG)["mime"], "image/png")
        for kind, name, body in [("roof_photo", "roof.pdf", b"%PDF-1.7"),
                                 ("roof_photo", "roof.jpg", b"<html>not an image"),
                                 ("electricity_bill", "bill.pdf", b""),
                                 ("roof_photo", "roof.png", PNG + b"x" * MAX_FILE_BYTES)]:
            with self.assertRaises(HTTPException):
                validate_attachment(kind, name, body)

    def test_names_are_not_storage_paths(self):
        attachment = validate_attachment("roof_photo", "../../roof.png", PNG)
        self.assertEqual(attachment["name"], "roof.png")
        with TemporaryDirectory() as directory, patch("app.utils.uploads.get_settings", return_value=SimpleNamespace(upload_dir=Path(directory))):
            key = store_attachment(attachment)
            self.assertEqual(private_file_path(key).read_bytes(), PNG)
            with self.assertRaises(HTTPException):
                private_file_path("../../secret")

    def test_transaction_failure_removes_written_file(self):
        db = Mock()
        db.commit.side_effect = RuntimeError("failed commit")
        with TemporaryDirectory() as directory, patch("app.utils.uploads.get_settings", return_value=SimpleNamespace(upload_dir=Path(directory))):
            with self.assertRaises(RuntimeError):
                create_request(RequestInput(**DATA), None, db, [validate_attachment("roof_photo", "roof.png", PNG)])
            self.assertEqual(list(Path(directory).iterdir()), [])
            db.rollback.assert_called_once()

    def test_download_query_restricts_customer_ownership(self):
        db = Mock()
        db.scalar.return_value = None
        with self.assertRaises(HTTPException) as error:
            request_document("ticket", 3, SimpleNamespace(id=42, role="customer"), db)
        self.assertEqual(error.exception.status_code, 404)
        query = db.scalar.call_args.args[0]
        sql = str(query)
        self.assertIn("submitted_by_user_id", sql)
        self.assertIn("customers.user_id", sql)
        self.assertIn(42, query.compile().params.values())

    def test_guest_download_requires_login(self):
        app.dependency_overrides[get_db] = lambda: Mock()
        response = TestClient(app).get("/api/v1/requests/ticket/documents/1")
        self.assertEqual(response.status_code, 401)

    def test_multipart_reaches_service_with_actual_bytes(self):
        import json
        app.dependency_overrides[get_db] = lambda: Mock()
        app.dependency_overrides[optional_user] = lambda: None
        with patch("app.utils.upload_limit.check_upload_rate"), patch("app.routes.installation.service.create_request", return_value={"id": "ticket"}) as create:
            response = TestClient(app).post("/api/v1/requests/with-documents", headers={"Origin": "http://localhost:3000"},
                data={"data": json.dumps(DATA)}, files={"roof_photo": ("roof.png", PNG, "image/png")})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(create.call_args.args[3][0]["content"], PNG)
        self.assertEqual(response.headers["cache-control"], "no-store")

    def test_invalid_file_does_not_create_ticket(self):
        import json
        app.dependency_overrides[get_db] = lambda: Mock()
        app.dependency_overrides[optional_user] = lambda: None
        with patch("app.utils.upload_limit.check_upload_rate"), patch("app.routes.installation.service.create_request") as create:
            response = TestClient(app).post("/api/v1/requests/with-documents", headers={"Origin": "http://localhost:3000"},
                data={"data": json.dumps(DATA)}, files={"roof_photo": ("roof.jpg", b"invalid", "image/jpeg")})
        self.assertEqual(response.status_code, 422)
        create.assert_not_called()

    def test_request_limit_applies_before_multipart_parser(self):
        from app.utils.uploads import MAX_REQUEST_BYTES
        app.dependency_overrides[get_db] = lambda: Mock()
        app.dependency_overrides[optional_user] = lambda: None
        with patch("app.utils.upload_limit.check_upload_rate"), patch("app.routes.installation.service.create_request") as create:
            response = TestClient(app).post("/api/v1/requests/with-documents", headers={"Origin": "http://localhost:3000"},
                                            content=b"x" * (MAX_REQUEST_BYTES + 1))
        self.assertEqual(response.status_code, 413)
        create.assert_not_called()
