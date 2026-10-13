@echo off
echo ===================================================
echo   Starting Surplus-To-Shelter Web Platform...
echo ===================================================
echo.
echo 1. Opening website in your default browser...
start http://localhost:3000
echo.
echo 2. Launching Backend (Port 5000) and Frontend (Port 3000)...
npm run dev
pause
