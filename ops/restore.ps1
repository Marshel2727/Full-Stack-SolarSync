[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$BackupPath,
    [string]$Project = ("solarsync-restore-" + [guid]::NewGuid().ToString('N').Substring(0,8)),
    [string]$EnvFile = '.env'
)
. (Join-Path $PSScriptRoot 'common.ps1')
Push-Location $OpsRoot
$archiveContainer = "$Project-uploads"
$archiveCreated = $false
try {
    if ($Project -notmatch '^solarsync-restore-[a-z0-9-]{4,40}$') { throw 'Pemulihan hanya boleh memakai project baru dengan awalan solarsync-restore-.' }
    $source = Get-BackupManifest $BackupPath
    $existing = & docker ps -a --filter "label=com.docker.compose.project=$Project" --format '{{.ID}}'
    if ($LASTEXITCODE -ne 0 -or $existing) { throw 'Project tujuan sudah memiliki container; pemulihan dibatalkan.' }
    $volumes = & docker volume ls --filter "label=com.docker.compose.project=$Project" --format '{{.Name}}'
    if ($LASTEXITCODE -ne 0 -or $volumes) { throw 'Project tujuan sudah memiliki volume; pemulihan dibatalkan.' }
    $compose = @('compose', '--env-file', $EnvFile, '-f', 'docker-compose.yml', '-p', $Project)
    Invoke-DockerChecked ($compose + @('up', '-d', '--wait', 'solarsync-db', 'solarsync-auth-store', 'solarsync-cache'))
    Invoke-DockerChecked ($compose + @('cp', (Join-Path $source 'database.sql'), 'solarsync-db:/tmp/solarsync-restore.sql'))
    Invoke-DockerChecked ($compose + @('exec', '-T', 'solarsync-db', 'sh', '-c', 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --default-character-set=utf8mb4 -u "$MYSQL_USER" "$MYSQL_DATABASE" < /tmp/solarsync-restore.sql'))
    Invoke-DockerChecked ($compose + @('exec', '-T', 'solarsync-db', 'rm', '-f', '--', '/tmp/solarsync-restore.sql'))
    $archiveCreated = $true
    Invoke-DockerChecked ($compose + @('run', '--name', $archiveContainer, '--no-deps', '-v', "${source}:/backup:ro", 'solarsync-backend',
        'python', '-m', 'app.upload_archive', 'restore', '/backup/uploads.tar.gz'))
    Invoke-DockerChecked @('rm', $archiveContainer)
    $archiveCreated = $false
    Invoke-DockerChecked ($compose + @('run', '--rm', '--no-deps', 'solarsync-backend', 'python', '-m', 'alembic', 'upgrade', 'head'))
    $verify = 'from app.utils.database import SessionLocal; from app.service.health import readiness; from sqlalchemy import text; from app.utils.config import get_settings; db=SessionLocal(); print(readiness(db)); print({t:db.scalar(text("SELECT COUNT(*) FROM "+t)) for t in ("users","customers","installation_requests","solar_systems")}); print("Upload files:",sum(p.is_file() for p in get_settings().upload_dir.rglob("*"))); db.close()'
    Invoke-DockerChecked ($compose + @('run', '--rm', '--no-deps', 'solarsync-backend', 'python', '-c', $verify))
    Write-Output "Pemulihan berhasil di project terisolasi $Project. Database utama tidak diubah."
    Write-Output "Sesudah diperiksa, hapus hanya project uji ini dengan: docker compose --env-file $EnvFile -p $Project down -v"
} finally {
    if ($archiveCreated) { & docker rm $archiveContainer | Out-Null }
    Pop-Location
}
