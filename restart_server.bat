@echo off
echo Restarting backend...

:: Kill the Go process and its terminal
taskkill /f /im go.exe >nul 2>&1
taskkill /f /fi "windowtitle eq backend-server" >nul 2>&1

:: Optional short delay to ensure cleanup
timeout /t 1 >nul

:: Restart backend
start "backend-server" cmd /k "cd /d .\backend && go run .\main.go"

echo Backend restarted.
