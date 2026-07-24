Add-Type -AssemblyName System.Drawing

function New-GradientPackPng {
  param(
    [string]$Path,
    [string]$Title,
    [string]$Subtitle,
    [int]$Width = 1024,
    [int]$Height = 1280
  )

  $bmp = New-Object System.Drawing.Bitmap $Width, $Height
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $c1 = [System.Drawing.ColorTranslator]::FromHtml("#061412")
  $c2 = [System.Drawing.ColorTranslator]::FromHtml("#0E2A26")
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
    (New-Object System.Drawing.Point 0,0),
    (New-Object System.Drawing.Point 0,$Height),
    $c1, $c2
  )
  $g.FillRectangle($brush, 0, 0, $Width, $Height)

  $accent = [System.Drawing.ColorTranslator]::FromHtml("#2EE6C5")
  $pen = [System.Drawing.Pen]::new($accent, 4.0)
  $margin = 48
  $g.DrawRectangle($pen, $margin, $margin, $Width - 2*$margin, $Height - 2*$margin)

  $cx = [int]($Width/2)
  $cy = [int]($Height*0.42)
  $pts = @(
    (New-Object System.Drawing.Point $cx, ($cy-160)),
    (New-Object System.Drawing.Point ($cx+140), $cy),
    (New-Object System.Drawing.Point $cx, ($cy+160)),
    (New-Object System.Drawing.Point ($cx-140), $cy)
  )
  $fillColor = [System.Drawing.Color]::FromArgb(40, $accent.R, $accent.G, $accent.B)
  $fill = [System.Drawing.SolidBrush]::new($fillColor)
  $g.FillPolygon($fill, $pts)
  $g.DrawPolygon($pen, $pts)

  $titleFont = New-Object System.Drawing.Font "Segoe UI Semibold", 42, ([System.Drawing.FontStyle]::Bold)
  $subFont = New-Object System.Drawing.Font "Segoe UI", 20
  $brandFont = New-Object System.Drawing.Font "Segoe UI", 16
  $white = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#E8FBF7"))
  $muted = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#8AA39C"))
  $accentBrush = [System.Drawing.SolidBrush]::new($accent)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center

  $g.DrawString("STABLE PACKS", $brandFont, $accentBrush, (New-Object System.Drawing.RectangleF 60, 80, ($Width-120), 40), $sf)
  $g.DrawString($Title, $titleFont, $white, (New-Object System.Drawing.RectangleF 70, ($Height*0.62), ($Width-140), 120), $sf)
  $g.DrawString($Subtitle, $subFont, $muted, (New-Object System.Drawing.RectangleF 90, ($Height*0.74), ($Width-180), 100), $sf)

  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose(); $bmp.Dispose(); $brush.Dispose(); $pen.Dispose(); $fill.Dispose()
  $titleFont.Dispose(); $subFont.Dispose(); $brandFont.Dispose(); $white.Dispose(); $muted.Dispose(); $accentBrush.Dispose(); $sf.Dispose()
  Write-Host "wrote $Path"
}

function New-SimpleMark {
  param([string]$Path, [string]$Label, [int]$Size = 256)
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml("#0B1211"))
  $accent = [System.Drawing.ColorTranslator]::FromHtml("#2EE6C5")
  $pen = [System.Drawing.Pen]::new($accent, 6.0)
  $g.DrawEllipse($pen, 28, 28, ($Size-56), ($Size-56))
  $font = New-Object System.Drawing.Font "Segoe UI Semibold", 28, ([System.Drawing.FontStyle]::Bold)
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#E8FBF7"))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $g.DrawString($Label, $font, $brush, (New-Object System.Drawing.RectangleF 0,0,$Size,$Size), $sf)
  $dir = Split-Path $Path -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $pen.Dispose(); $font.Dispose(); $brush.Dispose(); $sf.Dispose()
}

