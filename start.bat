@echo off
echo ==========================================
echo    KHOI DONG HE THONG 3HD2K CINEMA
echo ==========================================
echo.

echo [1/4] Dang xoa cac tien trinh cu bi ket...
taskkill /F /IM appweb.exe /T >nul 2>&1
taskkill /F /IM dotnet.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

:: Lay dia chi IPv4 cua may
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "LOCAL_IP=%%a"
)
:: Xoa khoang trang dau
for /f "tokens=* delims= " %%b in ("%LOCAL_IP%") do set "LOCAL_IP=%%b"

:: 1. Chay Backend (.NET API) - da bind 0.0.0.0:5111
echo [2/4] Dang khoi dong Backend API (port 5111)...
cd backend
start "3HD2K Backend API" cmd /k "dotnet run"
cd ..

:: Doi 5 giay de Backend API khoi dong hoan tat
echo [3/4] Doi Backend khoi dong...
timeout /t 5 /nobreak >nul

:: 2. Chay Frontend - bind 0.0.0.0 de truy cap tu mang LAN
echo [4/4] Dang khoi dong Frontend Server (port 8080)...
start "3HD2K Frontend Server" cmd /k "npx http-server frontend/src -a 0.0.0.0 -p 8080 -c-1 -o --proxy http://127.0.0.1:5111"

echo.
echo ==========================================
echo    HOAN TAT! HE THONG DA SAN SANG
echo ==========================================
echo.
echo    TRUY CAP TREN MAY NAY:
echo      http://127.0.0.1:8080
echo.
echo    CHIA SE CHO BAN BE (cung mang WiFi/LAN):
echo      http://%LOCAL_IP%:8080
echo.
echo    (De tat he thong, chi can dong cac cua so cmd mau den)
echo ==========================================
pause
