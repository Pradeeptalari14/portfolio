import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Production Architecture Center (architecture/index.html)', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../architecture/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/architecture/'
    });
    window = dom.window;
    document = window.document;
  });

  it('should have valid HTML5 structure, title, meta description, and navigation links', () => {
    expect(document.title).toContain('Production Architecture Center');
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc).toContain('AWS Landing Zones');
    expect(metaDesc).toContain('vLLM Clusters');

    // Navigation links
    const navLinks = Array.from(document.querySelectorAll('.hub-nav-links a')).map(a => a.getAttribute('href'));
    expect(navLinks).toContain('../');
    expect(navLinks).toContain('../studios/');
    expect(navLinks).toContain('../studios/learn/');
    expect(navLinks).toContain('../studios/flow/');
    expect(navLinks).toContain('../incident/');
    expect(navLinks).toContain('./');
    expect(navLinks).toContain('../resume/');
  });

  it('should initialize all required contract IDs and default architecture (landing-zone)', () => {
    expect(document.getElementById('archSelector')).toBeTruthy();
    expect(document.getElementById('diagramTitle')).toBeTruthy();
    expect(document.getElementById('diagramDesc')).toBeTruthy();
    expect(document.getElementById('nodeGrid')).toBeTruthy();
    expect(document.getElementById('inspectorPanel')).toBeTruthy();
    expect(document.getElementById('inspTag')).toBeTruthy();
    expect(document.getElementById('inspTitle')).toBeTruthy();
    expect(document.getElementById('inspDesc')).toBeTruthy();
    expect(document.getElementById('inspIac')).toBeTruthy();
    expect(document.getElementById('inspHa')).toBeTruthy();
    expect(document.getElementById('inspSec')).toBeTruthy();

    const titleEl = document.getElementById('diagramTitle');
    expect(titleEl.textContent).toContain('AWS Multi-Account Landing Zone Topology');

    const nodeGrid = document.getElementById('nodeGrid');
    const nodes = nodeGrid.querySelectorAll('.arch-node');
    expect(nodes.length).toBeGreaterThanOrEqual(4);

    const inspTitle = document.getElementById('inspTitle');
    expect(inspTitle.textContent).toContain('AWS Control Tower');

    const inspIacCode = document.getElementById('inspIacCode');
    expect(inspIacCode.textContent).toContain('aws_organizations_policy');
  });

  it('should render all 8 enterprise architectures in the selector', () => {
    const archButtons = document.querySelectorAll('.arch-btn');
    expect(archButtons.length).toBe(8);

    const ids = Array.from(archButtons).map(b => b.getAttribute('data-id'));
    expect(ids).toEqual([
      'landing-zone',
      'eks-mesh',
      'llm-cluster',
      'agent-swarm',
      'rag-ai',
      'ebpf-telemetry',
      'devsecops-slsa',
      'hybrid-vmware'
    ]);
  });

  it('should switch architecture to Distributed LLM Inference Cluster on button click', () => {
    const llmBtn = document.querySelector('.arch-btn[data-id="llm-cluster"]');
    expect(llmBtn).toBeTruthy();

    llmBtn.click();

    const titleEl = document.getElementById('diagramTitle');
    expect(titleEl.textContent).toContain('Distributed High-Throughput LLM Inference Cluster');

    const nodeGrid = document.getElementById('nodeGrid');
    const nodes = nodeGrid.querySelectorAll('.arch-node');
    expect(nodes.length).toBeGreaterThanOrEqual(4);

    // Initial node inspected by default is node 0 (Semantic Cache)
    const inspTitle = document.getElementById('inspTitle');
    expect(inspTitle.textContent).toContain('Semantic Cache');

    // Click node 1 (vLLM PagedAttention & Chunked Prefill)
    nodes[1].click();
    expect(inspTitle.textContent).toContain('vLLM PagedAttention');

    const inspIacCode = document.getElementById('inspIacCode');
    expect(inspIacCode.textContent).toContain('vllm/vllm-openai');
  });

  it('should inspect specific nodes when clicked in the node grid', () => {
    // Switch to active-active EKS mesh
    const eksBtn = document.querySelector('.arch-btn[data-id="eks-mesh"]');
    eksBtn.click();

    const nodeGrid = document.getElementById('nodeGrid');
    const nodes = nodeGrid.querySelectorAll('.arch-node');
    expect(nodes.length).toBeGreaterThan(1);

    // Click the second node (Istio Ambient Mesh)
    nodes[1].click();

    const inspTitle = document.getElementById('inspTitle');
    expect(inspTitle.textContent).toContain('Istio Ambient Mesh');

    const inspHa = document.getElementById('inspHa');
    expect(inspHa.textContent).toContain('Multi-replica istiod control plane');

    const inspSec = document.getElementById('inspSec');
    expect(inspSec.textContent).toContain('SPIFFE/SPIRE');
  });

  it('should toggle technical inspector tabs (Overview, IaC, SLO, Chaos)', () => {
    const tabs = document.querySelectorAll('.insp-tab');
    expect(tabs.length).toBe(4);

    const panelOverview = document.getElementById('panelOverview');
    const panelIac = document.getElementById('panelIac');
    const panelSlo = document.getElementById('panelSlo');
    const panelChaos = document.getElementById('panelChaos');

    // Default overview visible
    expect(panelOverview.style.display).not.toBe('none');
    expect(panelIac.style.display).toBe('none');

    // Click IaC Tab
    const iacTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === 'iac');
    iacTab.click();
    expect(panelOverview.style.display).toBe('none');
    expect(panelIac.style.display).toBe('flex');

    // Click SLO Tab
    const sloTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === 'slo');
    sloTab.click();
    expect(panelSlo.style.display).toBe('flex');
    expect(panelIac.style.display).toBe('none');

    // Click Chaos Tab
    const chaosTab = Array.from(tabs).find(t => t.getAttribute('data-tab') === 'chaos');
    chaosTab.click();
    expect(panelChaos.style.display).toBe('flex');
    expect(panelSlo.style.display).toBe('none');
  });

  it('should step through the request lifecycle simulation HUD', () => {
    const btnSimulate = document.getElementById('btnSimulateRequestFlow');
    const flowStepCount = document.getElementById('flowStepCount');
    const flowTerminalLogs = document.getElementById('flowTerminalLogs');

    expect(flowStepCount.textContent).toContain('Step 1 of');

    // Click Step Request Flow
    btnSimulate.click();
    expect(flowStepCount.textContent).toContain('Step 2 of');
    expect(flowTerminalLogs.textContent).toContain('[STAGE 2]');

    // Click again to step to Stage 3
    btnSimulate.click();
    expect(flowStepCount.textContent).toContain('Step 3 of');
    expect(flowTerminalLogs.textContent).toContain('[STAGE 3]');
  });

  it('should filter architectures by category pills', () => {
    const pills = document.querySelectorAll('.cat-pill');
    const aiPill = Array.from(pills).find(p => p.getAttribute('data-cat') === 'ai');
    expect(aiPill).toBeTruthy();

    aiPill.click();

    const visibleButtons = document.querySelectorAll('.arch-btn');
    expect(visibleButtons.length).toBe(3);

    const titles = Array.from(visibleButtons).map(b => b.querySelector('.arch-btn-title')?.textContent);
    expect(titles).toContain('Distributed High-Throughput LLM Inference Cluster');
    expect(titles).toContain('Autonomous Multi-Agent Swarm with CRDT & MCP');
    expect(titles).toContain('Enterprise Multi-Hop Speculative RAG Architecture');
  });

  it('should filter architectures dynamically via search input', () => {
    const searchInput = document.getElementById('archSearch');
    // Specific query matching only 1 architecture
    searchInput.value = 'tetragon';
    searchInput.dispatchEvent(new window.Event('input'));

    let visibleButtons = document.querySelectorAll('.arch-btn');
    expect(visibleButtons.length).toBe(1);
    expect(visibleButtons[0].querySelector('.arch-btn-title')?.textContent).toContain('eBPF');

    // Broader query matching 2 architectures with eBPF technology
    searchInput.value = 'ebpf';
    searchInput.dispatchEvent(new window.Event('input'));

    visibleButtons = document.querySelectorAll('.arch-btn');
    expect(visibleButtons.length).toBe(2);
  });

  it('should trigger runbook generation and clipboard copy without errors', () => {
    // Mock navigator.clipboard
    let copiedText = '';
    window.navigator.clipboard = {
      writeText: (txt) => {
        copiedText = txt;
        return Promise.resolve();
      }
    };

    const btnExport = document.getElementById('btnExportRunbook');
    btnExport.click();

    expect(copiedText).toContain('# PRODUCTION SRE ARCHITECTURE RUNBOOK:');
    expect(copiedText).toContain('AWS Multi-Account Landing Zone Topology');
    expect(copiedText).toContain('AWS Control Tower & Organizations');
  });
});