$packs = @(
  @{ File="ai-pack-category-signal.png"; Title="Remittance Rails"; Sub="Cross-border USD₮ corridors" },
  @{ File="magic-seven-category-signal.png"; Title="Merchant Checkout"; Sub="Commerce settlement" },
  @{ File="dividend-leaders-category-signal.png"; Title="Payroll Flow"; Sub="Recurring salary rails" },
  @{ File="future-tech-category-signal.png"; Title="Treasury Desk"; Sub="Institutional dollar liquidity" },
  @{ File="quantum-frontier-pack.png"; Title="FX Corridor"; Sub="Routes into USD₮" },
  @{ File="space-economy-pack.png"; Title="Commerce Layer"; Sub="Daily e-commerce settlement" },
  @{ File="crypto-rails-pack.png"; Title="Settlement Core"; Sub="Fast clearing rails" },
  @{ File="cloud-defense-pack.png"; Title="Savings Buffer"; Sub="Cash management reserves" },
  @{ File="semiconductor-backbone-pack.png"; Title="Payment Mesh"; Sub="Interconnected payment hops" },
  @{ File="market-core-pack.png"; Title="Dollar Anchor"; Sub="Broad USD₮ exposure" },
  @{ File="macro-shield-pack.png"; Title="Inflation Shield"; Sub="Macro dollar hedges" }
)

foreach ($p in $packs) {
  New-GradientPackPng -Path (Join-Path "site\packfolio" $p.File) -Title $p.Title -Subtitle $p.Sub
}

New-GradientPackPng -Path "site\packfolio\how-it-works\pack-lineup.png" -Title="Dollar Themes" -Subtitle="Stable Packs lineup" -Width 1600 -Height 900
New-SimpleMark -Path "site\packfolio\how-it-works\usdg.png" -Label "USDT"
New-SimpleMark -Path "site\packfolio\how-it-works\ethereum.png" -Label "USDT"
New-SimpleMark -Path "site\brand\robinhood-feather-square.png" -Label "S" -Size 128

# Logo
$logoPath = "site\packfoliotransparent.png"
$bmp = New-Object System.Drawing.Bitmap 640, 128
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#071411"))
$accent = [System.Drawing.ColorTranslator]::FromHtml("#2EE6C5")
$pen = [System.Drawing.Pen]::new($accent, 4.0)
$g.DrawEllipse($pen, 24, 32, 64, 64)
$font = New-Object System.Drawing.Font "Segoe UI Semibold", 36, ([System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#E8FBF7"))
$g.DrawString("Stable Packs", $font, $brush, 110, 40)
$bmp.Save($logoPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $pen.Dispose(); $font.Dispose(); $brush.Dispose()
Write-Host "wrote $logoPath"

$markLabels = @{
  "nvidia.svg"="REM"; "amd.svg"="PAY"; "micron.svg"="STL"; "apple.svg"="MER"
  "microsoft.svg"="FX"; "amazon.svg"="COM"; "meta.svg"="TR"; "tesla.svg"="BUF"
  "google.svg"="ANC"; "johnson-johnson.svg"="INF"; "procter-gamble.svg"="USD"
  "coca-cola.svg"="USDT"; "pepsico.png"="MESH"; "spacex.svg"="COR"; "ionq.png"="SET"
  "qbts.png"="RAIL"; "rgti.png"="CASH"; "qubt.png"="FLOW"; "rklb.png"="DESK"
  "asts.png"="GATE"; "lunr.png"="NODE"; "rdw.png"="ROUTE"; "coin.png"="USDT"
  "mstr.png"="USD"; "crcl.png"="P2P"; "iren.png"="TX"; "clsk.png"="FEE"
  "crwd.png"="SAFE"; "now.png"="NOW"; "ddog.png"="OBS"; "zs.png"="ZRO"
  "mdb.png"="DB"; "avgo.png"="CHIP"; "tsm.png"="FAB"; "asml.png"="LIT"
  "qcom.png"="SIG"; "amat.png"="MAT"; "qqq.svg"="IDX"; "state-street.svg"="SS"
  "ishares.svg"="ETF"; "uscf.svg"="OIL"
}

foreach ($key in $markLabels.Keys) {
  $label = $markLabels[$key]
  $out = Join-Path "site\packfolio\marks" $key
  $ext = [IO.Path]::GetExtension($key)
  if ($ext -eq ".svg") {
    $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="12" fill="#0B1211"/>
  <circle cx="32" cy="32" r="18" stroke="#2EE6C5" stroke-width="2"/>
  <text x="32" y="37" text-anchor="middle" fill="#E8FBF7" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="700">$label</text>
</svg>
"@
    Set-Content -Path $out -Value $svg -Encoding UTF8
  } else {
    New-SimpleMark -Path $out -Label $label -Size 256
  }
}

New-GradientPackPng -Path "site\video\packfoliomain-poster.png" -Title="Stable Packs" -Subtitle="Open packs. Settle in dollars." -Width 1920 -Height 1080
Copy-Item "site\video\packfoliomain-poster.png" "site\video\packfoliomain-poster.webp" -Force

Write-Host "assets done"
