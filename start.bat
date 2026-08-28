@echo off
echo ===================================================
echo   EcoGenius - AI Sustainability Command Center
echo ===================================================
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "EcoGenius Backend" cmd /k "C:\Users\phani\tools\python\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Starting Frontend (Next.js on http://localhost:3000)...
cd frontend
start "EcoGenius Frontend" cmd /k "C:\Users\phani\tools\node-v20.18.0-win-x64\npm.cmd run dev"

echo.
echo EcoGenius is launching!
echo Backend API: http://127.0.0.1:8000/docs
echo Frontend UI: http://localhost:3000
