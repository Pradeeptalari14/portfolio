import { describe, it, expect } from 'vitest';
import { OwaspLlmAgentShieldGenerator } from '../src/js/generators/owasp-llm-agent-shield-gen.js';

describe('OWASP Top 10 for LLMs & AI Agent Shield Studio Generator', () => {
  it('should initialize with default configuration', () => {
    const gen = new OwaspLlmAgentShieldGenerator();
    const output = gen.generate();
    expect(output.studio).toBe('owasp-llm-agent-shield');
    expect(output.config.manifest).toBe('guardrails-config.yaml');
  });
});
