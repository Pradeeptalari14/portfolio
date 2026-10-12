import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Next-Gen DevSecOps Studios', () => {
  const root = path.resolve(__dirname, '..');
  const tools = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools.json'), 'utf8'));

  const expectedIds = [
    'sigstore-cosign-slsa',
    'sbom-cyclonedx-governance',
    'semgrep-ast-guardrails',
    'owasp-llm-agent-shield',
    'hashicorp-boundary-zerotrust'
  ];

  it('should have all 5 next-gen DevSecOps studios registered in tools.json', () => {
    expectedIds.forEach(id => {
      const match = tools.find(t => t.link === `${id}/`);
      expect(match).toBeDefined();
      expect(match.repository).toContain(id.replace('hashicorp-', ''));
    });
  });

  it('should have index.html and learn.html created for all 5 studios', () => {
    expectedIds.forEach(id => {
      const studioDir = path.join(root, 'tools', id);
      expect(fs.existsSync(path.join(studioDir, 'index.html'))).toBe(true);
      expect(fs.existsSync(path.join(studioDir, 'learn.html'))).toBe(true);
    });
  });
});
