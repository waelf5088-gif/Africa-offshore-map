<#
  AGENT FX-RATE — Taux EUR/USD du jour (donnees BCE via Frankfurter, gratuit, sans cle).
  Sert au Pricing Engine (conversions Leo/AES Monaco 8000 $/j, etc.).
  Sortie : automation\data\fx-rate.json
#>
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("fx-rate_{0}.log" -f (New-Stamp))

Write-Cycle "AGENT FX-RATE : recuperation EUR/USD..." $LogFile
try {
    $fx   = Invoke-RestMethod -Uri 'https://api.frankfurter.app/latest?from=EUR&to=USD' -TimeoutSec 30
    $rate = [double]$fx.rates.USD
    $out  = [pscustomobject]@{
        pair    = 'EUR/USD'
        rate    = $rate
        usd_per_eur = $rate
        eur_per_usd = [math]::Round(1 / $rate, 4)
        rate_date = $fx.date
        source  = 'BCE via api.frankfurter.app'
        fetched = (Get-Date -Format 's')
    }
    $file = Join-Path $DataDir 'fx-rate.json'
    ($out | ConvertTo-Json) | Out-File -FilePath $file -Encoding utf8
    Write-Cycle ("FX-RATE OK : 1 EUR = {0} USD ({1}) -> {2}" -f $rate, $fx.date, $file) $LogFile
} catch {
    Write-Cycle "FX-RATE ERREUR : $($_.Exception.Message)" $LogFile 'ERROR'
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
