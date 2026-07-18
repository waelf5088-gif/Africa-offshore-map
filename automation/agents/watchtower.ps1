<#
  AGENT WATCHTOWER — Verifie que la carte Vercel est REELLEMENT en ligne
  (page 200 + <div id=root> + bundle JS charge, via Test-MapHealth partage).
  Alerte Telegram uniquement si la carte est vraiment cassee.
  Sortie : automation\data\uptime.json
#>
param([string]$Alias = 'africa-offshore-map.vercel.app')
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("watchtower_{0}.log" -f (New-Stamp))

$url = "https://$Alias"
Write-Cycle "AGENT WATCHTOWER : verification de $url ..." $LogFile
$h = Test-MapHealth -Url $url

$out = [pscustomobject]@{
    url = $h.url; status = $h.status; ok = $h.ok; has_root = $h.has_root
    asset_url = $h.asset_url; asset_ok = $h.asset_ok; asset_length = $h.asset_length
    error = $h.error; checked = (Get-Date -Format 's')
}
($out | ConvertTo-Json) | Out-File -FilePath (Join-Path $DataDir 'uptime.json') -Encoding utf8

if ($h.ok) {
    Write-Cycle ("WATCHTOWER OK : carte en ligne (HTTP {0}, bundle {1:N0} octets)" -f $h.status, $h.asset_length) $LogFile
} else {
    $detail = if ($h.error) { $h.error } else { "HTTP $($h.status), root=$($h.has_root), bundle=$($h.asset_ok)" }
    Write-Cycle "WATCHTOWER ALERTE : la carte est CASSEE — $detail" $LogFile 'ERROR'
    if (Send-Telegram -EnvVars $EnvVars -Text "🚨 <b>WATCHTOWER</b> : la carte Vercel est CASSEE`n$url`n$detail") { Write-Cycle "Alerte Telegram envoyee." $LogFile }
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
