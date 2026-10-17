import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import StudioSDK from '../src/js/studio-sdk.js';

function loadAiEvalDom() {
  const htmlPath = path.resolve(__dirname, '../tools/ai-eval/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: 'dangerously' });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Provide mock globals
  window.StudioSDK = StudioSDK;
  window.setupCompilerTriggers = () => {};

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  const jsPath = path.resolve(__dirname, '../src/js/generators/ai-eval-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  // Remove ES imports and define StudioSDK/setupCompilerTriggers
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  jsCode = `var StudioSDK = window.StudioSDK; var setupCompilerTriggers = window.setupCompilerTriggers;\n` + jsCode;
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('AI Evaluation & Benchmarking Studio (Flagship Milestone 3)', () => {
  it('should compile default active code and initialize evaluation controls', () => {
    const window = loadAiEvalDom();
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent.length).toBeGreaterThan(20);
    expect(window.document.title).toContain('AI Evaluation & Benchmarking Studio');
    expect(outputBox.textContent).toContain('eval_pipeline.py');
  });

  it('should switch tabs between config, instrument, readme, and live workbench', () => {
    const window = loadAiEvalDom();
    expect(typeof window.switchTab).toBe('function');

    window.switchTab('instrument');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('evaluation_schema_version');
    expect(window.document.getElementById('download-name-input').value).toContain('eval_config');

    window.switchTab('workbench');
    const wb = window.document.getElementById('workbench-container');
    expect(wb.classList.contains('hidden')).toBe(false);
    expect(wb.innerHTML).toContain('Real-Time Ragas Agent Evaluation Bench');
  });

  it('should execute live agent evaluation run in workbench', async () => {
    const window = loadAiEvalDom();
    window.switchTab('workbench');
    expect(typeof window.executeLiveAgentEvaluation).toBe('function');

    await window.executeLiveAgentEvaluation();
    const faithEl = window.document.getElementById('score-faithfulness');
    expect(faithEl).not.toBeNull();
    const score = parseFloat(faithEl.textContent);
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});
