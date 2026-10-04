import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/gpt-6-luna-decisions/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/gpt-6-luna-decisions-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI GPT-6 Luna Decisions API & Structural Router Studio', () => {
  it('should compile default Luna Decisions router and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('OpenAI GPT-6 Luna Decisions API');
    expect(code).toContain('evaluate_decision');
    expect(code).toContain('DECISION_SCHEMA');
    expect(window.document.getElementById('metric-cost').textContent).toBe('$0.05 / 1M');
    expect(window.document.getElementById('metric-latency').textContent).toContain('< 65ms P99');
  });

  it('should switch tabs to Structural Branch Evaluator', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="evaluator"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class StructuralBranchEvaluator');
    expect(code).toContain('route_decision');
  });

  it('should update HUD when changing domain archetype to fraud anomaly', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('domainArchetype');
    select.value = 'fraud_anomaly_classifier';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('finops-text').textContent).toContain('Fraud Anomaly');
  });
});
