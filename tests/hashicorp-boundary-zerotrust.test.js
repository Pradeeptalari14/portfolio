import { describe, it, expect } from 'vitest';
import { HashicorpBoundaryZerotrustGenerator } from '../src/js/generators/hashicorp-boundary-zerotrust-gen.js';

describe('HashiCorp Boundary Zero-Trust Access Studio Generator', () => {
  it('should initialize with default configuration', () => {
    const gen = new HashicorpBoundaryZerotrustGenerator();
    const output = gen.generate();
    expect(output.studio).toBe('hashicorp-boundary-zerotrust');
    expect(output.config.manifest).toBe('boundary-controller.hcl');
  });
});
