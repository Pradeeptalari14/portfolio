#!/usr/bin/env bash
# Talari Pradeep Studios Hub — One-Command Companion Stack Quickstart
set -e

echo "🚀 Starting Talari Pradeep Studios Hub Companion Infrastructure..."
cd "$(dirname "$0")"

# 1. Start Docker Compose Stack
docker compose up -d

echo "⏳ Waiting for PostgreSQL + pgvector and Companion API to become healthy..."
sleep 5

# 2. Run Database Seeding
python3 scripts/seed_studios.py || echo "⚠️ Seeding skipped or Python dependencies not in host environment. Database will initialize on first API request."

echo "✅ Companion Stack is live!"
echo "   API Gateway:     http://localhost:8000"
echo "   API Health:      http://localhost:8000/api/health"
echo "   PostgreSQL:      localhost:5432 (Database: studios_hub)"
echo "   Valkey 8 Cache:  localhost:6379"
echo "   Ollama:          http://localhost:11434"
