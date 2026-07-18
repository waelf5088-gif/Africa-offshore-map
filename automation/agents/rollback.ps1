<#
  AGENT ROLLBACK — Remet le lien Vercel de production sur le dernier deploiement SAIN
  connu (historique automation\data\deploy-history.json). A lancer manuellement en cas
  de pepin, ou appele automatiquement par le CARTOGRAPHE si la prod casse apres promotion.

  Usage : .\rollback.ps1 [-Alias africa-offshore-map.vercel.app] [-To <url-deploiement>]
#>
param(
    [string]$Alias = 'africa-offshore-map.vercel.app',
    [string]$To,
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$Scope
)
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("rollback_{0}.log" -f (New-Stamp))

$NodeDir   = Resolve-NodeDir
$vercelExe = Find-Tool -Name 'vercel' -Candidates @("$env:APPDATA\npm\vercel.cmd")
$npxExe    = Find-Tool -Name 'npx'    -Candidates @("$NodeDir\npx.cmd")
if ($vercelExe) { $vcProg = $vercelExe ; $vcPre = @() }
elseif ($npxExe) { $vcProg = $npxExe ; $vcPre = @('vercel') }
else { Write-Cycle "ROLLBACK ABANDONNE : ni 'vercel' ni 'npx'." $LogFile 'ERROR'; exit 1 }

$authArgs = @()
if ($VercelToken) { $authArgs += @('--token', $VercelToken) }
if ($Scope)       { $authArgs += @('--scope', $Scope) }

# Cible : -To explicite, sinon dernier deploiement sain de l'historique.
$target = $To
if (-not $target) {
    $current = $null
    $linkFile = Join-Path $ProjectDir 'automation\last-vercel-url.txt'
    if (Test-Path $linkFile) { $current = ((Get-Content $linkFile | Select-String 'Dernier deploiement').ToString() -split ':\s*',2)[1] }
    $target = Get-RollbackTarget -ProjectDir $ProjectDir -ExcludeUrl $current
}
if (-not $target) {
    Write-Cycle "ROLLBACK : aucune cible saine dans l'historique (automation\data\deploy-history.json)." $LogFile 'ERROR'
    exit 1
}

Write-Cycle "ROLLBACK : $Alias -> $target" $LogFile
& $vcProg @vcPre 'alias' 'set' $target $Alias @authArgs 2>&1 | Tee-Object -FilePath $LogFile -Append
Start-Sleep -Seconds 3
$h = Test-MapHealth -Url "https://$Alias"
if ($h.ok) {
    Save-VercelLink -ProjectDir $ProjectDir -Alias $Alias -DeployUrl $target | Out-Null
    Write-Cycle "ROLLBACK OK : carte de nouveau saine sur https://$Alias" $LogFile
    Send-Telegram -EnvVars $EnvVars -Text "↩️ <b>ROLLBACK</b> : $Alias restaure sur un build sain." | Out-Null
} else {
    Write-Cycle "ROLLBACK : la prod reste KO apres restauration ($($h.error))." $LogFile 'ERROR'
    Send-Telegram -EnvVars $EnvVars -Text "🔴 <b>ROLLBACK</b> : echec, la carte reste KO. Intervention manuelle requise." | Out-Null
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
