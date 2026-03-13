@echo off
echo ============================================
echo  O.L.E.A. - Oltek Logistics Extraction
echo ============================================
echo.

echo [1/2] Starting FastAPI backend (port 8000)...
start "OLEA Backend" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Vite dev server (port 5173)...
start "OLEA Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ============================================
echo  App:  http://localhost:5173
echo  API:  http://localhost:8000/docs
echo ============================================
pause
