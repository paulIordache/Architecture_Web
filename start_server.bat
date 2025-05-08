@echo off
start "frontend-server" cmd /k "cd /d .\frontend && npm run dev"
start "backend-server" cmd /k "cd /d .\backend && go run .\main.go"
