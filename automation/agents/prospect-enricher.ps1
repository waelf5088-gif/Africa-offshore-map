<#
  AGENT PROSPECT-ENRICHER — Enrichit des prospects (decideurs flotte/achats offshore)
  chez les compagnies cibles via l'API REST Apollo.io.
  Necessite une cle : APOLLO_API_KEY dans .env (ou variable d'environnement).
  Sans cle -> l'agent s'arrete proprement (n'invente rien).
  Sortie : automation\data\prospects.json

  NB : le connecteur Apollo MCP de Claude n'est utilisable QUE dans une session
  Claude interactive ; une tache planifiee locale doit passer par l'API REST.
#>
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$EnvVars    = Read-DotEnv $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("prospect-enricher_{0}.log" -f (New-Stamp))

$apiKey = $EnvVars['APOLLO_API_KEY']
if (-not $apiKey) { $apiKey = $env:APOLLO_API_KEY }
if (-not $apiKey) {
    Write-Cycle "PROSPECT-ENRICHER ignore : APOLLO_API_KEY absente (.env). Ajoutez-la pour activer l'enrichissement." $LogFile 'WARN'
    exit 0
}

# Compagnies cibles depuis .env (sinon liste par defaut).
$companies = @()
if ($EnvVars['TARGET_COMPANIES']) { $companies = $EnvVars['TARGET_COMPANIES'] -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ } }
if (-not $companies) { $companies = @('TotalEnergies','Shell','ExxonMobil','Eni','Azule Energy') }
$titles = @('fleet manager','marine manager','logistics manager','procurement manager','marine superintendent','towage')

Write-Cycle "AGENT PROSPECT-ENRICHER : recherche Apollo ($($companies.Count) societes)..." $LogFile
$headers = @{ 'Content-Type' = 'application/json'; 'Cache-Control' = 'no-cache'; 'X-Api-Key' = $apiKey }
$body = @{
    q_organization_names = ($companies | Select-Object -First 8)
    person_titles        = $titles
    page                 = 1
    per_page             = 25
} | ConvertTo-Json

try {
    $resp = Invoke-RestMethod -Uri 'https://api.apollo.io/v1/mixed_people/search' -Method Post -Headers $headers -Body $body -TimeoutSec 45
    $people = @()
    foreach ($p in $resp.people) {
        $people += [pscustomobject]@{
            name = $p.name; title = $p.title
            company = $(if ($p.organization) { $p.organization.name } else { $null })
            linkedin = $p.linkedin_url; email_status = $p.email_status
            location = (@($p.city, $p.country) -ne $null -join ', ')
        }
    }
    $out = [pscustomobject]@{ source = 'Apollo.io API'; fetched = (Get-Date -Format 's'); count = $people.Count; people = $people }
    $file = Join-Path $DataDir 'prospects.json'
    ($out | ConvertTo-Json -Depth 5) | Out-File -FilePath $file -Encoding utf8
    Write-Cycle ("PROSPECT-ENRICHER OK : {0} contacts -> {1}" -f $people.Count, $file) $LogFile
} catch {
    Write-Cycle "PROSPECT-ENRICHER ERREUR : $($_.Exception.Message)" $LogFile 'ERROR'
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
