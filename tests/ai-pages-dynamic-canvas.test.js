import { describe, it, expect } from 'vitest';
import { AIPagesDynamicCanvasGenerator } from '../src/js/generators/ai-pages-dynamic-canvas-gen.js';

describe('AIPagesDynamicCanvasGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new AIPagesDynamicCanvasGenerator();
    expect(generator.name).toBe('Pages Dynamic Canvas Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate a valid reactive canvas DAG spec', () => {
    const generator = new AIPagesDynamicCanvasGenerator();
    const result = generator.generate({
      kernel: 'python_wasm',
      agent: 'gpt6_sol',
      memoryLimitMb: 1024,
      reactive: true
    });

    expect(result.specVersion).toBe('canvas.v1alpha1');
    expect(result.engine.kernelRuntime).toBe('python_wasm');
    expect(result.engine.memoryLimitMb).toBe(1024);
    expect(result.engine.reactiveTopologicalRecompute).toBe(true);
    expect(result.dagNodes.length).toBeGreaterThanOrEqual(3);
    expect(result.securitySandbox.zdrEnforced).toBe(true);
  });

  it('should generate python kernel runner code', () => {
    const generator = new AIPagesDynamicCanvasGenerator();
    const script = generator.generatePythonKernelRunner({ memoryLimitMb: 512 });
    expect(script).toContain('class DynamicCanvasKernel:');
    expect(script).toContain('memory_limit_mb: int = 512');
  });
});
