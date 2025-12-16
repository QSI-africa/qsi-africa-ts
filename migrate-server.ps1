# Migration Script - Copy and convert JS files to TS
# This script copies files from the original project and renames .js to .ts and .jsx to .tsx

$sourceRoot = "c:\Users\Admin\Documents\qsi-interactive-solution"
$destRoot = "c:\Users\Admin\Documents\qsi-africa-ts"

# Copy server service files
Write-Host "Copying server services..." -ForegroundColor Green
Copy-Item "$sourceRoot\server\src\services\*.js" "$destRoot\server\src\services\" -Force
Get-ChildItem "$destRoot\server\src\services\*.js" | Rename-Item -NewName { $_.Name -replace '\.js$','.ts' }

# Copy server utils files
Write-Host "Copying server utils..." -ForegroundColor Green
Copy-Item "$sourceRoot\server\src\utils\*.js" "$destRoot\server\src\utils\" -Force
Get-ChildItem "$destRoot\server\src\utils\*.js" | Rename-Item -NewName { $_.Name -replace '\.js$','.ts' }

# Copy server controllers
Write-Host "Copying server controllers..." -ForegroundColor Green
Copy-Item "$sourceRoot\server\src\controllers\*.js" "$destRoot\server\src\controllers\" -Force
Get-ChildItem "$destRoot\server\src\controllers\*.js" | Rename-Item -NewName { $_.Name -replace '\.js$','.ts' }

# Copy server API routes
Write-Host "Copying server API routes..." -ForegroundColor Green
Copy-Item "$sourceRoot\server\src\api\*.js" "$destRoot\server\src\api\" -Force
Get-ChildItem "$destRoot\server\src\api\*.js" | Rename-Item -NewName { $_.Name -replace '\.js$','.ts' }

Write-Host "Server files copied and renamed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: These files still need TypeScript type annotations added manually." -ForegroundColor Yellow
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update require() to import statements" -ForegroundColor Yellow
Write-Host "2. Add type annotations for function parameters and return types" -ForegroundColor Yellow
Write-Host "3. Replace module.exports with export/export default" -ForegroundColor Yellow
