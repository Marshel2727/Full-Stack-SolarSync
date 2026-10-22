import io
import os
from pathlib import Path
import tarfile
import tempfile
import unittest

os.environ.setdefault('DB_PASSWORD', 'offline-tests-only')
from app.upload_archive import create_archive, restore_archive


class UploadArchiveTests(unittest.TestCase):
    def test_round_trip_preserves_binary_files_and_names(self):
        with tempfile.TemporaryDirectory() as folder:
            base = Path(folder)
            source, target = base/'source', base/'target'
            (source/'nested').mkdir(parents=True)
            (source/'nested/file.bin').write_bytes(bytes(range(256)))
            archive = base/'uploads.tar.gz'
            create_archive(archive, source)
            restore_archive(archive, target)
            self.assertEqual((target/'nested/file.bin').read_bytes(), bytes(range(256)))
            with self.assertRaises(ValueError): restore_archive(archive, target)

    def test_path_traversal_and_links_are_rejected_before_extracting(self):
        for name, kind in (('../outside', tarfile.REGTYPE), ('/absolute', tarfile.REGTYPE),
                           ('C:/outside', tarfile.REGTYPE), ('link', tarfile.SYMTYPE)):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as folder:
                base = Path(folder)
                archive = base/'unsafe.tar.gz'
                with tarfile.open(archive, 'w:gz') as output:
                    member = tarfile.TarInfo(name)
                    member.type, member.size = kind, 1 if kind == tarfile.REGTYPE else 0
                    member.linkname = '/outside' if kind == tarfile.SYMTYPE else ''
                    output.addfile(member, io.BytesIO(b'x') if member.isfile() else None)
                with self.assertRaises(ValueError): restore_archive(archive, base/'target')
                self.assertFalse((base/'outside').exists())
