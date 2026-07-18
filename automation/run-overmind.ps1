<#
  FABLE OVERMIND V8 — Lanceur de l'agent Claude (12 sous-modules).
  Machine-independant : detecte automatiquement le dossier du projet, Node et la
  CLI Claude, et corrige au vol les chemins de l'ancienne machine dans le prompt.

  Peut etre lance seul, ou appele par run-all-agents.ps1.
#>
param([string]$Model)
$ErrorActionPreference = 'Continue'
. (Join-Path $PSScriptRoot '_lib.ps1')
$Model = Resolve-ClaudeModel $Model

$ProjectDir = Get-ProjectDir $PSScriptRoot
$LogDir     = Join-Path $ProjectDir 'automation\logs'
$PromptFile = Join-Path $ProjectDir 'automation\overmind-prompt.md'
New-Item -ItemType Directory -Force $LogDir | Out-Null

$Stamp   = New-Stamp
$LogFile = Join-Path $LogDir "overmind_$Stamp.log"

$NodeDir   = Resolve-NodeDir
$ClaudeExe = Find-Claude
$MemoryDir = Get-MemoryDir

Set-Location $ProjectDir
Write-Cycle "=== FABLE OVERMIND V8 — cycle $Stamp ===" $LogFile

if (-not $ClaudeExe) {
    Write-Cycle "ABANDON : CLI 'claude' introuvable. Installez Claude Code (npm i -g @anthropic-ai/claude-code)." $LogFile 'ERROR'
    exit 1
}
if (-not (Test-Path $PromptFile)) {
    Write-Cycle "ABANDON : prompt introuvable ($PromptFile)." $LogFile 'ERROR'
    exit 1
}

# Corrige au vol les chemins de l'ancienne machine (aucune modif du fichier source).
$prompt = Update-AgentPaths -Text (Get-Content $PromptFile -Raw) `
                            -ProjectDir $ProjectDir -NodeDir $NodeDir -MemoryDir $MemoryDir

# Mode headless : outils limites au strict necessaire, 60 tours max.
Write-Cycle "Modele Claude : $Model" $LogFile
& $ClaudeExe -p $prompt `
    --allowedTools 'WebSearch' 'WebFetch' 'Read' 'Write' 'Edit' 'Glob' 'Grep' 'Bash(npm run build:*)' 'Bash(npx vercel:*)' `
    --model $Model `
    --max-turns 60 `
    2>&1 | Tee-Object -FilePath $LogFile -Append

Write-Cycle "=== Fin Overmind : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') (exit $LASTEXITCODE) ===" $LogFile
Remove-OldLogs -LogDir $LogDir -Keep 20
