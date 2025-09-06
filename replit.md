# Wireframe Generator - Replit Setup

## Project Overview
AI-powered fullstack web application that generates wireframes from natural language descriptions using Google's Gemini 2.5 Flash LLM and a multi-agent framework.

## Architecture
- **Frontend**: React + TypeScript + Vite + Material UI (port 5000)
- **Backend**: FastAPI + Python 3.11 + LangGraph (port 8000)
- **AI Model**: Google Gemini 2.5 Flash

## Current Setup
- Frontend configured for Replit proxy on port 5000
- Backend API on localhost:8000 
- Python dependencies installed via uv package manager
- Node.js dependencies installed via npm
- Google API key configured as environment secret

## Environment Variables
- GOOGLE_API_KEY: Required for Gemini AI model

## Recent Changes
- Configured Vite to bind to 0.0.0.0:5000 for Replit proxy compatibility
- Updated Vite config to use `allowedHosts: true` for universal proxy support
- Updated frontend API endpoint to use current Replit domain for backend communication
- Installed all Python backend dependencies via pip
- Installed all Node.js frontend dependencies via npm
- Created optimized startup script that runs both frontend and backend services
- Set up deployment configuration for autoscale deployment
- Successfully imported and configured GitHub project for Replit environment
- Verified both frontend (port 5000) and backend (port 8000) are running properly
- Google API key configured and available for Gemini AI model

## Deployment
- Target: Autoscale (stateless)
- Build: npm install
- Run: bash start.sh (starts both frontend and backend)