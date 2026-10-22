#!/usr/bin/env bash
# Same manifest format as backup.ps1; keep output off the public web root.
set -Eeuo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
env_file=${1:-.env.vps}
compose=(docker compose -p "${COMPOSE_PROJECT_NAME:-solarsync-vps}" --env-file "$env_file" -f docker-compose.yml -f docker-compose.vps.yml)
umask 077
backup_dir=$(mktemp -d "$PWD/backups-vps-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXXXX")
id=${backup_dir##*-}
archive_container="solarsync-backup-$id"
sql_temp="/tmp/solarsync-backup-$id.sql"
paused=0
archive_created=0
cleanup() {
    local result=$?
    trap - EXIT
    if (( archive_created )); then docker rm "$archive_container" >/dev/null || true; fi
    if (( paused )); then
        "${compose[@]}" exec -T solarsync-db rm -f -- "$sql_temp" || true
        if ! "${compose[@]}" start --wait solarsync-backend; then result=1; fi
    fi
    exit "$result"
}
trap cleanup EXIT
running=$("${compose[@]}" ps --status running --services)
for service in solarsync-db solarsync-backend; do
    [[ $'\n'"$running"$'\n' == *$'\n'"$service"$'\n'* ]] || { echo "Layanan belum berjalan: $service" >&2; exit 1; }
done
"${compose[@]}" stop solarsync-backend
paused=1
"${compose[@]}" exec -T solarsync-db sh -c 'umask 077; MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --quick --hex-blob --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 -u "$MYSQL_USER" "$MYSQL_DATABASE" > "$1"' sh "$sql_temp"
"${compose[@]}" cp "solarsync-db:$sql_temp" "$backup_dir/database.sql"
archive_created=1
"${compose[@]}" run --name "$archive_container" --no-deps -T solarsync-backend python -m app.upload_archive create /tmp/uploads.tar.gz
docker cp "$archive_container:/tmp/uploads.tar.gz" "$backup_dir/uploads.tar.gz"
chmod 600 "$backup_dir/database.sql" "$backup_dir/uploads.tar.gz"
sql_hash=$(sha256sum "$backup_dir/database.sql")
upload_hash=$(sha256sum "$backup_dir/uploads.tar.gz")
printf '{"format":1,"createdAt":"%s","sha256":{"database.sql":"%s","uploads.tar.gz":"%s"}}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${sql_hash%% *}" "${upload_hash%% *}" > "$backup_dir/manifest.json"
echo "Backup lengkap: $backup_dir"
