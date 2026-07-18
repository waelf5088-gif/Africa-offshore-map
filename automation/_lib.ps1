<#
  _lib.ps1 — Fonctions partagees par les scripts d'automatisation FABLE.
  Dot-source ce fichier :  . (Join-Path $PSScriptRoot '_lib.ps1')

  Objectif : rendre TOUTE l'automatisation independante de la machine.
  Plus aucun chemin code en dur (fini "C:\Users\wael.fachate\...").
#>

Set-Variable -Name FABLE_OLD_ROOT   -Value 'C:\Users\wael.fachate\africa-offshore-map' -Scope Script
Set-Variable -Name FABLE_OLD_MEMORY -Value 'C:\Users\wael.fachate\.claude\projects\C--Users-wael-fachate\memory' -Scope Script
Set-Variable -Name FABLE_OLD_NODE   -Value 'C:\Users\wael.fachate\AppData\Local\node' -Scope Script

function Get-ProjectDir {
    # Le dossier du projet est le parent de \automation (ou du script appelant).
    param([string]$ScriptRoot)
    return (Split-Path -Parent $ScriptRoot)
}

function Find-Tool {
    # Cherche un executable : d'abord dans le PATH, puis dans une liste d'emplacements connus.
    param(
        [Parameter(Mandatory)][string]$Name,
        [string[]]$Candidates = @()
    )
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if ($cmd -and $cmd.Source) { return $cmd.Source }
    foreach ($p in $Candidates) {
        if ($p -and (Test-Path $p)) { return (Resolve-Path $p).Path }
    }
    return $null
}

function Resolve-NodeDir {
    # Renvoie le dossier contenant node.exe (ou $null) et l'ajoute au PATH du process.
    $nodeExe = Find-Tool -Name 'node' -Candidates @(
        "$env:ProgramFiles\nodejs\node.exe",
        "${env:ProgramFiles(x86)}\nodejs\node.exe",
        "$env:LOCALAPPDATA\node\node.exe",
        "$env:USERPROFILE\AppData\Local\node\node.exe",
        "$env:APPDATA\npm\node.exe",
        "$env:LOCALAPPDATA\Volta\bin\node.exe"
    )
    if (-not $nodeExe) {
        # Dernier recours : chercher un gestionnaire fnm.
        $fnm = Get-ChildItem "$env:LOCALAPPDATA\fnm_multishells" -Filter node.exe -Recurse -ErrorAction SilentlyContinue -Depth 3 | Select-Object -First 1
        if ($fnm) { $nodeExe = $fnm.FullName }
    }
    if (-not $nodeExe) { return $null }
    $dir = Split-Path -Parent $nodeExe
    if (($env:PATH -split ';') -notcontains $dir) { $env:PATH = "$dir;$env:PATH" }
    # Ajoute aussi le dossier des binaires npm globaux (vercel, claude...).
    $npmGlobal = "$env:APPDATA\npm"
    if ((Test-Path $npmGlobal) -and (($env:PATH -split ';') -notcontains $npmGlobal)) { $env:PATH = "$npmGlobal;$env:PATH" }
    return $dir
}

function Find-Claude {
    return (Find-Tool -Name 'claude' -Candidates @(
        "$env:APPDATA\npm\claude.cmd",
        "$env:USERPROFILE\.claude\local\claude.exe",
        "$env:USERPROFILE\.local\bin\claude.exe",
        "$env:LOCALAPPDATA\Programs\claude\claude.exe",
        "$env:LOCALAPPDATA\claude\bin\claude.exe"
    ))
}

function Find-Python {
    # Prefere le venv du projet, puis un vrai Python installe. Ignore le shim
    # WindowsApps (factice : ouvre le Microsoft Store au lieu d'executer).
    $venvPy = Join-Path (Get-ProjectDir $PSScriptRoot) '.venv\Scripts\python.exe'
    if (Test-Path $venvPy) { return (Resolve-Path $venvPy).Path }
    $installed = Get-ChildItem "$env:LOCALAPPDATA\Programs\Python" -Filter python.exe -Recurse -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending | Select-Object -First 1
    if ($installed) { return $installed.FullName }
    foreach ($p in @("$env:ProgramFiles\Python312\python.exe", "$env:ProgramFiles\Python311\python.exe")) {
        if (Test-Path $p) { return $p }
    }
    return $null
}

function Get-MemoryDir {
    # Dossier memoire Claude de la machine courante.
    $slug = 'C--' + ($env:USERPROFILE -replace '^[A-Za-z]:\\','' -replace '\\','-')
    return (Join-Path $env:USERPROFILE ".claude\projects\$slug\memory")
}

