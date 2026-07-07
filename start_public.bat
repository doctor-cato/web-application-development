@echo off
echo =========================================================
echo       3HD2K CINEMA - CONG CU CHIA SE WEB (PUBLIC)
echo =========================================================
echo.
echo Cong cu nay se tao ra cac duong link mien phi (localtunnel) 
echo de ban be cua ban co the truy cap vao web cua ban tu xa.
echo (Yeu cau may tinh cua ban da cai dat NodeJS/NPM)
echo.

echo 1. Dang mo duong ham cho API Backend (Port 5111)...
start cmd /k "echo Dang khoi tao Backend Tunnel... && npx localtunnel --port 5111"

echo 2. Dang mo duong ham cho Website Frontend (Port 5500 / 8080)...
set /p port="Nhap port Frontend hien tai cua ban (mac dinh Live Server la 5500, hoac 8080): "
if "%port%"=="" set port=5500
start cmd /k "echo Dang khoi tao Frontend Tunnel... && npx localtunnel --port %port%"

echo.
echo =========================================================
echo [HUONG DAN SU DUNG]
echo 1. Hai cua so CMD moi da duoc mo. Hay cho it giay, moi cua so se in ra mot duong link co dang: https://xxxx.loca.lt
echo.
echo 2. Cua so thu nhat la LINK BACKEND. Ban hay copy link do, mo file:
echo    "frontend/src/engagement/cinematch/cinematch.js" (dong 38)
echo    Sua API_URL = "LINK_BACKEND_CUA_BAN/cinematchHub" de kết nối đúng server.
echo.
echo 3. Cua so thu hai la LINK FRONTEND. Ban chi viec gui link nay 
echo    cho ban be, nguoi yeu. Ho click vao la se thay giao dien web!
echo.
echo (Luu y: Khi ban be truy cap lan dau, ho se thay man hinh canh bao
echo cua localtunnel. Ho chi can bam nut "Click to Continue" la duoc).
echo =========================================================
pause
