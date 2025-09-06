#!/bin/bash

# Install frontend dependencies
cd wireframe-frontend
npm install

# Start backend in background
cd ../wireframe-backend/Wireframe-Generator
PYTHONPATH=/home/runner/workspace python -m uvicorn app.main:app --host localhost --port 8000 &

# Start frontend on port 5000
cd ../../wireframe-frontend
npm run dev