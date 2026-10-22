$ErrorActionPreference = 'Stop'
$OpsRoot = Split-Path -Parent $PSScriptRoot

function Invoke-DockerChecked {
    param([Parameter(Mandatory=$true)][string[]]$Arguments)
    & docker @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Docker gagal (exit $LASTEXITCODE)." }
}

function Get-BackupManifest {
    param([Parameter(Mandatory=$true)][string]$Path)
    $resolved = (Resolve-Path -LiteralPath $Path).Path
    $manifestPath = Join-Path $resolved 'manifest.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Manifest backup tidak ditemukan.' }
    $manifest = [IO.File]::ReadAllText($manifestPath) | ConvertFrom-Json
    if ($manifest.format -ne 1) { throw 'Format backup tidak didukung.' }
    foreach ($name in @('database.sql', 'uploads.tar.gz')) {
        $file = Join-Path $resolved $name
        if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Berkas backup tidak lengkap: $name" }
        $expected = $manifest.sha256.PSObject.Properties[$name].Value
        if (-not $expected -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $expected) {
            throw "Checksum backup tidak cocok: $name"
        }
    }
    return $resolved
}
