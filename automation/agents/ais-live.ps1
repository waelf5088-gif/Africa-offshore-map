<#
  AGENT AIS-LIVE — Suivi AIS temps reel des navires prioritaires via AISStream.io
  (WebSocket, cle gratuite). Ecrit automation\data\ais.json. Sans cle -> skip propre.
  Necessite : AISSTREAM_API_KEY dans .env (ou variable d'env) + le venv Python du projet.
  S'appuie sur le helper ais_stream.py (installe 'websockets' au besoin dans le venv).
#>
param([int]$DurationSec = 35)
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("ais-live_{0}.log" -f (New-Stamp))

$apiKey = $EnvVars['AISSTREAM_API_KEY']; if (-not $apiKey) { $apiKey = $env:AISSTREAM_API_KEY }
if (-not $apiKey) {
    Write-Cycle "AIS-LIVE ignore : AISSTREAM_API_KEY absente (.env). Cle gratuite sur aisstream.io." $LogFile 'WARN'
    exit 0
}
$py = Find-Python
if (-not $py) { Write-Cycle "AIS-LIVE ignore : Python introuvable (venv)." $LogFile 'WARN'; exit 0 }

# S'assurer que 'websockets' est disponible dans le venv.
& $py -c "import websockets" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Cycle "Installation de 'websockets' dans le venv..." $LogFile
    & $py -m pip install --quiet websockets 2>&1 | Out-File $LogFile -Append -Encoding utf8
}

$helper = Join-Path $PSScriptRoot 'ais_stream.py'
$outFile = Join-Path $DataDir 'ais.json'
$env:AISSTREAM_API_KEY = $apiKey
Write-Cycle "AGENT AIS-LIVE : collecte AIS ($DurationSec s)..." $LogFile
& $py $helper $DurationSec $outFile 2>&1 | Tee-Object -FilePath $LogFile -Append

if (Test-Path $outFile) {
    try {
        $j = Get-Content $outFile -Raw | ConvertFrom-Json
        Write-Cycle ("AIS-LIVE OK : {0} navires vus, {1} prioritaires." -f $j.vessels_seen, $j.priority_count) $LogFile
    } catch { Write-Cycle "AIS-LIVE : sortie illisible." $LogFile 'WARN' }
} else {
    Write-Cycle "AIS-LIVE : aucune donnee produite." $LogFile 'WARN'
}
Remove-OldLogs -LogDir $LogDir -Keep 20
