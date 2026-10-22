[CmdletBinding()]
param([string]$Destination = '', [string]$EnvFile = '.env', [switch]$Production)
. (Join-Path $PSScriptRoot 'common.ps1')
Push-Location $OpsRoot
$id = [guid]::NewGuid().ToString('N')
$archiveContainer = "solarsync-backup-$id"
$sqlTemp = "/tmp/solarsync-backup-$id.sql"
$paused = $false
$archiveCreated = $false
$compose = @('compose', '--env-file', $EnvFile, '-f', 'docker-compose.yml')
if ($Production) { $compose += @('-f', 'docker-compose.production.yml') }
try {
    if (-not $Destination) { $Destination = Join-Path $OpsRoot ("backups/" + (Get-Date -Format 'yyyyMMdd-HHmmss') + "-$($id.Substring(0,8))") }
    if (-not [IO.Path]::IsPathRooted($Destination)) { $Destination = Join-Path $OpsRoot $Destination }
    $target = [IO.Path]::GetFullPath($Destination)
    if (Test-Path -LiteralPath $target) { throw 'Gunakan folder tujuan baru agar backup lama tidak tertimpa.' }
    $status = & docker @compose ps --status running --services
    if ($LASTEXITCODE -ne 0 -or $status -notcontains 'solarsync-backend' -or $status -notcontains 'solarsync-db') {
        throw 'Database dan backend harus berjalan sebelum backup.'
    }
    New-Item -ItemType Directory -Path $target | Out-Null
    # Stop writes briefly so SQL and uploaded files belong to one consistent snapshot.
    Invoke-DockerChecked ($compose + @('stop', 'solarsync-backend'))
    $paused = $true
    $dump = 'umask 077; MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --quick --hex-blob --no-tablespaces --set-gtid-purged=OFF --default-character-set=utf8mb4 -u "$MYSQL_USER" "$MYSQL_DATABASE" > ' + $sqlTemp
    Invoke-DockerChecked ($compose + @('exec', '-T', 'solarsync-db', 'sh', '-c', $dump))
    Invoke-DockerChecked ($compose + @('cp', "solarsync-db:$sqlTemp", (Join-Path $target 'database.sql')))
    $archiveCreated = $true
    Invoke-DockerChecked ($compose + @('run', '--name', $archiveContainer, '--no-deps', 'solarsync-backend', 'python', '-m', 'app.upload_archive', 'create', '/tmp/uploads.tar.gz'))
    Invoke-DockerChecked @('cp', "${archiveContainer}:/tmp/uploads.tar.gz", (Join-Path $target 'uploads.tar.gz'))
    $hashes = [ordered]@{}
    foreach ($name in @('database.sql','uploads.tar.gz')) { $hashes[$name] = (Get-FileHash -LiteralPath (Join-Path $target $name) -Algorithm SHA256).Hash }
    $manifest = [ordered]@{ format=1; createdAt=[DateTime]::UtcNow.ToString('o'); sha256=$hashes }
    [IO.File]::WriteAllText((Join-Path $target 'manifest.json'), ($manifest | ConvertTo-Json -Depth 4), [Text.UTF8Encoding]::new($false))
    Write-Output "Backup lengkap: $target"
} finally {
    if ($archiveCreated) { & docker rm $archiveContainer | Out-Null }
    if ($paused) {
        & docker @compose exec -T solarsync-db rm -f -- $sqlTemp
        Invoke-DockerChecked ($compose + @('start', '--wait', 'solarsync-backend'))
    }
    Pop-Location
}