function Resolve-ClaudeModel {
    # Renvoie le modele Claude a utiliser pour les agents automatiques.
    # Ordre : parametre explicite > $env:FABLE_CLAUDE_MODEL > defaut (sonnet).
    # GARDE-FOU : refuse categoriquement Fable (jamais de modele bas de gamme).
    param([string]$Requested)
    $default = 'sonnet'   # Sonnet 5 : bon compromis pour un agent multi-tours recurrent.
    $m = $Requested
    if (-not $m) { $m = $env:FABLE_CLAUDE_MODEL }
    if (-not $m) { $m = $default }
    if ($m -match '(?i)fable') {
        Write-Host "[GARDE-FOU] Modele '$m' interdit (Fable). Bascule sur '$default'." -ForegroundColor Yellow
        $m = $default
    }
    return $m
}

function New-Stamp { return (Get-Date -Format 'yyyy-MM-dd_HHmm') }

function Write-Cycle {
    # Ecrit un message horodate a la fois a l'ecran et dans le log.
    param([string]$Message, [string]$LogFile, [string]$Level = 'INFO')
    $line = ('[{0}] [{1}] {2}' -f (Get-Date -Format 'HH:mm:ss'), $Level, $Message)
    Write-Host $line
    if ($LogFile) { $line | Out-File -FilePath $LogFile -Append -Encoding utf8 }
}

function Update-AgentPaths {
    # Remplace au vol les chemins de l'ancienne machine par ceux de la machine courante.
    param([string]$Text, [string]$ProjectDir, [string]$NodeDir, [string]$MemoryDir)
    $out = $Text
    $out = $out.Replace($script:FABLE_OLD_ROOT,   $ProjectDir)
    $out = $out.Replace($script:FABLE_OLD_MEMORY, $MemoryDir)
    if ($NodeDir) { $out = $out.Replace($script:FABLE_OLD_NODE, $NodeDir) }
    return $out
}

