<#
.SYNOPSIS
  Enregistre (ou reenregistre) la tache planifiee Windows qui lance TOUS les agents
  et met a jour la carte Vercel — toutes les 2 jours a 10h00 (en local).

.DESCRIPTION
  A lancer UNE fois sur la nouvelle machine (PowerShell). Idempotent : relancer le
  script met simplement la tache a jour.

.PARAMETER TaskName   Nom de la tache (def: FABLE-Agents-Vercel).
.PARAMETER At         Heure de declenchement (def: 10:00).
.PARAMETER DaysInterval  Intervalle en jours (def: 3).
.PARAMETER VercelToken Jeton Vercel a passer aux agents (pour execution sans session).

.EXAMPLE  .\register-scheduler.ps1
.EXAMPLE  .\register-scheduler.ps1 -At 10:00 -DaysInterval 3
#>
param(
    [string]$TaskName     = 'FABLE-Agents-Vercel',
    [string]$At           = '10:00',
    [int]$DaysInterval    = 2,
    [string]$VercelToken,
    [string]$Model        = 'sonnet'
)

$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot 'run-all-agents.ps1'
if (-not (Test-Path $scriptPath)) { throw "Introuvable : $scriptPath" }

# Arguments passes a PowerShell pour lancer l'orchestrateur en tache de fond.
$psArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
if ($VercelToken) { $psArgs += " -VercelToken `"$VercelToken`"" }
if ($Model)       { $psArgs += " -Model `"$Model`"" }

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument $psArgs -WorkingDirectory $PSScriptRoot

# Declencheur : quotidien avec un intervalle de N jours, a l'heure voulue.
$trigger = New-ScheduledTaskTrigger -Daily -DaysInterval $DaysInterval -At $At

$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -WakeToRun `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -MultipleInstances IgnoreNew

$desc = "FABLE — lance tous les agents et met a jour le lien Vercel (africa-offshore-map) toutes les $DaysInterval jours a $At."
$user = "$env:USERDOMAIN\$env:USERNAME"

# S4U : la tache s'execute MEME SI la session est fermee, sans stocker de mot de passe.
# (Interactive ne se declenche que si l'utilisateur est connecte -> cycles rates.)
try {
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType S4U -RunLevel Limited
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
        -Settings $settings -Principal $principal -Description $desc -Force | Out-Null
    Write-Host "Mode : S4U (tourne meme session fermee)." -ForegroundColor Green
} catch {
    # Repli si le compte n'a pas le droit "Ouvrir une session en tant que tache".
    Write-Host "S4U refuse ($($_.Exception.Message)) -> repli en Interactive." -ForegroundColor Yellow
    $principal = New-ScheduledTaskPrincipal -UserId $user -LogonType Interactive -RunLevel Limited
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
        -Settings $settings -Principal $principal -Description $desc -Force | Out-Null
}

Write-Host "Tache planifiee '$TaskName' enregistree : toutes les $DaysInterval jours a $At." -ForegroundColor Green
Write-Host "Prochaine execution :" -NoNewline
(Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo).NextRunTime
Write-Host ""
Write-Host "Pour tester immediatement :  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Pour supprimer            :  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
