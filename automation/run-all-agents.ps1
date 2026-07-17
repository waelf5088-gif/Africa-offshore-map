<#
.SYNOPSIS
  FABLE — Orchestrateur PowerShell de TOUS les agents (100% local).
  Lance la chaine complete puis met a jour le lien Vercel de production.

.DESCRIPTION
  Machine-independant : detecte automatiquement le dossier du projet et les outils
  (node / npx / vercel / claude / python). Tout tourne EN LOCAL (aucune dependance
  cloud requise ; GitHub n'est utilise que pour la sauvegarde optionnelle push).

  Ordre d'execution (les agents de donnees COMPLETENT Overmind en l'alimentant) :
    FX-RATE      -> taux EUR/USD (Pricing Engine)
    METOCEAN     -> fenetres houle (PROPHET)
    TENDER-HAWK  -> signaux appels d'offres (Tender Whisperer)
    AIS-LIVE     -> positions AIS temps reel (si cle)   [maj vessels]
    PROSPECT     -> enrichissement Apollo (pipeline)    [si cle]
    OVERMIND     -> agent Claude 12 sous-modules (lit les donnees ci-dessus)
    OIOS         -> prospecteur Python (si present en local)
    SCHEMA-GUARD -> valide les donnees de la carte AVANT le build
    CARTOGRAPHE  -> build + deploiement CANARI + promotion/rollback + MAJ du lien Vercel
    WATCHTOWER   -> verifie que la carte est reellement en ligne
    SNAPSHOT-QA  -> capture visuelle (Playwright) de la carte live
    DIGEST       -> resume unique de fin de cycle (Telegram) + fraicheur
    GIT-SENTINEL -> sauvegarde git (commit + push)

  Sans parametre : lance TOUS les agents disponibles. Chacun echoue proprement.

.PARAMETER Only   Ne lancer que ces agents (noms : fx-rate metocean tender-hawk ais-live prospect overmind oios schema-guard cartographe watchtower snapshot digest git).
.PARAMETER Skip   Lancer tout SAUF ces agents.
.PARAMETER Overmind / Oios / Deploy  Raccourcis (equivalents a -Only overmind|oios|cartographe).
.PARAMETER NoDeploy   Ne pas deployer sur Vercel.
.PARAMETER SkipBuild  Deployer sans 'npm run build' prealable.
.PARAMETER Alias      Domaine de production a mettre a jour.
.PARAMETER VercelToken / Scope  Auth Vercel non-interactive.
.PARAMETER Model      Modele Claude des agents (defaut sonnet ; JAMAIS Fable).

.EXAMPLE  .\run-all-agents.ps1
.EXAMPLE  .\run-all-agents.ps1 -Only fx-rate,metocean,cartographe
.EXAMPLE  .\run-all-agents.ps1 -Skip prospect,overmind
#>
param(
    [switch]$Overmind,
    [switch]$Oios,
    [switch]$Deploy,
    [switch]$NoDeploy,
    [switch]$SkipBuild,
    [string]$Alias       = 'africa-offshore-map.vercel.app',
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$Scope,
    [string]$Model,
    [string[]]$Only,
    [string[]]$Skip = @()
)

$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot '_lib.ps1')
$Model = Resolve-ClaudeModel $Model

# --- Contexte -------------------------------------------------------------
$ProjectDir = Get-ProjectDir $PSScriptRoot
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Stamp   = New-Stamp
$LogFile = Join-Path $LogDir "agents_$Stamp.log"
Set-Location $ProjectDir

# --- Selection des agents -------------------------------------------------
# Normalise -Only/-Skip : en mode 'powershell -File', "a,b" arrive comme UNE seule
# chaine ; on redecoupe sur les virgules pour obtenir un vrai tableau.
$Only = @($Only | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })
$Skip = @($Skip | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })

