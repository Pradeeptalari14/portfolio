import { describe, it, expect } from 'vitest';
import { BackendEcosystemGenerator } from '../src/js/generators/backend-ecosystem-gen.js';

describe('BackendEcosystemGenerator', () => {
  const gen = new BackendEcosystemGenerator();

  it('initializes with correct name and version', () => {
    expect(gen.name).toContain('Backend Ecosystem');
    expect(gen.version).toBe('2.0.0');
  });

  it('provides at least 10 canonical inner-studio cross links', () => {
    const links = gen.canonicalStudioLinks();
    expect(links.length).toBeGreaterThanOrEqual(10);
    const ids = links.map(l => l.id);
    expect(ids).toContain('api-gateway');
    expect(ids).toContain('nginx-config');
    expect(ids).toContain('redis-cesc');
    expect(ids).toContain('db-migration');
    expect(ids).toContain('db-clustering');
    expect(ids).toContain('event-sre');
    expect(ids).toContain('monitoring');
    expect(ids).toContain('otel-configurator');
  });

  it('supports at least 3 full-stack production-grade projects', () => {
    const projects = gen.supportedProjects();
    const keys = Object.keys(projects);
    expect(keys.length).toBeGreaterThanOrEqual(3);
    expect(keys).toContain('ecommerce');
    expect(keys).toContain('notifications');
    expect(keys).toContain('saas-billing');
  });

  it('generates valid Docker Compose files for each project', () => {
    for (const pid of ['ecommerce', 'notifications', 'saas-billing']) {
      const compose = gen.generateDockerCompose(pid);
      expect(compose).toContain('version:');
      expect(compose).toContain('services:');
      expect(compose.length).toBeGreaterThan(100);
    }
  });

  it('generates production backend code for each project', () => {
    const py = gen.generateBackendCode('ecommerce');
    expect(py).toContain('FastAPI');
    expect(py).toContain('idempotency_key');
    expect(py).toContain('celery_app');

    const node = gen.generateBackendCode('notifications');
    expect(node).toContain('WebSocketServer');
    expect(node).toContain('redisSub');
    expect(node).toContain('bullmq');

    const go = gen.generateBackendCode('saas-billing');
    expect(go).toContain('package main');
    expect(go).toContain('asynq');
    expect(go).toContain('SetNX');
  });

  it('provides 6 comprehensive troubleshooting labs', () => {
    const labs = gen.troubleshootingLabs();
    expect(labs.length).toBe(6);
    const labIds = labs.map(l => l.id);
    expect(labIds).toContain('db-pool-exhaustion');
    expect(labIds).toContain('cache-stampede');
    expect(labIds).toContain('queue-lag-oom');
    expect(labIds).toContain('api-504-timeout');
    expect(labIds).toContain('bad-deployment-migration');
    expect(labIds).toContain('container-healthcheck-fail');
  });

  it('generates a full unified configuration manifest', () => {
    const res = gen.generate({
      project: 'ecommerce',
      learningMode: 'advanced',
      troubleshootScenario: 'cache-stampede'
    });

    expect(res.studio).toBe('backend-ecosystem');
    expect(res.learningMode).toBe('advanced');
    expect(res.project.id).toBe('ecommerce');
    expect(res.activeLab.id).toBe('cache-stampede');
    expect(res.canonicalLinks.length).toBeGreaterThanOrEqual(10);
  });
});
