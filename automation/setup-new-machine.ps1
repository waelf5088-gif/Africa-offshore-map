<#
.SYNOPSIS
  Prepare une NOUVELLE machine Windows pour l'automatisation FABLE.
  A lancer une seule fois apres avoir change d'ordinateur.

.DESCRIPTION
  Installe / verifie les prerequis, installe les dependances du projet, puis
  (optionnel) enregistre la tache planifiee (tous les 3 jours a 10h).
  - Node.js LTS      (via winget)      -> requis pour build + vercel
  - Vercel CLI       (npm i -g vercel) -> requis pour mettre a jour le lien Vercel
  - Claude CLI       (npm i -g @anthropic-ai/claude-code) -> requis pour l'agent Overmind
  N'installe QUE ce qui manque. Ne casse rien si deja present.

.PARAMETER SkipClaude   Ne pas installer la CLI Claude (si vous ne lancez pas Overmind).
.PARAMETER RegisterTask Enregistre aussi la tache planifiee a la fin.

.EXAMPLE  .\setup-new-machine.ps1
.EXAMPLE  .\setup-new-machine.ps1 -RegisterTask
#>
param(
    [switch]$SkipClaude,
    [switch]$RegisterTask
)

$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot '_lib.ps1')
$ProjectDir = Get-ProjectDir $PSScriptRoot

function Test-Cmd { param($n) return [bool](Get-Command $n -ErrorAction SilentlyContinue) }

Write-Host "=== FABLE — Configuration de la nouvelle machine ===" -ForegroundColor Cyan
Write-Host "Projet : $ProjectDir`n"

# --- 1) Node.js ----------------------------------------------------------
if (Resolve-NodeDir) {
    Write-Host "[OK ] Node.js present : $(node -v)" -ForegroundColor Green
} else {
    Write-Host "[...] Node.js absent — installation via winget..." -ForegroundColor Yellow
    if (Test-Cmd winget) {
        winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
        Write-Host "    -> FERMEZ puis ROUVREZ PowerShell pour recharger le PATH, et relancez ce script." -ForegroundColor Yellow
        return
    } else {
        Write-Host "[!! ] winget introuvable. Installez Node.js LTS manuellement : https://nodejs.org" -ForegroundColor Red
        return
    }
}

# --- 2) Dependances du projet -------------------------------------------
Write-Host "[...] Installation des dependances npm du projet..." -ForegroundColor Yellow
Push-Location $ProjectDir
npm install
Pop-Location

# --- 3) Vercel CLI -------------------------------------------------------
if (Test-Cmd vercel) {
    Write-Host "[OK ] Vercel CLI presente." -ForegroundColor Green
} else {
    Write-Host "[...] Installation de la Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# --- 4) Claude CLI (agent Overmind) -------------------------------------
if ($SkipClaude) {
    Write-Host "[--] Claude CLI ignoree (-SkipClaude)." -ForegroundColor DarkGray
} elseif (Find-Claude) {
    Write-Host "[OK ] Claude CLI presente." -ForegroundColor Green
} else {
    Write-Host "[...] Installation de la Claude CLI..." -ForegroundColor Yellow
    npm install -g @anthropic-ai/claude-code
}

# --- 5) Rappels manuels --------------------------------------------------
Write-Host "`n=== Etapes manuelles restantes ===" -ForegroundColor Cyan
Write-Host "1. Connectez la CLI Vercel a votre compte :"
Write-Host "     vercel login"
Write-Host "2. Reliez le dossier au projet Vercel (recree le .vercel de cette machine) :"
Write-Host "     cd `"$ProjectDir`" ; vercel link"
Write-Host "   (projet : africa-offshore-map)"
if (-not $SkipClaude) {
    Write-Host "3. Authentifiez la CLI Claude : lancez 'claude' une fois et suivez la connexion."
}
Write-Host "4. Testez la mise a jour de la carte Vercel :"
Write-Host "     .\run-all-agents.ps1 -Deploy"

# --- 6) Tache planifiee --------------------------------------------------
if ($RegisterTask) {
    Write-Host "`n[...] Enregistrement de la tache planifiee (tous les 3 jours a 10h)..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot 'register-scheduler.ps1')
} else {
    Write-Host "`nPour automatiser (tous les 3 jours a 10h) :  .\register-scheduler.ps1" -ForegroundColor Cyan
}
