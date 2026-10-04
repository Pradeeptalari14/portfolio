import { describe, it, expect } from 'vitest';
import { OpenAIMarketplaceBrokerGenerator } from '../src/js/generators/openai-marketplace-broker-gen.js';

describe('OpenAIMarketplaceBrokerGenerator', () => {
  const gen = new OpenAIMarketplaceBrokerGenerator();

  it('initializes with name and version', () => {
    expect(gen.name).toBe('OpenAI Compute & Quota Broker Generator');
    expect(gen.version).toBe('1.0.0');
  });

  it('generates a routing spec with priority tiers', () => {
    const spec = gen.generate();
    expect(spec.routing.deployments.length).toBe(3);
    expect(spec.routing.honorRetryAfterHeader).toBe(true);
    expect(spec.quotaPolicy.priorityTiers.length).toBe(3);
  });

  it('restricts deployments for EU data residency', () => {
    const spec = gen.generate({ dataResidency: 'eu_only' });
    expect(spec.routing.deployments.every(d => d.region === 'swedencentral')).toBe(true);
  });

  it('routes away from a saturated deployment', () => {
    const deployments = gen.defaultDeployments();
    const usage = { 'openai-primary': { tpmUsed: 1999500, rpmUsed: 100 } };
    const pick = gen.selectDeployment(deployments, usage, 1000);
    expect(pick.id).not.toBe('openai-primary');
  });

  it('returns null when everything is saturated', () => {
    const deployments = gen.defaultDeployments();
    const usage = Object.fromEntries(deployments.map(d => [d.id, { tpmUsed: d.tpmLimit, rpmUsed: 0 }]));
    expect(gen.selectDeployment(deployments, usage, 1000)).toBeNull();
  });

  it('generates a python client with retry handling', () => {
    expect(gen.generatePythonClient()).toContain('RateLimitError');
  });
});
