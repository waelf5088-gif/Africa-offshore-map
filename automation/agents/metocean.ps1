<#
  AGENT METOCEAN — Fenetres meteo/houle de towage sur les zones offshore cles
  (Open-Meteo Marine API, gratuit, sans cle). Alimente les predictions PROPHET.
  Regle simple : fenetre "OK" si houle max <= 2.5 m.
  Sortie : automation\data\metocean.json
#>
$ErrorActionPreference = 'Continue'
. (Join-Path (Split-Path -Parent $PSScriptRoot) '_lib.ps1')
$ProjectDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DataDir    = Get-DataDir $ProjectDir
$LogDir     = Join-Path $ProjectDir 'automation\logs'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("metocean_{0}.log" -f (New-Stamp))

# Zones offshore suivies (approx.).
$zones = @(
    @{ name = 'Baleine P3 (Cote d''Ivoire)'; lat = 4.6;   lon = -4.5  },
    @{ name = 'Afungi / Mozambique LNG';      lat = -10.9; lon = 40.6  },
    @{ name = 'Kaminho / Angola';             lat = -8.8;  lon = 12.8  },
    @{ name = 'Venus / Namibie';              lat = -22.5; lon = 12.0  },
    @{ name = 'GTA (Senegal/Mauritanie)';     lat = 16.1;  lon = -16.9 },
    @{ name = 'Bonga / Nigeria';              lat = 4.0;   lon = 5.0   }
)

$threshold = 2.5
$results = @()
Write-Cycle "AGENT METOCEAN : houle sur $($zones.Count) zones..." $LogFile
foreach ($z in $zones) {
    try {
        $uri = "https://marine-api.open-meteo.com/v1/marine?latitude=$($z.lat)&longitude=$($z.lon)&daily=wave_height_max&forecast_days=5&timezone=UTC"
        $r = Invoke-RestMethod -Uri $uri -TimeoutSec 30
        $days = @()
        for ($i = 0; $i -lt $r.daily.time.Count; $i++) {
            $h = $r.daily.wave_height_max[$i]
            $days += [pscustomobject]@{ date = $r.daily.time[$i]; wave_max_m = $h; window_ok = ($h -le $threshold) }
        }
        $okCount = ($days | Where-Object { $_.window_ok }).Count
        $results += [pscustomobject]@{ zone = $z.name; lat = $z.lat; lon = $z.lon; days = $days; good_days_5 = $okCount }
        Write-Cycle ("  {0} : {1}/5 jours favorables (<= {2} m)" -f $z.name, $okCount, $threshold) $LogFile
    } catch {
        Write-Cycle "  $($z.name) : ERREUR $($_.Exception.Message)" $LogFile 'WARN'
    }
}

if ($results.Count) {
    $out = [pscustomobject]@{ threshold_m = $threshold; source = 'Open-Meteo Marine API'; fetched = (Get-Date -Format 's'); zones = $results }
    $file = Join-Path $DataDir 'metocean.json'
    ($out | ConvertTo-Json -Depth 6) | Out-File -FilePath $file -Encoding utf8
    Write-Cycle "METOCEAN OK -> $file" $LogFile
} else {
    Write-Cycle "METOCEAN : aucune donnee recuperee." $LogFile 'ERROR'
    exit 1
}
Remove-OldLogs -LogDir $LogDir -Keep 20
