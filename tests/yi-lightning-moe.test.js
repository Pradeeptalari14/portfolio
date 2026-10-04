import { describe, it, expect } from 'vitest';
import { YiLightningMoEGenerator } from '../src/js/generators/yi-lightning-moe-gen.js';

describe('YiLightningMoEGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new YiLightningMoEGenerator();
    expect(generator.name).toBe('01.AI Yi-Lightning MoE Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate valid Yi-Lightning MoE architecture spec', () => {
    const generator = new YiLightningMoEGenerator();
    const result = generator.generate({
      expertRouting: 'top_k_gating',
      quantization: 'fp8_e4m3',
      contextWindow: 131072,
      bilingualTokenizer: 'tiktoken_extended_cjk'
    });

    expect(result.modelName).toBe('01-ai/Yi-Lightning-MoE');
    expect(result.architecture.totalParameters).toBe('110B');
    expect(result.architecture.activeParameters).toBe('18B');
    expect(result.architecture.totalExperts).toBe(64);
    expect(result.architecture.activeExpertsPerToken).toBe(8);
    expect(result.servingEngine.backend).toBe('sglang_radix_moe');
    expect(result.servingEngine.quantization).toBe('fp8_e4m3');
    expect(result.routingPolicy.algorithm).toBe('top_k_gating');
  });

  it('should generate python serving snippet', () => {
    const generator = new YiLightningMoEGenerator();
    const script = generator.generatePythonServingSnippet();
    expect(script).toContain('initialize_yi_lightning_cluster');
    expect(script).toContain('01-ai/Yi-Lightning-MoE');
    expect(script).toContain('sglang');
  });
});
