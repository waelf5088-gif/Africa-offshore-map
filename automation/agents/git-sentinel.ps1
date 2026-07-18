<#
  AGENT GIT-SENTINEL — Sauvegarde Git automatique a chaque cycle : commit + push
  des rapports, donnees et code. Objectif : ne PLUS JAMAIS tout reperdre en
  changeant de machine.
  Securite : garantit que .env (secrets) et node_modules ne sont jamais versionnes.
#>
param([switch]$NoPush)
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("git-sentinel_{0}.log" -f (New-Stamp))

$git = (Get-Command git -ErrorAction SilentlyContinue)
if (-not $git) { Write-Cycle "GIT-SENTINEL ignore : git introuvable." $LogFile 'WARN'; exit 0 }
Set-Location $ProjectDir

# 1) .gitignore : exclure secrets + fichiers lourds (idempotent).
#    NB : @(...) force le tableau (sinon un .gitignore d'1 ligne fait une concat de
#    chaine -> tout sur une ligne), et on ecrit en ASCII SANS BOM (le BOM casse la 1re regle).
$ignoreFile = Join-Path $ProjectDir '.gitignore'
$want = @('.env','.env.*','node_modules','.venv','venv','dist','.vercel',
          'unzipped_files','automation/logs','automation/data/snapshots','*.log',
          '*.db','*.db-wal','*.db-shm')
$existing = @()
if (Test-Path $ignoreFile) { $existing = @(Get-Content $ignoreFile) }
$toAdd = $want | Where-Object { $existing -notcontains $_ }
if ($toAdd) {
    (@($existing) + $toAdd) | Set-Content -Path $ignoreFile -Encoding ascii
    Write-Cycle "Mise a jour .gitignore (+$($toAdd.Count) regles)." $LogFile
}

# 2) Depot : init si necessaire.
git rev-parse --is-inside-work-tree 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Cycle "Aucun depot : git init..." $LogFile
    git init 2>&1 | Out-File $LogFile -Append -Encoding utf8
    git symbolic-ref HEAD refs/heads/main 2>$null
}

# 3) Securite : dessuivre secrets/lourds s'ils avaient ete versionnes.
foreach ($p in @('.env','node_modules','dist','.venv')) {
    git ls-files --error-unmatch $p 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Cycle "Retrait du suivi de $p (garde le fichier local)." $LogFile 'WARN'; git rm -r --cached --quiet $p 2>&1 | Out-File $LogFile -Append -Encoding utf8 }
}

# 4) Identite locale si absente.
if (-not (git config user.email)) { git config user.email 'fable-agents@local'; git config user.name 'FABLE GIT-SENTINEL' }

# 5) Ajout + commit s'il y a des changements.
git add -A 2>&1 | Out-File $LogFile -Append -Encoding utf8
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Cycle "GIT-SENTINEL : rien a committer (deja a jour)." $LogFile
} else {
    $msg = "chore(agents): sauvegarde auto $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $msg 2>&1 | Out-File $LogFile -Append -Encoding utf8
    Write-Cycle "Commit cree : $msg" $LogFile

    # 6) Push si un remote 'origin' existe et sauf -NoPush.
    $hasOrigin = (git remote) -contains 'origin'
    if ($NoPush) {
        Write-Cycle "Push saute (-NoPush)." $LogFile
    } elseif (-not $hasOrigin) {
        Write-Cycle "Pas de remote 'origin' : commit local uniquement. Pour activer le push : git remote add origin <URL>." $LogFile 'WARN'
    } else {
        $branch = (git rev-parse --abbrev-ref HEAD).Trim()
        git push -u origin $branch 2>&1 | Out-File $LogFile -Append -Encoding utf8
        if ($LASTEXITCODE -eq 0) {
            Write-Cycle "Push OK vers origin/$branch." $LogFile
            Send-Telegram -EnvVars $EnvVars -Text "💾 <b>GIT-SENTINEL</b> : sauvegarde poussee (origin/$branch)." | Out-Null
        } else {
            Write-Cycle "Push ECHOUE : verifiez l'authentification (Git Credential Manager ou remote avec token)." $LogFile 'ERROR'
        }
    }
}
Remove-OldLogs -LogDir $LogDir -Keep 20
