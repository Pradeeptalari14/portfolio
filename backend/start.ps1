# Talari Pradeep Studios Hub — One-Command Companion Stack Quickstart (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Talari Pradeep Studios Hub Companion Infrastructure..." -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

# 1. Start Docker Compose Stack
docker compose up -d

Write-Host "⏳ Waiting for PostgreSQL + pgvector and Companion API to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Run Database Seeding if Python is available
try {
    python scripts/seed_studios.py
} catch {
    Write-Host "⚠️ Seeding skipped or Python dependencies not in host environment. Database will initialize on first API request." -ForegroundColor Gray
}

Write-Host "✅ Companion Stack is live!" -ForegroundColor Green
Write-Host "   API Gateway:     http://localhost:8000" -ForegroundColor White
Write-Host "   API Health:      http://localhost:8000/api/health" -ForegroundColor White
Write-Host "   PostgreSQL:      localhost:5432 (Database: studios_hub)" -ForegroundColor White
Write-Host "   Valkey 8 Cache:  localhost:6379" -ForegroundColor White
Write-Host "   Ollama:          http://localhost:11434" -ForegroundColor White
