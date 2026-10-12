import { describe, it, expect } from 'vitest';
import { SigstoreCosignSlsaGenerator } from '../src/js/generators/sigstore-cosign-slsa-gen.js';

describe('Sigstore Cosign SLSA Provenance Studio Generator', () => {
  it('should initialize with default configuration', () => {
    const gen = new SigstoreCosignSlsaGenerator();
    const output = gen.generate();
    expect(output.studio).toBe('sigstore-cosign-slsa');
    expect(output.config.manifest).toBe('cosign-attestation.yml');
  });
});
