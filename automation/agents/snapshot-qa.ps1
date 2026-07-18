<#
  AGENT SNAPSHOT-QA — Capture de la carte live apres deploiement, envoyee sur Telegram.
  v2 : privilegie Playwright (rend le WebGL de MapLibre -> carte visible), avec repli
  sur Edge/Chrome headless si Playwright indisponible. Conserve les 10 dernieres captures.
  Sortie : automation\data\snapshots\map_<stamp>.png
#>
param(
    [string]$Alias = 'africa-offshore-map.vercel.app',
    [int]$WaitMs   = 9000
)
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
$SnapDir    = Join-Path (Get-DataDir $ProjectDir) 'snapshots'
New-Item -ItemType Directory -Force $LogDir  | Out-Null
New-Item -ItemType Directory -Force $SnapDir | Out-Null
$LogFile = Join-Path $LogDir ("snapshot-qa_{0}.log" -f (New-Stamp))

$url = "https://$Alias"
$png = Join-Path $SnapDir ("map_{0}.png" -f (New-Stamp))
$done = $false

# --- Voie 1 : Playwright (WebGL OK) ---
$py = Find-Python
if ($py) {
    & $py -c "import playwright" 2>$null
    if ($LASTEXITCODE -eq 0) {
        $helper = Join-Path $PSScriptRoot 'snapshot.py'
        Write-Cycle "AGENT SNAPSHOT-QA : capture via Playwright de $url ..." $LogFile
        & $py $helper $url $png $WaitMs 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
        if ((Test-Path $png) -and (Get-Item $png).Length -gt 0) { $done = $true }
        else { Write-Cycle "Playwright n'a pas produit d'image, repli navigateur..." $LogFile 'WARN' }
    } else {
        Write-Cycle "Playwright non installe (pip install playwright), repli navigateur..." $LogFile 'WARN'
    }
}

# --- Voie 2 : Edge/Chrome headless (repli ; canvas parfois noir) ---
if (-not $done) {
    $browser = $null
    foreach ($p in @(
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
    )) { if (Test-Path $p) { $browser = $p; break } }
    if (-not $browser) {
        Write-Cycle "SNAPSHOT-QA ignore : ni Playwright, ni Edge, ni Chrome." $LogFile 'WARN'
        exit 0
    }
    Write-Cycle "AGENT SNAPSHOT-QA : capture via $(Split-Path -Leaf $browser) (repli) de $url ..." $LogFile
    & $browser --headless=new --hide-scrollbars --no-sandbox `
        --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader `
        --window-size=1600,1000 --virtual-time-budget=$WaitMs `
        --screenshot="$png" $url 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
    Start-Sleep -Milliseconds 500
    if ((Test-Path $png) -and (Get-Item $png).Length -gt 0) { $done = $true }
}

if ($done) {
    Write-Cycle ("SNAPSHOT-QA OK -> {0} ({1:N0} octets)" -f $png, (Get-Item $png).Length) $LogFile
    $cap = "🗺️ Carte FABLE live — $url ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
    if (Send-TelegramPhoto -EnvVars $EnvVars -PhotoPath $png -Caption $cap) { Write-Cycle "Capture envoyee sur Telegram." $LogFile }
} else {
    Write-Cycle "SNAPSHOT-QA : la capture a echoue." $LogFile 'ERROR'
    exit 1
}

Get-ChildItem $SnapDir -Filter 'map_*.png' | Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 10 | Remove-Item -Force -Confirm:$false -ErrorAction SilentlyContinue
Remove-OldLogs -LogDir $LogDir -Keep 20
