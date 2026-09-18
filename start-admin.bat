@echo off
title Portfolio Admin Panel
echo.
echo  ==========================================
echo   Dejenie Portfolio - Admin Panel
echo   http://localhost:5173
echo  ==========================================
echo.
cd /d "%~dp0admin"
npm run dev
pause
