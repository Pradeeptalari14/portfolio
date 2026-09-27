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

describe('TypeSafe Jev: System 1 AI Decision Studio', () => {
  it('should compile default jev_decision_engine.py with TypeSafe AI Jev SDK and Pydantic', () => {
    const window = loadToolDom('../tools/jev-system1/index.html', '../src/js/generators/jev-system1-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('from typesafe_ai import JevClient, RLCDCalibration');
    expect(outputBox.textContent).toContain('class AgentRouterDecision(BaseModel):');
    expect(outputBox.textContent).toContain('calibrated_confidence: float');
    expect(outputBox.textContent).toContain('class DualProcessDecisionEngine:');
    expect(outputBox.textContent).toContain('if decision.calibrated_confidence >= self.escalation_threshold:');
  });

  it('should compile system1_router.ts with Zod schema validation when tab changes', () => {
    const window = loadToolDom('../tools/jev-system1/index.html', '../src/js/generators/jev-system1-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('jev_ts');
    expect(outputBox.textContent).toContain("import { z } from 'zod';");
    expect(outputBox.textContent).toContain("import { JevClient, RLCDMode } from '@typesafe-ai/jev-node';");
    expect(outputBox.textContent).toContain('export const DecisionSchema = z.object({');
    expect(outputBox.textContent).toContain('export async function jevSystem1Middleware');
    expect(outputBox.textContent).toContain("reply.header('X-Cognitive-Layer', 'System-1-Jev');");
  });

  it('should compile hybrid_agent_graph.py with LangGraph dual-process cognitive routing', () => {
    const window = loadToolDom('../tools/jev-system1/index.html', '../src/js/generators/jev-system1-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('jev_graph');
    expect(outputBox.textContent).toContain('from langgraph.graph import StateGraph, END');
    expect(outputBox.textContent).toContain('def system_1_reflex_node(state: DualAgentState)');
    expect(outputBox.textContent).toContain('def deterministic_tool_node(state: DualAgentState)');
    expect(outputBox.textContent).toContain('def system_2_reasoning_node(state: DualAgentState)');
    expect(outputBox.textContent).toContain('workflow.add_conditional_edges');
  });

  it('should compile k8s-sidecar.yaml for sub-millisecond local inference sidecar', () => {
    const window = loadToolDom('../tools/jev-system1/index.html', '../src/js/generators/jev-system1-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('jev_k8s');
    expect(outputBox.textContent).toContain('name: typesafe-jev-dual-process-service');
    expect(outputBox.textContent).toContain('ai.typesafe.com/cognitive-layer: system-1-reflex');
    expect(outputBox.textContent).toContain('image: typesafeai/jev-sidecar:2026.9.15');
    expect(outputBox.textContent).toContain('--max-latency-sla=85ms');
  });

  it('should execute live interactive reflex simulation and update telemetry HUD', () => {
    const window = loadToolDom('../tools/jev-system1/index.html', '../src/js/generators/jev-system1-gen.js');
    
    const latencyEl = window.document.getElementById('sim-latency');
    const confidenceEl = window.document.getElementById('sim-confidence');
    const routeEl = window.document.getElementById('sim-route');
    const jsonOutputEl = window.document.getElementById('sim-json-output');

    expect(latencyEl.textContent).toContain('ms');
    expect(parseFloat(confidenceEl.textContent)).toBeGreaterThanOrEqual(0.85);
    expect(routeEl.textContent).toContain('SYSTEM 1 REFLEX');

    const json = JSON.parse(jsonOutputEl.textContent);
    expect(json.model).toBe('TypeSafe-AI/Jev-System1-v1');
    expect(json.route).toBe('DIRECT_TOOL_CALL');

    // Test toggle ambiguous
    const ambiguousBtn = window.document.getElementById('btn-toggle-ambiguous');
    ambiguousBtn.click();

    expect(routeEl.textContent).toContain('SYSTEM 2 DELIBERATE');
    const ambiguousJson = JSON.parse(jsonOutputEl.textContent);
    expect(ambiguousJson.route).toBe('ESCALATE_SYSTEM_2');
  });
});
