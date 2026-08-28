Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  EcoGenius - AI Sustainability Command Center" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Starting Backend (FastAPI on http://127.0.0.1:8000)..." -ForegroundColor Green

Start-Process powershell -ArgumentList '-NoExit', '-Command', `
    'cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload'

Write-Host ""
Write-Host "Starting Frontend (Next.js on http://localhost:3000)..." -ForegroundColor Green

Start-Process powershell -ArgumentList '-NoExit', '-Command', `
    'cd frontend; npm run dev'

Write-Host ""
Write-Host "EcoGenius is launching!" -ForegroundColor Cyan
Write-Host "Backend API: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor White
Write-Host "WebSockets: ws://127.0.0.1:8000/ws/agent-events" -ForegroundColor White