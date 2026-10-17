import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Companion Backend (Phase 3 Architecture Verification)', () => {
  const backendDir = path.resolve(__dirname, '../backend');

  it('should have a hardened Dockerfile with non-root appuser and healthcheck', () => {
    const dockerfilePath = path.join(backendDir, 'Dockerfile');
    expect(fs.existsSync(dockerfilePath)).toBe(true);

    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    expect(dockerfileContent).toContain('useradd -r -g appuser -d /app appuser');
    expect(dockerfileContent).toContain('USER appuser');
    expect(dockerfileContent).toContain('HEALTHCHECK');
    expect(dockerfileContent).toContain('8000');
  });

  it('should have a production-grade docker-compose.yml with pgvector, Valkey 8, and Ollama', () => {
    const composePath = path.join(backendDir, 'docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);

    const composeContent = fs.readFileSync(composePath, 'utf8');
    expect(composeContent).toContain('pgvector/pgvector:pg16');
    expect(composeContent).toContain('valkey/valkey:8-alpine');
    expect(composeContent).toContain('ollama/ollama:latest');
    expect(composeContent).toContain('studios_api');
    expect(composeContent).toContain('5432:5432');
    expect(composeContent).toContain('8000:8000');
    // Ensure no insecure docker socket mount
    expect(composeContent).not.toContain('/var/run/docker.sock');
  });

  it('should have FastAPI companion entrypoint with CORS and health routes', () => {
    const mainPath = path.join(backendDir, 'app/main.py');
    expect(fs.existsSync(mainPath)).toBe(true);

    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('FastAPI');
    expect(mainContent).toContain('CORSMiddleware');
    expect(mainContent).toContain('/api/health');
    expect(mainContent).toContain('studios.router');
    expect(mainContent).toContain('projects.router');
    expect(mainContent).toContain('rag.router');
    expect(mainContent).toContain('sandbox.router');
    expect(mainContent).toContain('ai.router');
  });

  it('should define dynamic embedding models and database schemas', () => {
    const modelsPath = path.join(backendDir, 'app/models.py');
    expect(fs.existsSync(modelsPath)).toBe(true);

    const modelsContent = fs.readFileSync(modelsPath, 'utf8');
    expect(modelsContent).toContain('class Studio(Base)');
    expect(modelsContent).toContain('class StudioEmbedding(Base)');
    expect(modelsContent).toContain('class Project(Base)');
    expect(modelsContent).toContain('class Telemetry(Base)');
    expect(modelsContent).toContain('Vector(EMBEDDING_DIM)');
  });

  it('should have isolated sandbox execution router with hardened container options', () => {
    const sandboxPath = path.join(backendDir, 'app/routers/sandbox.py');
    expect(fs.existsSync(sandboxPath)).toBe(true);

    const sandboxContent = fs.readFileSync(sandboxPath, 'utf8');
    expect(sandboxContent).toContain('pids_limit=64');
    expect(sandboxContent).toContain('mem_limit="512m"');
    expect(sandboxContent).toContain('network_mode="none"');
    expect(sandboxContent).toContain('read_only=True');
    expect(sandboxContent).toContain('init=True');
  });

  it('should define complete AI and RAG companion endpoints across all core pillars', () => {
    const aiRouterPath = path.join(backendDir, 'app/routers/ai.py');
    const ragRouterPath = path.join(backendDir, 'app/routers/rag.py');
    expect(fs.existsSync(aiRouterPath)).toBe(true);
    expect(fs.existsSync(ragRouterPath)).toBe(true);

    const aiContent = fs.readFileSync(aiRouterPath, 'utf8');
    const ragContent = fs.readFileSync(ragRouterPath, 'utf8');

    // 1. Guardrails
    expect(aiContent).toContain('/guardrails/scan');
    // 2. Persistent Memory
    expect(aiContent).toContain('/memory/save');
    expect(aiContent).toContain('/memory/recall');
    // 3. Eval suite
    expect(aiContent).toContain('/eval');
    // 4. Inference profiler
    expect(aiContent).toContain('/inference/profile');
    // 5. A2A interoperability
    expect(aiContent).toContain('/a2a/route');
    // 6. Semantic Cache
    expect(aiContent).toContain('/cache/lookup');
    // 7. LoRA VRAM estimator
    expect(aiContent).toContain('/finetune/estimate-vram');
    // 8. FinOps Carbon
    expect(aiContent).toContain('/finops/carbon');

    // 9. Hybrid RAG with RRF & Reranking
    expect(ragContent).toContain('/hybrid');
    expect(ragContent).toContain('/rerank');
  });
});
