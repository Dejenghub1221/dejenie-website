@echo off
title Dejenie Portfolio - Start All

echo.
echo  ============================================
echo    Dejenie Abebe Portfolio - Starting All
echo  ============================================
echo.
echo  [1/3] Starting Backend Server (port 5000)...
start "Backend Server - port 5000" cmd /k "cd /d "%~dp0server" && node app.js"

echo  Waiting for server to initialize...
timeout /t 3 /nobreak >nul

echo  [2/3] Starting Admin Panel (port 5173)...
start "Admin Panel - port 5173" cmd /k "cd /d "%~dp0admin" && npm run dev"

echo  Waiting for admin to initialize...
timeout /t 4 /nobreak >nul

echo  [3/3] Opening Portfolio in browser...
start "" "%~dp0index.html"

echo.
echo  ============================================
echo   All services started!
echo.
echo   Portfolio  : index.html (opened in browser)
echo   Backend    : http://localhost:5000
echo   Admin      : http://localhost:5173
echo.
echo   Admin login: admin / admin123
echo  ============================================
echo.
echo  You can close this window.
pause
