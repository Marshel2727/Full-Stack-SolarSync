#!/usr/bin/env bash
# First deployment only: import a verified Windows/Linux backup into EMPTY data.
set -Eeuo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
backup_dir=$(cd -- "${1:?Gunakan: bash ops/restore-vps.sh /path/backup [.env.vps]}" && pwd)
env_file=${2:-.env.vps}
compose=(docker compose -p "${COMPOSE_PROJECT_NAME:-solarsync-vps}" --env-file "$env_file" -f docker-compose.yml -f docker-compose.vps.yml)

for name in manifest.json database.sql uploads.tar.gz; do
    [[ -f "$backup_dir/$name" ]] || { echo "Backup tidak lengkap: $name" >&2; exit 1; }
done
running=$("${compose[@]}" ps --status running --services)
if [[ $'\n'"$running"$'\n' == *$'\nsolarsync-backend\n'* ]]; then
    echo 'Backend harus berhenti. Impor ini hanya untuk instalasi baru dengan database kosong.' >&2
    exit 1
fi
tables=$("${compose[@]}" exec -T solarsync-db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" -D "$MYSQL_DATABASE" -Nse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE()"')
[[ "$tables" == 0 ]] || { echo 'Ditolak: database sudah berisi tabel. Tidak ada data yang ditimpa.' >&2; exit 1; }

# Validate both hashes, archive members, and the empty destination before SQL.
# Maintenance-only root can read a private 0700 host backup without relaxing it.
"${compose[@]}" run --rm --no-deps -T --user 0 -v "$backup_dir:/restore:ro" solarsync-backend python - <<'PY'
import hashlib
import json
import tarfile
from pathlib import Path, PurePosixPath
from app.utils.config import get_settings
root = Path('/restore')
manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8-sig'))
if manifest.get('format') != 1:
    raise SystemExit('Format backup tidak didukung')
for name in ('database.sql', 'uploads.tar.gz'):
    with (root / name).open('rb') as source:
        actual = hashlib.file_digest(source, 'sha256').hexdigest()
    if actual != str(manifest.get('sha256', {}).get(name, '')).lower():
        raise SystemExit('Checksum backup tidak cocok: ' + name)
destination = get_settings().upload_dir
if destination.exists() and any(destination.iterdir()):
    raise SystemExit('Ditolak: folder upload tidak kosong')
with tarfile.open(root / 'uploads.tar.gz', 'r:gz') as archive:
    for member in archive.getmembers():
        path = PurePosixPath(member.name)
        if (path.is_absolute() or '..' in path.parts or '\\' in member.name
                or ':' in member.name or not member.isfile() or not path.parts):
            raise SystemExit('Arsip upload tidak aman')
print('Checksum, arsip, dan tujuan kosong terverifikasi.')
PY
"${compose[@]}" exec -T solarsync-db sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --default-character-set=utf8mb4 -u "$MYSQL_USER" "$MYSQL_DATABASE"' < "$backup_dir/database.sql"
# Stream bytes to the normal app user; extracted files must never become root-owned.
"${compose[@]}" run --rm --no-deps -T solarsync-backend python -c '
import shutil, sys, tempfile
from pathlib import Path
from app.upload_archive import restore_archive
from app.utils.config import get_settings
with tempfile.TemporaryDirectory() as work:
    archive = Path(work) / "uploads.tar.gz"
    with archive.open("wb") as target:
        shutil.copyfileobj(sys.stdin.buffer, target)
    restore_archive(archive, get_settings().upload_dir)
print("Upload dipulihkan sebagai pengguna aplikasi.")
' < "$backup_dir/uploads.tar.gz"
"${compose[@]}" run --rm --no-deps -T solarsync-backend python -m alembic upgrade head
echo 'Impor selesai. Jalankan backend sesuai panduan. Akun, konten, dan upload dari backup sudah dipulihkan.'
