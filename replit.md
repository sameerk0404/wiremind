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
- Added Replit domain to allowedHosts in Vite config to fix "Blocked request" errors
- Updated frontend API endpoint to use Replit domain for backend communication
- Set up deployment configuration for autoscale deployment
- Created startup script to run both frontend and backend services
- Successfully imported and configured GitHub project for Replit environment
- **UI/UX Overhaul**: Completely redesigned frontend with modern, attractive hero section
- **Split-Screen Layout**: Implemented dynamic layout - input sidebar on left, wireframe display on right
- **AI Model Update**: Changed from gemini-2.5-flash-preview to gemini-1.5-flash for better reliability
- **Backend Workflow**: Set up proper backend workflow running on port 8000

## Deployment
- Target: Autoscale (stateless)
- Build: npm install
- Run: bash start.sh (starts both frontend and backend)