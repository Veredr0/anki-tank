# Download-TankImages.ps1
# Downloads variant-specific tank images from War Thunder wiki (primary)
# or Wikipedia (fallback) into ./images/ with filenames the game expects.
#
# Usage (run from project root):
#   Test 5 tanks:   powershell -ExecutionPolicy Bypass -File scripts\Download-TankImages.ps1
#   Custom count:   powershell -ExecutionPolicy Bypass -File scripts\Download-TankImages.ps1 -Count 20
#   All tanks:      powershell -ExecutionPolicy Bypass -File scripts\Download-TankImages.ps1 -All

param(
    [int]$Count = 5,
    [switch]$All
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$ProjectRoot = Split-Path $PSScriptRoot -Parent
$ImagesDir   = Join-Path $ProjectRoot "images"
$TanksFile   = Join-Path $ProjectRoot "tanks.js"
$UA          = 'ANKITankBot/1.0 (educational flashcard app)'

# Manual overrides: exact tank name -> WT wiki page slug(s) to try first.
# Add entries here whenever progressive shortening doesn't reach the right page.
$wtOverrides = @{
    "Panzerjager I"    = @("Panzerjager_I")
    "Panzerjager_I"    = @("Panzerjager_I")
    "Panzerjager_1"    = @("Panzerjager_I")
    "KV-2"             = @("KV-2_(1939)")
    "PT-76"            = @("PT-76B")
    "Jagdpanther"      = @("Jagdpanther_G1")
    "Type 74"          = @("Type_74_(G)")
    "STRV 103C"        = @("Strv_103C")
    "M1A2"             = @("M1A2_SEP")
    "M36 Jackson"      = @("M36B2")
    "Sd.Kfz.6/2"       = @("Sd.Kfz._6/2")
    "Matilda Mk II"    = @("Matilda_III")
    "Matilda II"       = @("Matilda_III")
    "Cromwell Mk V"    = @("Cromwell_V")
    "M13/40"           = @("M13/40_(III)")
    "Strv m/42"        = @("Strv_m/42_EH")
    "Strv 122"         = @("Strv_122A")
    "C1 Ariete"        = @("Ariete")
    "T-64A"            = @("T-64A_(1971)")
    "Crusader Mk III"  = @("Crusader_III")
    "Churchill Mk III" = @("Churchill_III")
    "Crusader Mk II"   = @("Crusader_II")
    "Type 3 Chi-Nu"    = @("Chi-Nu")
}

# ── mirrors tankImagePath() in game-ui.jsx exactly ──────────────────
function ConvertTo-TankFilename([string]$name) {
    $s = $name.ToLower()
    $s = $s -replace 'ä','a' -replace 'ö','o' -replace 'ü','u' -replace 'ß','ss'
    $s = $s -replace '\(t\)','t' -replace '\(p\)','p' -replace '\(h\)','h'
    $s = $s -replace '[^a-z0-9]+','_'
    $s = $s -replace '_+','_'
    $s = $s.Trim('_')
    return Join-Path $ImagesDir "$s.jpg"
}

# ── strip diacritics for ASCII URL construction ──────────────────────
function Remove-Diacritics([string]$s) {
    $s = $s -replace 'ä','a' -replace 'ö','o' -replace 'ü','u' -replace 'ß','ss'
    $s = $s -replace 'é','e' -replace 'è','e' -replace 'ê','e' -replace 'ë','e'
    $s = $s -replace 'â','a' -replace 'à','a' -replace 'á','a'
    $s = $s -replace 'ô','o' -replace 'ò','o' -replace 'ó','o'
    $s = $s -replace 'î','i' -replace 'ì','i' -replace 'í','i'
    $s = $s -replace 'û','u' -replace 'ù','u' -replace 'ú','u'
    $s = $s -replace 'ç','c' -replace 'ñ','n'
    return $s
}

# ── Try a single WT wiki URL slug, return CDN image URL or $null ─────
function Try-WTSlug([string]$slug) {
    try {
        $resp = Invoke-WebRequest -Uri "https://wiki.warthunder.com/$slug" `
                    -UseBasicParsing -Headers @{ 'User-Agent' = $UA } -ErrorAction Stop
        $m = [regex]::Match($resp.Content,
             'src="(https://static\.encyclopedia\.warthunder\.com/images/[^"]+\.png)"')
        if ($m.Success) { return $m.Groups[1].Value }
    } catch { }
    return $null
}

# ── PRIMARY: scrape War Thunder wiki for a variant-specific render ────
# 1. Checks manual override table first.
# 2. Falls back to progressive name shortening (drops last word on each 404).
# Returns the image URL string, or $null if not found.
function Get-WTImage([string]$tankName) {
    # Check manual override table (try stripped-diacritic name as well as original)
    $lookupKeys = @($tankName, (Remove-Diacritics $tankName))
    foreach ($key in $lookupKeys) {
        if ($wtOverrides.ContainsKey($key)) {
            foreach ($slug in $wtOverrides[$key]) {
                $url = Try-WTSlug $slug
                if ($url) { return $url }
                Start-Sleep -Milliseconds 300
            }
        }
    }

    # Progressive name shortening
    $ascii = Remove-Diacritics $tankName
    $words = $ascii -split ' '
    for ($len = $words.Count; $len -ge 1; $len--) {
        $urlName = ($words[0..($len-1)] -join '_')
        $url = Try-WTSlug $urlName
        if ($url) { return $url }
        Start-Sleep -Milliseconds 300
    }
    return $null
}

# ── FALLBACK: Wikipedia pageimages API (with 429 retry) ─────────────
# Returns @{Title; Url} or $null.
function Get-WikiImage([string]$tankName) {
    $q = [Uri]::EscapeDataString($tankName)
    for ($attempt = 1; $attempt -le 2; $attempt++) {
        try {
            $search = Invoke-RestMethod `
                -Uri "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=$q&format=json&srlimit=5" `
                -Headers @{ 'User-Agent' = $UA } -UseBasicParsing
            $results = @($search.query.search)
            if ($results.Count -eq 0) { return $null }

            # Prefer a result that shares at least one word with the tank name
            $words = ($tankName.ToLower() -replace '[^a-z0-9 ]',' ').Trim() -split '\s+' |
                     Where-Object { $_.Length -gt 1 }
            $hit = $results | Where-Object {
                $tl = $_.title.ToLower()
                $words | Where-Object { $tl.Contains($_) }
            } | Select-Object -First 1
            if (-not $hit) { $hit = $results[0] }

            $t       = [Uri]::EscapeDataString($hit.title)
            $imgData = Invoke-RestMethod `
                -Uri "https://en.wikipedia.org/w/api.php?action=query&titles=$t&prop=pageimages&format=json&pithumbsize=800" `
                -Headers @{ 'User-Agent' = $UA } -UseBasicParsing
            $page  = $imgData.query.pages.PSObject.Properties.Value | Select-Object -First 1
            $thumb = $page.thumbnail.source
            if ($thumb) { return @{ Title = $hit.title; Url = $thumb } }
            return $null
        } catch {
            if ($_.Exception.Message -match '429') {
                if ($attempt -lt 2) {
                    Write-Host "  [WP 429 - waiting 20s]" -NoNewline
                    Start-Sleep -Seconds 20
                } else {
                    Write-Host "  [WP 429 x2]" -NoNewline
                    return $null
                }
            } else {
                Write-Host "  [WP err]" -NoNewline
                return $null
            }
        }
    }
    return $null
}

# ── setup ─────────────────────────────────────────────────────────────
if (-not (Test-Path $ImagesDir)) { New-Item -ItemType Directory -Path $ImagesDir | Out-Null }

$tanksJs  = Get-Content $TanksFile -Raw -Encoding UTF8
$allNames = [regex]::Matches($tanksJs, '\{ name:"([^"]+)"') |
            ForEach-Object { $_.Groups[1].Value }

Write-Host "Found $($allNames.Count) tanks."
Write-Host ""

$limit = if ($All) { $allNames.Count } else { [Math]::Min($Count, $allNames.Count) }
$names = $allNames | Select-Object -First $limit

$skipped = 0; $fixedWT = 0; $fixedWP = 0; $failed = @()
$i = 0

foreach ($name in $names) {
    $i++
    $dest = ConvertTo-TankFilename $name

    if (Test-Path $dest) {
        Write-Host "  SKIP  [$i/$limit] $name"
        $skipped++
        continue
    }

    Write-Host "  [$i/$limit] $name" -NoNewline

    # 1. Try War Thunder wiki (variant-specific render)
    $wtUrl = Get-WTImage $name
    if ($wtUrl) {
        try {
            Invoke-WebRequest -Uri $wtUrl -OutFile $dest `
                -Headers @{ 'User-Agent' = $UA } -UseBasicParsing -ErrorAction Stop
            Write-Host "  [OK WT]"
            $fixedWT++
            Start-Sleep -Milliseconds 400
            continue
        } catch {
            Write-Host "  [WT download failed: $($_.Exception.Message)]" -NoNewline
        }
    } else {
        Write-Host "  [no WT page]" -NoNewline
    }

    # 2. Fall back to Wikipedia (longer sleep to avoid 429)
    Start-Sleep -Milliseconds 1500
    $wpResult = Get-WikiImage $name
    if ($wpResult) {
        try {
            Invoke-WebRequest -Uri $wpResult.Url -OutFile $dest `
                -Headers @{ 'User-Agent' = $UA } -UseBasicParsing -ErrorAction Stop
            Write-Host "  [OK WP: $($wpResult.Title)]"
            $fixedWP++
            Start-Sleep -Milliseconds 1500
            continue
        } catch {
            Write-Host "  [WP download failed: $($_.Exception.Message)]" -NoNewline
        }
    } else {
        Write-Host "  [no WP match]" -NoNewline
    }

    Write-Host "  [FAIL]"
    $failed += $name
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "======================================"
Write-Host "  Skipped (already local) : $skipped"
Write-Host "  Downloaded via WT wiki  : $fixedWT"
Write-Host "  Downloaded via Wikipedia: $fixedWP"
Write-Host "  Still missing           : $($failed.Count)"

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Still missing (manual follow-up):"
    foreach ($n in $failed) { Write-Host "  - $n" }
}