# Raccourcis legacy -> -Only
$legacy = @()
if ($Overmind) { $legacy += 'overmind' }
if ($Oios)     { $legacy += 'oios' }
if ($Deploy)   { $legacy += 'cartographe' }
if ($legacy.Count -and -not $Only) { $Only = $legacy }
if ($NoDeploy) { $Skip += 'cartographe' }

function Should-Run {
    param([string]$Name)
    if ($Only) { return ([bool]($Only -contains $Name)) }
    if ($Skip -contains $Name) { return $false }
    return $true
}

$script:exitCode = 0

function Invoke-Ext {
    # Lance un agent externe du dossier agents\ avec journalisation.
    param([string]$Name, [string]$ScriptFile, [hashtable]$Params = @{})
    if (-not (Should-Run $Name)) { return }
    Write-Cycle "--- AGENT $($Name.ToUpper()) ---" $LogFile
    $p = Join-Path $PSScriptRoot "agents\$ScriptFile"
    if (-not (Test-Path $p)) { Write-Cycle "$Name ignore : agents\$ScriptFile absent." $LogFile 'WARN'; return }
    try {
        & $p @Params 2>&1 | Tee-Object -FilePath $LogFile -Append
        Write-Cycle "$Name termine (exit $LASTEXITCODE)." $LogFile
    } catch {
        Write-Cycle "$Name ERREUR : $($_.Exception.Message)" $LogFile 'ERROR'
        $script:exitCode = 1
    }
}

# --- Detection des outils -------------------------------------------------
$NodeDir   = Resolve-NodeDir
$ClaudeExe = Find-Claude
$PythonExe = Find-Python

