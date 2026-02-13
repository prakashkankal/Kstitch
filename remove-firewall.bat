@echo off
echo ========================================
echo Removing KStitch Firewall Rules
echo ========================================
echo.

echo Removing rule for Backend (Port 5000)...
netsh advfirewall firewall delete rule name="KStitch Backend Port 5000"
if %errorlevel% == 0 (
    echo [SUCCESS] Backend rule removed
) else (
    echo [WARNING] Rule might not exist
)

echo.
echo Removing rule for Frontend (Port 5173)...
netsh advfirewall firewall delete rule name="KStitch Vite Dev Server Port 5173"
if %errorlevel% == 0 (
    echo [SUCCESS] Frontend rule removed
) else (
    echo [WARNING] Rule might not exist
)

echo.
echo ========================================
echo Firewall Rules Removed
echo ========================================
echo.
pause
