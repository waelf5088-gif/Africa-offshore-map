<#
  AGENT SCHEMA-GUARD — Valide les JSON de donnees de la carte (existence, JSON valide,
  lat/lon plausibles) AVANT tout build/deploiement. Empeche de publier une carte cassee.
  Le CARTOGRAPHE appelle la meme verif ; cet agent permet un controle isole + alerte.
  Sortie : automation\data\schema-check.json
#>
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("schema-guard_{0}.log" -f (New-Stamp))

Write-Cycle "AGENT SCHEMA-GUARD : validation des donnees src\data..." $LogFile
$res = Test-DataSchema -ProjectDir $ProjectDir
$out = [pscustomobject]@{ ok = $res.ok; checked = $res.checked; issues = $res.issues; checked_at = (Get-Date -Format 's') }
($out | ConvertTo-Json -Depth 4) | Out-File -FilePath (Join-Path $DataDir 'schema-check.json') -Encoding utf8

if ($res.ok) {
    Write-Cycle ("SCHEMA-GUARD OK : {0} fichier(s) valides ({1})." -f $res.checked.Count, ($res.checked -join ', ')) $LogFile
} else {
    Write-Cycle ("SCHEMA-GUARD ALERTE : {0} probleme(s) -> {1}" -f $res.issues.Count, ($res.issues -join ' ; ')) $LogFile 'ERROR'
    Send-Telegram -EnvVars $EnvVars -Text ("⛔ <b>SCHEMA-GUARD</b> : donnees carte invalides :`n" + ($res.issues -join "`n")) | Out-Null
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
