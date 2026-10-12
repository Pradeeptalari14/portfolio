import { describe, it, expect } from 'vitest';
import { SbomCyclonedxGovernanceGenerator } from '../src/js/generators/sbom-cyclonedx-governance-gen.js';

describe('SBOM & CycloneDX Vulnerability Governance Studio Generator', () => {
  it('should initialize with default configuration', () => {
    const gen = new SbomCyclonedxGovernanceGenerator();
    const output = gen.generate();
    expect(output.studio).toBe('sbom-cyclonedx-governance');
    expect(output.config.manifest).toBe('sbom-policy.yaml');
  });
});
