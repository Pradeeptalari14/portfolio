import { describe, it, expect } from 'vitest';
import { SemgrepAstGuardrailsGenerator } from '../src/js/generators/semgrep-ast-guardrails-gen.js';

describe('Semgrep AST Policy Guardrails Studio Generator', () => {
  it('should initialize with default configuration', () => {
    const gen = new SemgrepAstGuardrailsGenerator();
    const output = gen.generate();
    expect(output.studio).toBe('semgrep-ast-guardrails');
    expect(output.config.manifest).toBe('semgrep-rules.yml');
  });
});
