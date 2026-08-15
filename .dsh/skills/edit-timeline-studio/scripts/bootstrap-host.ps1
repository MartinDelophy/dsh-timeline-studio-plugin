param(
  [switch]$Install,
  [switch]$Yes
)

$ErrorActionPreference = "Stop"
$MinimumNode = [version]"22.20.0"
$MinimumPython = [version]"3.10.0"

function Get-CommandVersion([string]$Command) {
  try {
    $Output = & $Command --version 2>$null | Select-Object -First 1
    if ($Output -match '(\d+\.\d+(?:\.\d+)?)') { return [version]$Matches[1] }
  } catch {}
  return $null
}

$NodeVersion = Get-CommandVersion "node"
$PythonCommand = if (Get-Command python3 -ErrorAction SilentlyContinue) { "python3" } else { "python" }
$PythonVersion = Get-CommandVersion $PythonCommand
$NodeOk = $NodeVersion -and $NodeVersion -ge $MinimumNode
$PythonOk = $PythonVersion -and $PythonVersion -ge $MinimumPython

Write-Host "Timeline Studio language runtimes"
Write-Host ($(if ($NodeOk) { "✓ Node.js $NodeVersion" } else { "✗ Node.js $NodeVersion (requires >= $MinimumNode)" }))
Write-Host ($(if ($PythonOk) { "✓ Python $PythonVersion" } else { "✗ Python $PythonVersion (requires >= $MinimumPython)" }))
if ($NodeOk -and $PythonOk) { exit 0 }
if (-not $Install) { exit 1 }
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Error "Automatic Windows bootstrap requires winget."
  exit 2
}

Write-Host "`nProposed language-runtime changes:"
if (-not $NodeOk) { Write-Host "- winget install --id OpenJS.NodeJS.LTS --exact" }
if (-not $PythonOk) { Write-Host "- winget install --id Python.Python.3.11 --exact" }
Write-Host "No shell profile, model cache, credentials, or paid service will be changed."
if (-not $Yes) {
  $Answer = Read-Host "Apply this plan? [y/N]"
  if ($Answer -notmatch '^(y|yes)$') { exit 3 }
}
if (-not $NodeOk) { & winget install --id OpenJS.NodeJS.LTS --exact }
if (-not $PythonOk) { & winget install --id Python.Python.3.11 --exact }
Write-Host "Restart the terminal, then run: node scripts/setup-host.mjs --check"
