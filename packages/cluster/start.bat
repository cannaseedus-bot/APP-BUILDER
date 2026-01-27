@echo off
echo ========================================
echo   MX2LM.APP - K'UHUL BOOTLOADER
echo ========================================
echo.

echo Starting K'UHUL Runtime...
timeout /t 2 /nobreak > nul

echo Launching HTTP Server...
start /B node server.js

echo Opening Browser...
timeout /t 1 /nobreak > nul
start http://localhost:8080

echo.
echo ✅ System is running at: http://localhost:8080
echo 🌐 Access via: https://mx2lm.app
echo.
echo Press Ctrl+C to stop the server
pause