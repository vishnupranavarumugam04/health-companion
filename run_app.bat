@echo off
title Health Companion SIH 26181 Launcher
echo ========================================================
echo Starting SIH 26181 Health Companion Application...
echo ========================================================
echo.

start "" "http://localhost:5000"

cd /d "%~dp0frontend"
npm run dev

pause
