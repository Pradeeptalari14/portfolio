import { describe, it, expect } from 'vitest';
import { RepoLearningGenerator } from '../src/js/generators/repo-learning-gen.js';

describe('RepoLearningGenerator', () => {
  const gen = new RepoLearningGenerator();

  it('initializes with correct name and version', () => {
    expect(gen.name).toContain('Unified Repository Learning');
    expect(gen.version).toBe('2.0.0');
  });

  it('provides at least 6 real production repository presets', () => {
    const repos = gen.presetRepositories();
    const keys = Object.keys(repos);
    expect(keys.length).toBeGreaterThanOrEqual(6);
    expect(keys).toContain('tp-backend-ecosystem');
    expect(keys).toContain('tp-semgrep-ast-guardrails');
    expect(keys).toContain('tp-sigstore-cosign-slsa');
    expect(keys).toContain('tp-boundary-zerotrust');
    expect(keys).toContain('tp-sbom-cyclonedx-governance');
    expect(keys).toContain('tp-owasp-llm-agent-shield');

    const backend = repos['tp-backend-ecosystem'];
    expect(backend.monorepo).toBe(true);
    expect(backend.languages).toContain('Python');
    expect(backend.languages).toContain('Go');
    expect(backend.studioBridge.length).toBeGreaterThanOrEqual(4);
  });

  it('accurately inspects file lists and detects polyglot stacks, Docker and CI/CD', () => {
    const files = [
      'main.py',
      'src/index.js',
      'main.go',
      'Dockerfile',
      'docker-compose.yml',
      '.github/workflows/ci.yml',
      'projects/ecommerce/main.py'
    ];
    const inspection = gen.inspectRepository(files);
    expect(inspection.languages).toContain('Python');
    expect(inspection.languages).toContain('TypeScript/JavaScript');
    expect(inspection.languages).toContain('Go');
    expect(inspection.dockerSupport).toBe(true);
    expect(inspection.composeFile).toBe(true);
    expect(inspection.ciConfigured).toBe(true);
    expect(inspection.monorepo).toBe(true);
  });

  it('generates an architecture DAG with nodes and connections', () => {
    const dag = gen.generateArchitectureDag('tp-backend-ecosystem');
    expect(dag.nodes.length).toBeGreaterThanOrEqual(5);
    expect(dag.connections.length).toBeGreaterThanOrEqual(4);
    const nodeIds = dag.nodes.map(n => n.id);
    expect(nodeIds).toContain('client');
    expect(nodeIds).toContain('backend');
    expect(nodeIds).toContain('db');
    expect(nodeIds).toContain('queue');
  });

  it('provides 10-point pedagogical course modules across multiple difficulty levels', () => {
    const modules = gen.courseModules('tp-backend-ecosystem');
    expect(modules.length).toBeGreaterThanOrEqual(3);

    const levels = modules.map(m => m.level);
    expect(levels).toContain('beginner');
    expect(levels).toContain('intermediate');
    expect(levels).toContain('advanced');

    modules.forEach(m => {
      expect(m.objectives).toBeTruthy();
      expect(m.concept).toBeTruthy();
      expect(m.relevantFiles.length).toBeGreaterThan(0);
      expect(m.traceSteps.length).toBeGreaterThan(0);
      expect(m.walkthrough).toBeTruthy();
      expect(m.exercise).toBeTruthy();
      expect(m.troubleshootingTips).toBeTruthy();
      expect(m.quiz.question).toBeTruthy();
      expect(m.quiz.options.length).toBeGreaterThanOrEqual(2);
      expect(m.solutionDiff).toContain('+++');
      expect(m.nextLesson).toBeTruthy();
    });
  });

  it('generates development setup with sanitized environment templates and health checks', () => {
    const setup = gen.developmentSetup('tp-backend-ecosystem');
    expect(setup.prerequisites.length).toBeGreaterThanOrEqual(3);
    expect(setup.envTemplate).toContain('DATABASE_URL');
    expect(setup.dockerCommand).toContain('docker-compose');
    expect(setup.healthCheckCommand).toContain('/health');
  });

  it('diagnoses stack traces to specific files, lines, and provides studio remediation', () => {
    const diagnosis = gen.stackTraceDiagnosis('OperationalError: remaining connection slots are reserved');
    expect(diagnosis.matchedFile).toContain('main.py');
    expect(diagnosis.line).toBeGreaterThan(0);
    expect(diagnosis.category).toContain('Connection Pool');
    expect(diagnosis.suggestedStudio).toContain('db-clustering');
  });
});
