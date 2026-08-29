$ErrorActionPreference = "Stop"

$targets = @(
  "components/FamilySignatureExperience.tsx",
  "lib/family-signature.ts",
  "scripts/mission1-signature-quality-gate.mjs"
)

Write-Host "Checking rejected Mission-1 residue..."

# Refuse destructive cleanup if active source still references the rejected signature files.
$sourceFiles = Get-ChildItem -Recurse -File -Include *.ts,*.tsx,*.mjs | Where-Object {
  $rel = $_.FullName.Substring((Get-Location).Path.Length + 1).Replace('\\','/')
  $targets -notcontains $rel -and $rel -ne "APPLY-HOTFIX.ps1"
}

$refs = $sourceFiles | Select-String -Pattern 'FamilySignatureExperience|family-signature|mission1-signature-quality-gate' -SimpleMatch:$false
if ($refs) {
  Write-Host "STOP: active references to rejected Mission-1 residue still exist:" -ForegroundColor Red
  $refs | ForEach-Object { Write-Host ("  " + $_.Path + ":" + $_.LineNumber + " " + $_.Line.Trim()) }
  Write-Host "Remove/revert those active references to the accepted STABILITY-1 behavior before deleting the residue."
  exit 1
}

foreach ($target in $targets) {
  if (Test-Path $target) {
    Remove-Item $target -Force
    Write-Host "Deleted $target"
  } else {
    Write-Host "Already absent: $target"
  }
}

Write-Host "Rejected Mission-1 signature residue cleanup complete." -ForegroundColor Green
Write-Host "Next run: npm run validate:m3"
Write-Host "Then run: npm run build"
