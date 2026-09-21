@echo off
title Dejenie Portfolio - Start All
echo.
echo  ============================================
echo    Dejenie Abebe Portfolio - Starting All
echo  ============================================
echo.
echo  [1/3] Starting Backend Server (port 5000)...
start "Backend Server - port 5000" cmd /k "cd /d "%~dp0api" && node index.js"
echo  Waiting 3s...
timeout /t 3 /nobreak >nul

echo  [2/3] Starting Admin Panel (port 5173)...
start "Admin Panel - port 5173" cmd /k "cd /d "%~dp0admin" && npm run dev"
echo  Waiting 4s...
timeout /t 4 /nobreak >nul

echo  [3/3] Opening in browser...
start "" "http://localhost:5000"
start "" "http://localhost:5000/portfolio"
start "" "http://localhost:5173"

echo.
echo  ============================================
echo   All services started!
echo   /           → http://localhost:5000
echo   /portfolio  → http://localhost:5000/portfolio
echo   /admin      → http://localhost:5173
echo   /api        → http://localhost:5000/api
echo   Login: admin / admin123
echo  ============================================
echo.
pause
