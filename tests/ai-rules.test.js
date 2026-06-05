import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  // Remove ESM imports from JS code safely (only matches at the start of lines to avoid template literals)
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');

  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  return window;
}

describe('AI Rules Customizer', () => {
  it('should compile default cursor rules and adapt output to stack changes', () => {
    const window = loadToolDom('../tools/ai-rules-customizer/index.html', '../src/js/generators/ai-rules-customizer-gen.js');

    const assistantType = window.document.getElementById('assistant_type');
    const techStack = window.document.getElementById('tech_stack');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('You are a senior staff engineer specializing in nextjs');

    techStack.value = 'fastapi';
    techStack.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('You are a senior staff engineer specializing in fastapi');
  });

  it('should switch tabs and generate system prompts and copilot rules', () => {
    const window = loadToolDom('../tools/ai-rules-customizer/index.html', '../src/js/generators/ai-rules-customizer-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Switch to system prompt tab
    window.switchTab('system');
    expect(outputBox.textContent).toContain('System Instruction:');

    // Switch to config and select copilot
    window.switchTab('config');
    const assistantType = window.document.getElementById('assistant_type');
    assistantType.value = 'copilot';
    assistantType.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).toContain('# GitHub Copilot Rules');
  });

  it('should simulate side-by-side prompt responses', () => {
    const window = loadToolDom('../tools/ai-rules-customizer/index.html', '../src/js/generators/ai-rules-customizer-gen.js');
    
    window.switchTab('simulator');

    const promptInput = window.document.getElementById('prompt_input');
    const runSimBtn = window.document.getElementById('run-sim-btn');
    const simConstrainedOutput = window.document.getElementById('sim-constrained-output');

    promptInput.value = 'Write a user lookup';
    promptInput.dispatchEvent(new window.Event('input'));
    runSimBtn.dispatchEvent(new window.Event('click'));

    expect(simConstrainedOutput.textContent).toContain('UserRecord');
  });
});
