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

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Load core-tool.js
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Load the generator JS code
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('AI Agentic Workflow Compiler Studio', () => {
  it('should compile default LangGraph agent workflow settings', () => {
    const window = loadToolDom('../tools/agent-workflow/index.html', '../src/js/generators/agent-workflow-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('from langgraph.graph import StateGraph, END');
    expect(outputBox.textContent).toContain('def orchestrator_node(state: AgentState):');
    expect(outputBox.textContent).toContain('state["loop_count"] >= 5');
    expect(outputBox.textContent).toContain('confirm = input("⚠️ [HITL] Allow Specialist to fetch credentials? (y/n): ")');
  });

  it('should compile agents-config.json when tab changes', () => {
    const window = loadToolDom('../tools/agent-workflow/index.html', '../src/js/generators/agent-workflow-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('wf_config');
    const parsedConfig = JSON.parse(outputBox.textContent);
    expect(parsedConfig.framework).toBe('LangGraph');
    expect(parsedConfig.pattern).toBe('Sequential');
    expect(parsedConfig.max_loops).toBe(5);
    expect(parsedConfig.human_in_the_loop).toBe(true);
    expect(parsedConfig.agents.length).toBe(2);
    expect(parsedConfig.agents[0].name).toBe('orchestrator');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/agent-workflow/index.html', '../src/js/generators/agent-workflow-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('agent-workflow.py');

    window.switchTab('wf_config');
    expect(filenameInput.value).toBe('agents-config.json');
  });
});
