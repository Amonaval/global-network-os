$ErrorActionPreference = 'Stop'
$root = Get-Location
$source = Join-Path $PSScriptRoot 'components\FamilySignatureExperience.tsx'
$target = Join-Path $root 'components\FamilySignatureExperience.tsx'

if (-not (Test-Path $target)) {
  throw "Target not found: $target. Run this script from the project root."
}

Copy-Item -LiteralPath $source -Destination $target -Force

$text = Get-Content -LiteralPath $target -Raw
$bad = @('t("yourFamilyTogether")','t("people")','t("addRelative")')
foreach ($token in $bad) {
  if ($text.Contains($token)) { throw "Fix verification failed: obsolete token remains: $token" }
}
$required = @('t("FamTogetherTitleTxt")','t("PeopleTxt")','t("AddRelativeTxt")')
foreach ($token in $required) {
  if (-not $text.Contains($token)) { throw "Fix verification failed: expected token missing: $token" }
}

Write-Host 'FamilySignatureExperience i18n compile fix applied and verified.' -ForegroundColor Green
Write-Host 'Now run: npm run build'