function Save-VercelLink {
    # Ecrit le lien Vercel courant dans le dossier (automation\last-vercel-url.txt).
    param([string]$ProjectDir, [string]$Alias, [string]$DeployUrl)
    $file = Join-Path $ProjectDir 'automation\last-vercel-url.txt'
    $content = @(
        "Lien Vercel de production : https://$Alias",
        "Dernier deploiement       : $DeployUrl",
        "Mis a jour le             : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    ) -join [Environment]::NewLine
    $content | Out-File -FilePath $file -Encoding utf8
    return $file
}

function Remove-OldLogs {
    param([string]$LogDir, [int]$Keep = 20)
    Get-ChildItem $LogDir -Filter '*.log' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip $Keep |
        Remove-Item -Force -Confirm:$false -ErrorAction SilentlyContinue
}

function Get-DataDir {
    # Dossier de sortie commun des agents (automation\data).
    param([string]$ProjectDir)
    $d = Join-Path $ProjectDir 'automation\data'
    New-Item -ItemType Directory -Force $d | Out-Null
    return $d
}

function Read-DotEnv {
    # Parse le .env du projet en table de hachage (cles/valeurs).
    param([string]$ProjectDir)
    $vars = @{}
    $f = Join-Path $ProjectDir '.env'
    if (Test-Path $f) {
        foreach ($line in Get-Content $f) {
            $t = $line.Trim()
            if (-not $t -or $t.StartsWith('#')) { continue }
            $i = $t.IndexOf('=')
            if ($i -lt 1) { continue }
            $k = $t.Substring(0, $i).Trim()
            $v = $t.Substring($i + 1).Trim().Trim('"').Trim("'")
            $vars[$k] = $v
        }
    }
    return $vars
}

function Send-Telegram {
    # Envoie un message texte Telegram si les identifiants existent. Renvoie $true/$false.
    param([hashtable]$EnvVars, [string]$Text)
    $token = $EnvVars['TELEGRAM_BOT_TOKEN']; $chat = $EnvVars['TELEGRAM_CHAT_ID']
    if (-not $token -or -not $chat) { return $false }
    try {
        Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method Post `
            -Body @{ chat_id = $chat; text = $Text; parse_mode = 'HTML'; disable_web_page_preview = 'true' } `
            -TimeoutSec 30 | Out-Null
        return $true
    } catch { return $false }
}

function Send-TelegramPhoto {
    # Envoie une photo Telegram via curl.exe (present sur Windows 10+). Renvoie $true/$false.
    param([hashtable]$EnvVars, [string]$PhotoPath, [string]$Caption = '')
    $token = $EnvVars['TELEGRAM_BOT_TOKEN']; $chat = $EnvVars['TELEGRAM_CHAT_ID']
    if (-not $token -or -not $chat -or -not (Test-Path $PhotoPath)) { return $false }
    if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) { return $false }
    & curl.exe -s -F "chat_id=$chat" -F "photo=@$PhotoPath" -F "caption=$Caption" `
        "https://api.telegram.org/bot$token/sendPhoto" | Out-Null
    return ($LASTEXITCODE -eq 0)
}

function Test-MapHealth {
    # Controle de sante d'une carte deployee : page 200 + <div id=root> + bundle JS charge.
    # Utilise par WATCHTOWER et par le deploiement canari du CARTOGRAPHE.
    param([string]$Url, [int]$TimeoutSec = 30)
    $r = [pscustomobject]@{ url = $Url; status = 0; has_root = $false; asset_url = $null
                            asset_ok = $false; asset_length = 0; ok = $false; error = $null }
    try {
        $resp = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing
        $r.status = [int]$resp.StatusCode
        $html = $resp.Content
        $r.has_root = ($html -match 'id="root"')
        $m = [regex]::Match($html, 'src="(?<u>/assets/[^"]+\.js)"')
        if ($m.Success) {
            $base = $Url.TrimEnd('/')
            $r.asset_url = "$base$($m.Groups['u'].Value)"
            try {
                $a = Invoke-WebRequest -Uri $r.asset_url -TimeoutSec ($TimeoutSec + 15) -UseBasicParsing
                $r.asset_length = [int]$a.RawContentLength
                if (-not $r.asset_length) { $r.asset_length = $a.Content.Length }
                $r.asset_ok = ([int]$a.StatusCode -eq 200 -and $r.asset_length -gt 1000)
            } catch { $r.error = "bundle JS injoignable : $($_.Exception.Message)" }
        } else { $r.error = 'aucun bundle /assets/*.js reference' }
    } catch {
        $r.error = $_.Exception.Message
        if ($_.Exception.Response) { try { $r.status = [int]$_.Exception.Response.StatusCode } catch {} }
    }
    $r.ok = ($r.status -eq 200 -and $r.has_root -and $r.asset_ok)
    return $r
}

function Add-DeployHistory {
    # Historise un deploiement (pour le rollback). Garde les 12 derniers.
    param([string]$ProjectDir, [string]$Url, [bool]$Healthy)
    $f = Join-Path (Get-DataDir $ProjectDir) 'deploy-history.json'
    $hist = @()
    if (Test-Path $f) { try { $hist = @(Get-Content $f -Raw | ConvertFrom-Json) } catch {} }
    $entry = [pscustomobject]@{ url = $Url; healthy = $Healthy; ts = (Get-Date -Format 's') }
    $hist = @($entry) + $hist | Select-Object -First 12
    ($hist | ConvertTo-Json -Depth 4) | Out-File -FilePath $f -Encoding utf8
}

function Get-RollbackTarget {
    # Renvoie l'URL du dernier deploiement SAIN different de $ExcludeUrl (cible de rollback).
    param([string]$ProjectDir, [string]$ExcludeUrl)
    $f = Join-Path (Get-DataDir $ProjectDir) 'deploy-history.json'
    if (-not (Test-Path $f)) { return $null }
    try { $hist = @(Get-Content $f -Raw | ConvertFrom-Json) } catch { return $null }
    return ($hist | Where-Object { $_.healthy -and $_.url -ne $ExcludeUrl } |
            Select-Object -First 1 -ExpandProperty url -ErrorAction SilentlyContinue)
}

function Test-DataSchema {
    # Valide les JSON de donnees de la carte AVANT le build (existence, JSON valide,
    # lat/lon plausibles). Empeche de deployer une carte cassee.
    param([string]$ProjectDir)
    $res = [pscustomobject]@{ ok = $true; checked = @(); issues = @() }
    $dataDir  = Join-Path $ProjectDir 'src\data'
    $required = @('projects.json','mining_terminals.json','wind_projects.json','ports.json')
    foreach ($name in $required) {
        $f = Join-Path $dataDir $name
        if (-not (Test-Path $f)) { $res.issues += "manquant: src\data\$name"; $res.ok = $false; continue }
        try {
            $json = Get-Content $f -Raw | ConvertFrom-Json
            $res.checked += $name
            foreach ($item in @($json)) {
                if ($null -ne $item.lat -and ($item.lat -lt -90  -or $item.lat -gt 90 )) { $res.issues += "${name}: lat hors bornes ($($item.lat))"; $res.ok = $false }
                if ($null -ne $item.lon -and ($item.lon -lt -180 -or $item.lon -gt 180)) { $res.issues += "${name}: lon hors bornes ($($item.lon))"; $res.ok = $false }
            }
        } catch { $res.issues += "JSON invalide: $name"; $res.ok = $false }
    }
    return $res
}
