<#
  AGENT TENDER-HAWK — Veille appels d'offres / marches towage & marine spread
  via les flux RSS Google News (gratuit, sans cle). Detecte les nouveautes vs
  le dernier passage et peut alerter sur Telegram.
  Sortie : automation\data\tenders.json
#>
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("tender-hawk_{0}.log" -f (New-Stamp))

$queries = @(
    'offshore towage tender Africa',
    'AHTS charter Angola offshore',
    'marine spread tender Mozambique LNG',
    'tug boat charter West Africa offshore',
    'towage services tender Nigeria OR Namibia OR Senegal offshore'
)

$file = Join-Path $DataDir 'tenders.json'
$known = @{}
if (Test-Path $file) {
    try {
        (Get-Content $file -Raw | ConvertFrom-Json).items |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_.link) } |
            ForEach-Object { $known[[string]$_.link] = $true }
    } catch {}
}

$items = @()
Write-Cycle "AGENT TENDER-HAWK : $($queries.Count) requetes RSS..." $LogFile
foreach ($q in $queries) {
    try {
        $enc = [uri]::EscapeDataString($q)
        $uri = "https://news.google.com/rss/search?q=$enc&hl=en-US&gl=US&ceid=US:en"
        [xml]$rss = (Invoke-WebRequest -Uri $uri -TimeoutSec 30 -UseBasicParsing).Content
        $top = $rss.rss.channel.item | Select-Object -First 5
        foreach ($it in $top) {
            # Certains items RSS n'ont pas de lien exploitable : on les ignore.
            $link = [string]$it.link
            if ([string]::IsNullOrWhiteSpace($link)) { continue }
            $items += [pscustomobject]@{ query = $q; title = [string]$it.title; link = $link; pubDate = [string]$it.pubDate; is_new = (-not $known.ContainsKey($link)) }
        }
    } catch {
        Write-Cycle "  requete '$q' : ERREUR $($_.Exception.Message)" $LogFile 'WARN'
    }
}

# Dedupe par lien.
$items = $items | Sort-Object link -Unique
$newItems = $items | Where-Object { $_.is_new }
Write-Cycle ("TENDER-HAWK : {0} resultats, dont {1} nouveaux." -f $items.Count, $newItems.Count) $LogFile

$out = [pscustomobject]@{ source = 'Google News RSS'; fetched = (Get-Date -Format 's'); count = $items.Count; new_count = $newItems.Count; items = $items }
($out | ConvertTo-Json -Depth 5) | Out-File -FilePath $file -Encoding utf8
Write-Cycle "TENDER-HAWK OK -> $file" $LogFile

if ($newItems.Count -gt 0) {
    $msg = "🦅 <b>TENDER-HAWK</b> : $($newItems.Count) nouveau(x) signal(aux) AO towage`n`n"
    $msg += (($newItems | Select-Object -First 6 | ForEach-Object { "• $($_.title)" }) -join "`n")
    if (Send-Telegram -EnvVars $EnvVars -Text $msg) { Write-Cycle "Alerte Telegram envoyee." $LogFile }
}
Remove-OldLogs -LogDir $LogDir -Keep 20