Write-Cycle "=== FABLE — Orchestrateur agents (LOCAL) — cycle $Stamp ===" $LogFile
Write-Cycle "Projet : $ProjectDir" $LogFile
Write-Cycle ("Outils : node={0}  claude={1}  python={2}" -f `
    ($(if($NodeDir){'OK'}else{'ABSENT'})), ($(if($ClaudeExe){'OK'}else{'ABSENT'})), ($(if($PythonExe){'OK'}else{'ABSENT'}))) $LogFile
Write-Cycle "Modele Claude : $Model (garde-fou : jamais Fable)" $LogFile

# =========================================================================
# AGENTS DE DONNEES (completent Overmind en l'alimentant)
# =========================================================================
Invoke-Ext 'fx-rate'     'fx-rate.ps1'
Invoke-Ext 'metocean'    'metocean.ps1'
Invoke-Ext 'tender-hawk' 'tender-hawk.ps1'
Invoke-Ext 'ais-live'    'ais-live.ps1'
Invoke-Ext 'prospect'    'prospect-enricher.ps1'

# =========================================================================
# 5. OVERMIND (Claude CLI)
# =========================================================================
if (Should-Run 'overmind') {
    Write-Cycle "--- AGENT OVERMIND ---" $LogFile
    $overmindPs1 = Join-Path $PSScriptRoot 'run-overmind.ps1'
    if (-not $ClaudeExe) {
        Write-Cycle "Overmind ignore : CLI 'claude' introuvable (npm i -g @anthropic-ai/claude-code)." $LogFile 'WARN'
    } elseif (-not (Test-Path $overmindPs1)) {
        Write-Cycle "Overmind ignore : run-overmind.ps1 introuvable." $LogFile 'WARN'
    } else {
        try {
            & $overmindPs1 -Model $Model 2>&1 | Tee-Object -FilePath $LogFile -Append
            Write-Cycle "Overmind termine (exit $LASTEXITCODE)." $LogFile
        } catch {
            Write-Cycle "Overmind ERREUR : $($_.Exception.Message)" $LogFile 'ERROR'; $script:exitCode = 1
        }
    }
}

# =========================================================================
# 6. OIOS (prospecteur Python, en local si present)
# =========================================================================
if (Should-Run 'oios') {
    Write-Cycle "--- AGENT OIOS ---" $LogFile
    $oiosScript = Join-Path $ProjectDir 'automation\oios\daily_prospector.py'
    if (-not (Test-Path $oiosScript)) {
        Write-Cycle "OIOS ignore : $oiosScript absent en local." $LogFile 'WARN'
    } elseif (-not $PythonExe) {
        Write-Cycle "OIOS ignore : 'python' introuvable." $LogFile 'WARN'
    } else {
        try {
            & $PythonExe $oiosScript 2>&1 | Tee-Object -FilePath $LogFile -Append
            Write-Cycle "OIOS termine (exit $LASTEXITCODE)." $LogFile
        } catch { Write-Cycle "OIOS ERREUR : $($_.Exception.Message)" $LogFile 'ERROR'; $script:exitCode = 1 }
    }
}

# =========================================================================
# SCHEMA-GUARD : valide les donnees de la carte avant tout deploiement
# =========================================================================
Invoke-Ext 'schema-guard' 'schema-guard.ps1'

# =========================================================================
# CARTOGRAPHE : build + deploiement canari + promotion/rollback + maj du lien
# =========================================================================
if (Should-Run 'cartographe') {
    Write-Cycle "--- AGENT CARTOGRAPHE (deploiement canari + MAJ du lien Vercel) ---" $LogFile
    $EnvVars = Read-DotEnv $ProjectDir
    if (-not $NodeDir) {
        Write-Cycle "Cartographe ABANDONNE : Node.js introuvable (requis pour build + vercel)." $LogFile 'ERROR'; $script:exitCode = 1
    } else {
        $vercelExe = Find-Tool -Name 'vercel' -Candidates @("$env:APPDATA\npm\vercel.cmd")
        $npxExe    = Find-Tool -Name 'npx'    -Candidates @("$NodeDir\npx.cmd")
        if ($vercelExe) { $vcProg = $vercelExe ; $vcPre = @() }
        elseif ($npxExe) { $vcProg = $npxExe ; $vcPre = @('vercel') }
        else { $vcProg = $null }

        $authArgs = @()
        if ($VercelToken) { $authArgs += @('--token', $VercelToken) }
        if ($Scope)       { $authArgs += @('--scope', $Scope) }

        # 0) SCHEMA-GUARD : donnees valides AVANT de builder.
        $schema = Test-DataSchema -ProjectDir $ProjectDir
        $ready = $true
        if (-not $schema.ok) {
            $ready = $false; $script:exitCode = 1
            Write-Cycle ("Cartographe ABANDONNE : donnees invalides/manquantes -> {0}" -f ($schema.issues -join ' ; ')) $LogFile 'ERROR'
            Send-Telegram -EnvVars $EnvVars -Text ("⛔ <b>CARTOGRAPHE</b> : deploiement bloque (donnees) :`n" + ($schema.issues -join "`n")) | Out-Null
        }

        # 1) Build local.
        if ($ready -and -not $SkipBuild) {
            $npmExe = Find-Tool -Name 'npm' -Candidates @("$NodeDir\npm.cmd")
            if ($npmExe) {
                Write-Cycle "Build : npm run build ..." $LogFile
                & $npmExe run build 2>&1 | Tee-Object -FilePath $LogFile -Append
                if ($LASTEXITCODE -ne 0) { $ready = $false ; Write-Cycle "Build ECHOUE (exit $LASTEXITCODE) -> aucun deploiement." $LogFile 'ERROR' ; $script:exitCode = 1 }
            } else { Write-Cycle "npm introuvable : build local saute." $LogFile 'WARN' }
        }

        if ($ready -and -not $vcProg) {
            Write-Cycle "Cartographe ABANDONNE : ni 'vercel' ni 'npx'." $LogFile 'ERROR'; $script:exitCode = 1; $ready = $false
        }

        if ($ready) {
            # 2) Deploiement direct en PRODUCTION. (Les preview Vercel sont protegees
            #    par authentification -> non testables ; la prod, elle, est publique.)
            #    Filet de securite : verification post-deploiement + rollback automatique.
            Write-Cycle "Deploiement production : vercel deploy --prod ..." $LogFile
            $deployOut = & $vcProg @vcPre 'deploy' '--prod' '--yes' @authArgs 2>&1
            $deployOut | Tee-Object -FilePath $LogFile -Append | Out-Null
            $urlMatch = ($deployOut | Select-String -Pattern 'https://[A-Za-z0-9._-]+\.vercel\.app' -AllMatches |
                         ForEach-Object { $_.Matches } | Select-Object -Last 1)
            $deployUrl = if ($urlMatch) { $urlMatch.Value } else { $null }

            if (-not $deployUrl) {
                Write-Cycle "Deploiement : URL non detectee (verifiez 'vercel login' ou -VercelToken)." $LogFile 'ERROR'; $script:exitCode = 1
            } else {
                # 3) Verification de la PROD publique (plusieurs essais le temps de la propagation).
                Write-Cycle "Deploye : $deployUrl -> verification de https://$Alias ..." $LogFile
                $prodHealth = $null
                foreach ($try in 1..4) {
                    Start-Sleep -Seconds 5
                    $prodHealth = Test-MapHealth -Url "https://$Alias"
                    if ($prodHealth.ok) { break }
                }
                if ($prodHealth.ok) {
                    Add-DeployHistory -ProjectDir $ProjectDir -Url $deployUrl -Healthy $true
                    $linkFile = Save-VercelLink -ProjectDir $ProjectDir -Alias $Alias -DeployUrl $deployUrl
                    Write-Cycle ("CARTE A JOUR : https://$Alias (bundle {0:N0} o, lien : {1})" -f $prodHealth.asset_length, $linkFile) $LogFile
                } else {
                    # 4) ROLLBACK automatique vers le deploiement precedent.
                    Add-DeployHistory -ProjectDir $ProjectDir -Url $deployUrl -Healthy $false
                    $d = if ($prodHealth.error) { $prodHealth.error } else { "HTTP $($prodHealth.status), bundle=$($prodHealth.asset_ok)" }
                    Write-Cycle "Prod KO apres deploiement ($d) -> ROLLBACK (vercel rollback)..." $LogFile 'ERROR'
                    & $vcProg @vcPre 'rollback' '--yes' @authArgs 2>&1 | Tee-Object -FilePath $LogFile -Append
                    Start-Sleep -Seconds 5
                    $after = Test-MapHealth -Url "https://$Alias"
                    if ($after.ok) {
                        Write-Cycle "ROLLBACK OK : carte de nouveau saine sur https://$Alias" $LogFile
                        Send-Telegram -EnvVars $EnvVars -Text "🔴 <b>CARTOGRAPHE</b> : nouveau build KO -> ROLLBACK effectue, carte restauree." | Out-Null
                    } else {
                        Write-Cycle "ROLLBACK insuffisant : la carte reste KO." $LogFile 'ERROR'
                        Send-Telegram -EnvVars $EnvVars -Text "🔴 <b>CARTOGRAPHE</b> : build KO ET rollback insuffisant. Intervention manuelle requise." | Out-Null
                    }
                    $script:exitCode = 1
                }
            }
        }
    }
}

# =========================================================================
# 8-9. CONTROLE POST-DEPLOIEMENT
# =========================================================================
Invoke-Ext 'watchtower' 'watchtower.ps1'  @{ Alias = $Alias }
Invoke-Ext 'snapshot'   'snapshot-qa.ps1' @{ Alias = $Alias }

# =========================================================================
# DIGEST : resume unique de fin de cycle (Telegram) + controle de fraicheur
# =========================================================================
Invoke-Ext 'digest' 'digest.ps1'

# =========================================================================
# GIT-SENTINEL : sauvegarde (dernier, pour tout capturer)
# =========================================================================
Invoke-Ext 'git' 'git-sentinel.ps1'

# --- Cloture --------------------------------------------------------------
Write-Cycle "=== Fin du cycle (exit $script:exitCode) — $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" $LogFile
Remove-OldLogs -LogDir $LogDir -Keep 20
exit $script:exitCode
