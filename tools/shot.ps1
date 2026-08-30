# Dev-time screenshot helper (not part of the site).
# Usage: .\tools\shot.ps1 -Page "modules/01-arrays-and-windows/kadane.html" -Name kadane -ScrollY 2400
param(
  [Parameter(Mandatory = $true)][string]$Page,
  [Parameter(Mandatory = $true)][string]$Name,
  [int]$ScrollY = 0,
  [int]$Width = 1440,
  [int]$Height = 1800,
  [string]$Theme = ""
)

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $PSScriptRoot "shots"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$target = Join-Path $root $Page
if (-not (Test-Path $target)) { throw "no such page: $target" }

# A tiny wrapper page scrolls the real page inside an iframe, so any vertical
# offset can be captured without a devtools session.
$fileUrl = ([System.Uri]$target).AbsoluteUri
$wrapper = Join-Path $out "_wrap.html"
$themeJs = if ($Theme) { "try{localStorage.setItem('dsaTheme','$Theme')}catch(e){}" } else { "" }
@"
<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;overflow:hidden}
iframe{border:0;width:${Width}px;height:24000px;position:absolute;top:-${ScrollY}px;left:0}
</style><script>$themeJs</script></head>
<body><iframe src="$fileUrl"></iframe></body></html>
"@ | Set-Content -Path $wrapper -Encoding UTF8

$wrapUrl = ([System.Uri]$wrapper).AbsoluteUri
$shot = Join-Path $out "$Name.png"
& $chrome --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files `
  --virtual-time-budget=9000 --window-size="$Width,$Height" --screenshot="$shot" $wrapUrl 2>&1 |
  Out-Null
Write-Output $shot
