#!/usr/bin/env bash
# O.L.E.A. - start backend + frontend
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "================================================"
echo " O.L.E.A. — Oltek Logistics Extraction Automation"
echo "================================================"

# Install and start backend
echo "[1/2] Starting FastAPI backend on :8000 ..."
cd "$SCRIPT_DIR/backend"
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

sleep 2

# Install and start frontend
echo "[2/2] Starting Vite dev server on :5173 ..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo " Open: http://localhost:5173"
echo " Docs: http://localhost:8000/docs"
echo " Ctrl+C to stop."
echo "================================================"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo Stopped." EXIT INT
wait
