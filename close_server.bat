@echo off
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im go.exe >nul 2>&1
taskkill /f /fi "windowtitle eq frontend-server" >nul 2>&1
taskkill /f /fi "windowtitle eq backend-server" >nul 2>&1
