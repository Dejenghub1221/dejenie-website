# =============================================
#  Dejenie Portfolio - Start All Services
# =============================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Dejenie Abebe Portfolio - Starting All    " -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Backend
Write-Host "  [1/3] Starting Backend Server (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\server'; node app.js" -WindowStyle Normal

Write-Host "        Waiting 3s for server to start..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 2. Start Admin
Write-Host "  [2/3] Starting Admin Panel (port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\admin'; npm run dev" -WindowStyle Normal

Write-Host "        Waiting 4s for admin to start..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# 3. Open Portfolio in browser
Write-Host "  [3/3] Opening Portfolio in browser..." -ForegroundColor Yellow
Start-Process "$root\index.html"

# 4. Open Admin in browser
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "   All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "   Portfolio  : index.html (opened in browser)" -ForegroundColor White
Write-Host "   Backend    : http://localhost:5000" -ForegroundColor White
Write-Host "   Admin      : http://localhost:5173 (opened in browser)" -ForegroundColor White
Write-Host ""
Write-Host "   Admin login: admin / admin123" -ForegroundColor Magenta
Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""
