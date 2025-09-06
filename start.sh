#!/bin/bash

# Start backend in background
cd wireframe-backend/Wireframe-Generator
PYTHONPATH=/home/runner/workspace python -m uvicorn app.main:app --host localhost --port 8000 &
BACKEND_PID=$!

# Start frontend on port 5000
cd ../../wireframe-frontend
npm run dev

# Clean up backend when frontend exits
kill $BACKEND_PID 2>/dev/null