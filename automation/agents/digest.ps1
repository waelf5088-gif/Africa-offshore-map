<#
  AGENT DIGEST — Resume UNIQUE de fin de cycle envoye sur Telegram : etat de la carte,
  taux du jour, meilleures fenetres meteo, nouveaux appels d'offres, dernier deploiement.
  Integre FRESHNESS : alerte si un flux de donnees n'a pas ete rafraichi depuis > N jours.
  Sortie : automation\data\digest.txt (+ message Telegram)
#>
param([int]$StaleDays = 4)
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("digest_{0}.log" -f (New-Stamp))

function Read-Json { param($Name) $f = Join-Path $DataDir $Name; if (Test-Path $f) { try { return (Get-Content $f -Raw | ConvertFrom-Json) } catch {} } return $null }

$lines = @("📋 <b>FABLE — Synthese du cycle</b>", (Get-Date -Format 'yyyy-MM-dd HH:mm'))

# Carte
$up = Read-Json 'uptime.json'
if ($up) { $lines += ($(if ($up.ok) { "🟢 Carte en ligne (bundle {0:N0} o)" -f $up.asset_length } else { "🔴 Carte KO : $($up.error)" })) }

# Taux
$fx = Read-Json 'fx-rate.json'
if ($fx) { $lines += "💶 EUR/USD : $($fx.rate) ($($fx.rate_date))" }

# Meteo : zones les plus favorables
$mo = Read-Json 'metocean.json'
if ($mo -and $mo.zones) {
    $best = $mo.zones | Sort-Object good_days_5 -Descending | Select-Object -First 3
    $parts = foreach ($z in $best) {
        $short = ($z.zone -split '\(')[0].Trim()
        "$short $($z.good_days_5)j/5"
    }
    $lines += "🌊 Fenetres towage : " + ($parts -join ' · ')
}

# Appels d'offres
$td = Read-Json 'tenders.json'
if ($td) { $lines += "🦅 Appels d'offres : $($td.count) suivis, $($td.new_count) nouveaux" }

# Dernier deploiement
$linkFile = Join-Path $ProjectDir 'automation\last-vercel-url.txt'
if (Test-Path $linkFile) { $lines += "🚀 " + ((Get-Content $linkFile | Select-String 'Dernier deploiement') -replace '\s+', ' ') }

# FRESHNESS : flux perimes ?
$stale = @()
foreach ($n in 'fx-rate.json','metocean.json','tenders.json','uptime.json') {
    $f = Join-Path $DataDir $n
    if (Test-Path $f) {
        $age = (New-TimeSpan -Start (Get-Item $f).LastWriteTime -End (Get-Date)).TotalDays
        if ($age -gt $StaleDays) { $stale += ("{0} ({1:N0} j)" -f $n, $age) }
    } else { $stale += "$n (absent)" }
}
if ($stale.Count) { $lines += "⚠️ Donnees perimees : " + ($stale -join ', ') }

$text = $lines -join "`n"
$text | Out-File -FilePath (Join-Path $DataDir 'digest.txt') -Encoding utf8
Write-Cycle "DIGEST prepare ($($lines.Count) lignes)." $LogFile
if (Send-Telegram -EnvVars $EnvVars -Text $text) { Write-Cycle "DIGEST envoye sur Telegram." $LogFile } else { Write-Cycle "DIGEST : Telegram non configure, resume dans data\digest.txt." $LogFile 'WARN' }
Remove-OldLogs -LogDir $LogDir -Keep 20
