import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/amd-rocm-mi300x/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  if (fs.existsSync(corePath)) {
    const coreCode = fs.readFileSync(corePath, 'utf8');
    window.eval(coreCode);
  }

  const jsPath = path.resolve(__dirname, '../src/js/generators/amd-rocm-mi300x-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('AMD ROCm 6.2 & Instinct MI300X Studio', () => {
  it('should compile default vLLM ROCm code and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('AMD ROCm 6.2 & Instinct MI300X');
    expect(code).toContain('VLLM_ROCM_FLASH_ATTN');
    expect(code).toContain('HIP_VISIBLE_DEVICES');
    expect(window.document.getElementById('metric-bandwidth').textContent).toBe('42.4 TB/s');
    expect(window.document.getElementById('metric-tco').textContent).toBe('-42% vs H100');
  });

  it('should switch tabs to PyTorch FSDP distributed training', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="fsdp"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('FullyShardedDataParallel');
    expect(code).toContain('ShardingStrategy.FULL_SHARD');
  });

  it('should update HUD and code when changing target model and GPU count', () => {
    const window = loadToolDom();
    const modelSelect = window.document.getElementById('modelScale');
    modelSelect.value = 'deepseek_v2';
    modelSelect.dispatchEvent(new window.Event('change'));

    const gpuSelect = window.document.getElementById('gpuClusterSize');
    gpuSelect.value = '16';
    gpuSelect.dispatchEvent(new window.Event('change'));

    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('deepseek-ai/DeepSeek-V2.5-1210');
    expect(window.document.getElementById('metric-bandwidth').textContent).toBe('84.8 TB/s');
  });
});
