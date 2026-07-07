@echo off
set "ROOT_DIR=c:\Users\Le Minh Khuong 1\web-application-development\web-application-development"

:: Start Backend
cd /d "%ROOT_DIR%\backend"
start /B dotnet run

:: Start Frontend
cd /d "%ROOT_DIR%\frontend"
start /B npx http-server -p 8080 -c-1 --proxy http://localhost:5111
