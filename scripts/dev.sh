#!/bin/sh
# SkillMatch full-stack preview: FastAPI backend + Vite dev server.
# The Vite dev server proxies /api to the backend (see vite.config.js).

BACKEND_PORT="${BACKEND_PORT:-8000}"

# Install backend dependencies on first run (idempotent)
if ! python3 -c "import fastapi, uvicorn, sqlalchemy, jose, passlib, pypdf, docx" >/dev/null 2>&1; then
  echo "[dev.sh] Installing backend dependencies..."
  pip3 install -r backend/requirements.txt --quiet || pip3 install -r backend/requirements.txt --user --quiet
fi

echo "[dev.sh] Starting FastAPI backend on :${BACKEND_PORT}..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port "${BACKEND_PORT}" &

echo "[dev.sh] Starting Vite dev server on 0.0.0.0..."
exec npm run dev -- --host 0.0.0.0 --port "${PORT:-5173}"
