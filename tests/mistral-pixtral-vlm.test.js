import { describe, it, expect } from 'vitest';
import { MistralPixtralVLMGenerator } from '../src/js/generators/mistral-pixtral-vlm-gen.js';

describe('MistralPixtralVLMGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new MistralPixtralVLMGenerator();
    expect(generator.name).toBe('Mistral Pixtral 12B Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate valid Pixtral 12B vLLM serving spec', () => {
    const generator = new MistralPixtralVLMGenerator();
    const result = generator.generate({
      quantization: 'fp8',
      resolution: 'dynamic_aspect_ratio',
      backend: 'vllm_multimodal',
      schema: 'json_schema_enforced'
    });

    expect(result.modelName).toBe('mistralai/Pixtral-12B-2409');
    expect(result.architecture.contextWindowTokens).toBe(128000);
    expect(result.servingEngine.quantization).toBe('fp8');
    expect(result.servingEngine.backend).toBe('vllm_multimodal');
    expect(result.imageProcessing.tokenizationStrategy).toBe('dynamic_aspect_ratio');
    expect(result.structuredExtraction.guidedDecoding).toBe(true);
  });

  it('should generate Python vLLM serving client code', () => {
    const generator = new MistralPixtralVLMGenerator();
    const script = generator.generatePythonVLLMClient();
    expect(script).toContain('load_pixtral_engine');
    expect(script).toContain('mistralai/Pixtral-12B-2409');
    expect(script).toContain('multi_modal_data');
  });
});
