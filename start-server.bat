@echo off
title Portfolio Backend Server
echo.
echo  ==========================================
echo   Dejenie Portfolio - Backend Server
echo   http://localhost:5000
echo  ==========================================
echo.
cd /d "%~dp0api"
node index.js
pause
