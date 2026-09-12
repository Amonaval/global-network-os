param(
  [string]$RepoRoot = "."
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path $RepoRoot).Path
$list = Join-Path $root "DOCUMENTATION-ROOT-REMOVE.txt"
if (!(Test-Path $list)) { throw "Missing DOCUMENTATION-ROOT-REMOVE.txt. Extract the documentation patch into the repository root first." }
$removed = 0
Get-Content $list | ForEach-Object {
  $name = $_.Trim()
  if ($name) {
    $p = Join-Path $root $name
    if (Test-Path $p -PathType Leaf) {
      Remove-Item -LiteralPath $p -Force
      $removed++
    }
  }
}
Write-Host "Documentation cleanup complete. Removed $removed obsolete/historical root copies."
Write-Host "Historical copies remain under archive/. Start at DOCUMENTATION.md."
