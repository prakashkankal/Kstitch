@echo off
echo ========================================
echo Adding Windows Firewall Rules
echo ========================================
echo.

echo Adding rule for Backend (Port 5000)...
netsh advfirewall firewall add rule name="KStitch Backend Port 5000" dir=in action=allow protocol=TCP localport=5000
if %errorlevel% == 0 (
    echo [SUCCESS] Backend port 5000 allowed
) else (
    echo [ERROR] Failed to add rule for port 5000
    echo Please run this script as Administrator
    pause
    exit /b 1
)

echo.
echo Adding rule for Frontend (Port 5173)...
netsh advfirewall firewall add rule name="KStitch Vite Dev Server Port 5173" dir=in action=allow protocol=TCP localport=5173
if %errorlevel% == 0 (
    echo [SUCCESS] Frontend port 5173 allowed
) else (
    echo [ERROR] Failed to add rule for port 5173
    echo Please run this script as Administrator
    pause
    exit /b 1
)

echo.
echo ========================================
echo Firewall Rules Added Successfully!
echo ========================================
echo.
echo You can now access your app on mobile:
echo Frontend: http://192.168.31.26:5173
echo Backend:  http://192.168.31.26:5000
echo.
pause
