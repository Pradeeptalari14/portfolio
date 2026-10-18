import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Visual Flow Canvas Workspace', () => {
  let dom;
  let window;
  let document;
  let VisualFlowCanvas;

  beforeAll(() => {
    // Setup JSDOM environment
    const htmlPath = path.resolve(__dirname, '../studios/flow/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(htmlContent, {
      url: 'http://localhost/studios/flow/?template=rag',
      runScripts: 'outside-only'
    });
    window = dom.window;
    document = window.document;

    // Load VisualFlowCanvas class
    const jsPath = path.resolve(__dirname, '../tools/visual-flow-canvas.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    window.eval(jsContent);
    VisualFlowCanvas = window.VisualFlowCanvas;
  });

  it('should export the VisualFlowCanvas class globally', () => {
    expect(VisualFlowCanvas).toBeDefined();
    expect(typeof VisualFlowCanvas).toBe('function');
  });

  it('should initialize the 3-panel workspace inside container', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    expect(container).toBeTruthy();

    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });
    expect(canvas).toBeDefined();

    // Check 3 panels + bottom drawer
    const sidebarLeft = container.querySelector('#vfSidebarLeft');
    const canvasContainer = container.querySelector('#vfCanvasContainer');
    const sidebarRight = container.querySelector('#vfSidebarRight');
    const drawer = container.querySelector('#vfDrawer');

    expect(sidebarLeft).toBeTruthy();
    expect(canvasContainer).toBeTruthy();
    expect(sidebarRight).toBeTruthy();
    expect(drawer).toBeTruthy();
  });

  it('should load the AI & RAG starter template with 6 nodes and 5 connections', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    expect(canvas.nodes.size).toBe(6);
    expect(canvas.connections.length).toBe(5);

    const node1 = canvas.nodes.get('n1');
    expect(node1.title).toBe('Document Ingestion');
    expect(node1.type).toBe('input');

    const node4 = canvas.nodes.get('n4');
    expect(node4.title).toBe('pgvector HNSW Store');
    expect(node4.params.distance).toBe('Cosine');
  });

  it('should load all flagship templates seamlessly', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const templates = ['rag', 'pipeline', 'infra', 'database', 'agent', 'devsecops'];
    templates.forEach(tKey => {
      canvas.loadTemplate(tKey);
      expect(canvas.nodes.size).toBeGreaterThanOrEqual(4);
      expect(canvas.connections.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should add, select, and delete nodes dynamically', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const initialCount = canvas.nodes.size;
    canvas.addNode({
      id: 'test_node_1',
      type: 'model',
      title: 'Ollama DeepSeek-R1',
      icon: '🧠',
      x: 200,
      y: 200,
      params: { quantization: 'q4_k_m' },
      desc: 'Local reasoning model'
    });

    expect(canvas.nodes.size).toBe(initialCount + 1);
    expect(canvas.selectedNodeId).toBe('test_node_1');

    canvas.deleteNode('test_node_1');
    expect(canvas.nodes.size).toBe(initialCount);
    expect(canvas.selectedNodeId).toBeNull();
  });

  it('should calculate and update node positions with autoLayout()', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'infra' });

    canvas.autoLayout();
    const nodes = Array.from(canvas.nodes.values());
    expect(nodes[0].x).toBe(60);
    expect(nodes[1].x).toBe(380);
    expect(nodes[2].x).toBe(700);
  });

  it('should generate technology-specific topologies for distinct domain studios', () => {
    // 1. Multimodal / Vision VLM
    const vlmTopo = VisualFlowCanvas.generateStudioTopology('mistral-pixtral-vlm', {
      title: 'Mistral Pixtral VLM Studio',
      category: 'ai'
    });
    expect(vlmTopo.nodes.length).toBe(5);
    expect(vlmTopo.nodes[1].title).toContain('Vision Transformer');
    expect(vlmTopo.nodes[2].title).toContain('Multimodal Cross-Projector');
    expect(vlmTopo.nodes[3].title).toContain('Pixtral Autoregressive');

    // 2. Linux Kernel & eBPF Continuous Profiler
    const ebpfTopo = VisualFlowCanvas.generateStudioTopology('ebpf-continuous-profiler', {
      title: 'eBPF Continuous Profiler Studio',
      category: 'observability'
    });
    expect(ebpfTopo.nodes.length).toBe(5);
    expect(ebpfTopo.nodes[0].title).toContain('Kernel Tracepoint Hook');
    expect(ebpfTopo.nodes[1].title).toContain('Kernel BPF Verifier');
    expect(ebpfTopo.nodes[2].title).toContain('Lockless RingBuffer');
    expect(ebpfTopo.nodes[3].title).toContain('DWARF Stack Unwinder');

    // 3. High-Performance LLM Serving & Speculative Decoding
    const vllmTopo = VisualFlowCanvas.generateStudioTopology('vllm-speculative-decoding', {
      title: 'vLLM Speculative Decoding Studio',
      category: 'ai'
    });
    expect(vllmTopo.nodes.length).toBe(5);
    expect(vllmTopo.nodes[1].title).toContain('PagedAttention');
    expect(vllmTopo.nodes[2].title).toContain('Speculative Draft');

    // 4. Kubernetes Karpenter Scaling
    const k8sTopo = VisualFlowCanvas.generateStudioTopology('karpenter-autoscaler', {
      title: 'AWS Karpenter Node Autoscaler',
      category: 'cloud'
    });
    expect(k8sTopo.nodes.length).toBe(5);
    expect(k8sTopo.nodes[1].title).toContain('Karpenter NodePool Consolidator');
    expect(k8sTopo.nodes[3].title).toContain('Cilium eBPF CNI');

    // 5. Agentic AI & Reasoning
    const agentTopo = VisualFlowCanvas.generateStudioTopology('langgraph-multi-agent', {
      title: 'LangGraph Multi-Agent Swarm',
      category: 'ai'
    });
    expect(agentTopo.nodes.length).toBe(6);
    expect(agentTopo.nodes[2].title).toContain('Jev Sub-100ms Reflex Router');
    expect(agentTopo.nodes[3].title).toContain('gVisor Sandboxed Tool Worker');
    expect(agentTopo.nodes[4].title).toContain('Zep Temporal Memory Store');

    // 6. DevSecOps & Supply Chain Security
    const devsecopsTopo = VisualFlowCanvas.generateStudioTopology('sigstore-cosign-slsa', {
      title: 'Sigstore Cosign SLSA Studio',
      category: 'security'
    });
    expect(devsecopsTopo.nodes.length).toBe(6);
    expect(devsecopsTopo.nodes[0].title).toContain('Git Signed Commit');
    expect(devsecopsTopo.nodes[1].title).toContain('Semgrep SAST');
    expect(devsecopsTopo.nodes[2].title).toContain('Syft SBOM');
    expect(devsecopsTopo.nodes[4].title).toContain('Sigstore Cosign');

    // 7. Dynamic synthesis fallback for arbitrary engineering studio
    const customTopo = VisualFlowCanvas.generateStudioTopology('custom-firmware-compiler', {
      title: 'Custom Firmware Compiler',
      category: 'embedded',
      tag: 'firmware.c',
      desc: 'Compile bare-metal ARM Cortex-M firmware'
    });
    expect(customTopo.nodes.length).toBe(5);
    expect(customTopo.nodes[0].title).toContain('Custom Firmware Compiler Ingestion');
    expect(customTopo.nodes[2].title).toContain('Core Engine: firmware.c');
  });

  it('should initialize canvas with a specific studio and load its technology topology', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, {
      studioId: 'mistral-pixtral-vlm',
      studiosList: [
        { title: 'Mistral Pixtral VLM Studio', link: 'mistral-pixtral-vlm/', category: 'ai' },
        { title: 'eBPF Continuous Profiler', link: 'ebpf-continuous-profiler/', category: 'observability' }
      ]
    });

    expect(canvas.nodes.size).toBe(5);
    expect(canvas.brandBadge.textContent).toContain('AI FLOW');
    expect(canvas.copilotGuide.innerHTML).toContain('Guided Multimodal Lab');

    // Dynamically switch studio to eBPF
    canvas.loadStudio('ebpf-continuous-profiler');
    expect(canvas.nodes.size).toBe(5);
    expect(canvas.brandBadge.textContent).toContain('OBSERVABILITY FLOW');
    expect(canvas.copilotGuide.innerHTML).toContain('Kernel eBPF Diagnostics');
  });

  it('should populate studio dropdown selector with grouped options', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, {
      studiosList: [
        { title: 'Mistral Pixtral VLM Studio', link: 'mistral-pixtral-vlm/', category: 'ai' },
        { title: 'eBPF Continuous Profiler', link: 'ebpf-continuous-profiler/', category: 'observability' },
        { title: 'Karpenter Fleet Scaler', link: 'karpenter-autoscaler/', category: 'cloud' }
      ]
    });

    const select = container.querySelector('#vfStudioSelect');
    expect(select).toBeTruthy();
    expect(select.querySelectorAll('option').length).toBeGreaterThanOrEqual(4);
  });

  it('should support fitView() to automatically center and scale DAG within viewport', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    expect(typeof canvas.fitView).toBe('function');
    canvas.fitView();
    expect(canvas.scale).toBeGreaterThan(0.3);
    expect(canvas.scale).toBeLessThanOrEqual(1.2);
    expect(canvas.panOffset).toBeDefined();
    expect(typeof canvas.panOffset.x).toBe('number');
    expect(typeof canvas.panOffset.y).toBe('number');

    const fitBtn = container.querySelector('#vfFitViewBtn');
    expect(fitBtn).toBeTruthy();
  });

  it('should switch bottom drawer tabs to golden signals and generated manifest', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'agent' });

    // Switch to Golden Signals
    canvas.switchDrawerTab('metrics');
    const metricsPanel = container.querySelector('#vfMetricsPanel');
    expect(metricsPanel).toBeTruthy();
    expect(metricsPanel.style.display).toBe('block');
    expect(metricsPanel.innerHTML).toContain('End-to-End Latency');
    expect(metricsPanel.innerHTML).toContain('Golden Signals Breakdown');

    // Switch to Generated Manifest
    canvas.switchDrawerTab('code');
    const manifestPanel = container.querySelector('#vfManifestPanel');
    expect(manifestPanel).toBeTruthy();
    expect(manifestPanel.style.display).toBe('block');
    expect(manifestPanel.innerHTML).toContain('VisualFlowPipeline');
    expect(manifestPanel.innerHTML).toContain('Copy Manifest');

    // Switch back to logs
    canvas.switchDrawerTab('logs');
    expect(container.querySelector('#vfTerminalBody').style.display).toBe('block');
  });

  it('should render category accent bar and parameters on node cards', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const nodes = container.querySelectorAll('.vf-node');
    expect(nodes.length).toBe(6);

    const firstNode = nodes[0];
    expect(firstNode.querySelector('.vf-node-accent')).toBeTruthy();
    expect(firstNode.querySelector('.vf-port-input')).toBeTruthy();
    expect(firstNode.querySelector('.vf-port-output')).toBeTruthy();
    expect(firstNode.querySelectorAll('.vf-node-param').length).toBeGreaterThan(0);
  });

  it('should auto-select primary node on load and render overview stage navigator when deselected', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    // Primary node should be selected on load
    expect(canvas.selectedNodeId).toBeTruthy();
    const inspector = container.querySelector('#vfInspectorContent');
    expect(inspector.innerHTML).toContain('Active Parameters');
    expect(inspector.innerHTML).toContain('Component Label');

    // Deselect should render interactive stage overview navigator
    canvas._renderInspector(null);
    expect(inspector.innerHTML).toContain('Pipeline Architecture');
    expect(inspector.querySelectorAll('.vf-stage-quick-btn').length).toBe(canvas.nodes.size);
  });

  it('should support collapsing and expanding sidebars and toggling Zen mode', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const sidebarLeft = container.querySelector('#vfSidebarLeft');
    const sidebarRight = container.querySelector('#vfSidebarRight');
    const expandLeftBtn = container.querySelector('#vfExpandLeftBtn');
    const expandRightBtn = container.querySelector('#vfExpandRightBtn');
    const zenBtn = container.querySelector('#vfZenBtn');

    // Initially expanded
    expect(sidebarLeft.classList.contains('collapsed')).toBe(false);
    expect(sidebarRight.classList.contains('collapsed')).toBe(false);

    // Collapse left sidebar
    canvas.toggleLeftSidebar(false);
    expect(sidebarLeft.classList.contains('collapsed')).toBe(true);
    expect(expandLeftBtn.classList.contains('visible')).toBe(true);

    // Expand left sidebar
    canvas.toggleLeftSidebar(true);
    expect(sidebarLeft.classList.contains('collapsed')).toBe(false);
    expect(expandLeftBtn.classList.contains('visible')).toBe(false);

    // Collapse right sidebar
    canvas.toggleRightSidebar(false);
    expect(sidebarRight.classList.contains('collapsed')).toBe(true);
    expect(expandRightBtn.classList.contains('visible')).toBe(true);

    // Expand right sidebar
    canvas.toggleRightSidebar(true);
    expect(sidebarRight.classList.contains('collapsed')).toBe(false);
    expect(expandRightBtn.classList.contains('visible')).toBe(false);

    // Toggle Zen Mode (collapses both)
    canvas.toggleZenMode();
    expect(sidebarLeft.classList.contains('collapsed')).toBe(true);
    expect(sidebarRight.classList.contains('collapsed')).toBe(true);
    expect(zenBtn.textContent).toContain('Exit Zen');

    // Toggle Zen Mode again (restores both)
    canvas.toggleZenMode();
    expect(sidebarLeft.classList.contains('collapsed')).toBe(false);
    expect(sidebarRight.classList.contains('collapsed')).toBe(false);
    expect(zenBtn.textContent).toContain('Zen Canvas');
  });

  it('should toggle bottom drawer state and update chevron and text', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const drawer = container.querySelector('#vfDrawer');
    const drawerHeader = container.querySelector('#vfDrawerHeader');
    const drawerChevron = container.querySelector('#vfDrawerChevron');
    const drawerText = container.querySelector('#vfDrawerText');

    expect(drawer.classList.contains('collapsed')).toBe(false);
    expect(drawerChevron.textContent).toBe('▼');

    // Click header to collapse
    drawerHeader.click();
    expect(drawer.classList.contains('collapsed')).toBe(true);
    expect(drawerChevron.textContent).toBe('▲');
    expect(drawerText.textContent).toBe('Expand Drawer');

    // Click header again to expand
    drawerHeader.click();
    expect(drawer.classList.contains('collapsed')).toBe(false);
    expect(drawerChevron.textContent).toBe('▼');
    expect(drawerText.textContent).toBe('Collapse Drawer');
  });

  it('should support persistence: save, restore, and import flow project specifications', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { studioId: 'test-studio', activeTemplate: 'rag' });

    // 1. Save project to localStorage
    const saveResult = canvas.saveProject();
    expect(saveResult).toBe(true);

    const savedRaw = window.localStorage.getItem('vf_project_test-studio');
    expect(savedRaw).toBeTruthy();
    const parsed = JSON.parse(savedRaw);
    expect(parsed.nodes.length).toBe(canvas.nodes.size);

    // 2. Clear canvas and restore
    canvas.nodes.clear();
    canvas.connections = [];
    expect(canvas.nodes.size).toBe(0);

    const restoreResult = canvas.restoreProject();
    expect(restoreResult).toBe(true);
    expect(canvas.nodes.size).toBe(parsed.nodes.length);

    // 3. Import JSON flow specification
    const sampleSpec = {
      version: 'pradeep.flow.v1',
      name: 'Imported Microservice DAG',
      nodes: [
        { id: 'imp_1', title: 'Gateway Ingress', type: 'input', x: 50, y: 100 },
        { id: 'imp_2', title: 'Payment Processor', type: 'transform', x: 350, y: 100 }
      ],
      connections: [
        { from: 'imp_1', to: 'imp_2' }
      ]
    };

    const importResult = canvas.importProject(JSON.stringify(sampleSpec));
    expect(importResult).toBe(true);
    expect(canvas.nodes.size).toBe(2);
    expect(canvas.connections.length).toBe(1);
    expect(canvas.nodes.get('imp_1').title).toBe('Gateway Ingress');
  });

  it('should support all 12 flow directions in the direction selector and engine', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });
    const select = container.querySelector('#vfFlowDirectionSelect');
    expect(select).toBeTruthy();

    const expectedDirections = [
      'happy', 'reverse', 'failure', 'retry', 'rollback', 'dependency',
      'data', 'security', 'observability', 'recovery', 'performance', 'learning'
    ];

    expectedDirections.forEach(dir => {
      const option = select.querySelector(`option[value="${dir}"]`);
      expect(option).toBeTruthy();
    });

    // Test changing flow direction
    select.value = 'reverse';
    select.dispatchEvent(new window.Event('change'));
    expect(canvas.activeFlowDirection).toBe('reverse');

    select.value = 'rollback';
    select.dispatchEvent(new window.Event('change'));
    expect(canvas.activeFlowDirection).toBe('rollback');
  });

  it('should support 8 node states and render color-coded status pills', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const validStates = ['pending', 'running', 'passed', 'failed', 'blocked', 'skipped', 'unknown', 'stale'];
    const node = canvas.nodes.get('n1');

    validStates.forEach(st => {
      node.state = st;
      canvas.render();
      const nodeEl = container.querySelector(`[data-id="n1"]`);
      expect(nodeEl.classList.contains(`state-${st}`)).toBe(true);
      const pill = nodeEl.querySelector('.vf-node-status-pill');
      expect(pill).toBeTruthy();
      expect(pill.textContent).toBe(st);
    });
  });

  it('should render dual explanations (Beginner vs Technical) and allow switching', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });
    canvas.selectNode('n1');

    const tabBeg = container.querySelector('#tabExpBeginner');
    const tabTech = container.querySelector('#tabExpTechnical');
    const expBody = container.querySelector('#expBody');

    expect(tabBeg).toBeTruthy();
    expect(tabTech).toBeTruthy();
    expect(expBody).toBeTruthy();

    // Default is beginner
    expect(tabBeg.classList.contains('active')).toBe(true);

    // Switch to technical
    tabTech.click();
    expect(tabTech.classList.contains('active')).toBe(true);
    expect(tabBeg.classList.contains('active')).toBe(false);

    // Switch back to beginner
    tabBeg.click();
    expect(tabBeg.classList.contains('active')).toBe(true);
    expect(tabTech.classList.contains('active')).toBe(false);
  });

  it('should render 3 progressive hint levels with interactive reveal toggles', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });
    canvas.selectNode('n1');

    const hint1Body = container.querySelector('#hint-body-1');
    const hint2Body = container.querySelector('#hint-body-2');
    const hint3Body = container.querySelector('#hint-body-3');

    expect(hint1Body).toBeTruthy();
    expect(hint2Body).toBeTruthy();
    expect(hint3Body).toBeTruthy();

    // All hints start hidden for progressive disclosure
    expect(hint1Body.style.display).toBe('none');
    expect(hint2Body.style.display).toBe('none');
    expect(hint3Body.style.display).toBe('none');

    // Toggle reveal Level 1
    const btn1 = container.querySelector('.vf-hint-reveal-btn[data-hint="1"]');
    expect(btn1).toBeTruthy();
    btn1.click();
    expect(hint1Body.style.display).toBe('block');
    expect(btn1.textContent).toBe('Hide');

    btn1.click();
    expect(hint1Body.style.display).toBe('none');
    expect(btn1.textContent).toBe('Reveal');

    // Toggle reveal Level 2
    const btn2 = container.querySelector('.vf-hint-reveal-btn[data-hint="2"]');
    expect(btn2).toBeTruthy();
    btn2.click();
    expect(hint2Body.style.display).toBe('block');
    expect(btn2.textContent).toBe('Hide');
  });

  it('should provide interactive playback controls: step forward, step backward, reset, and failure injection', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const stepFwdBtn = container.querySelector('#vfStepForwardBtn');
    const stepBackBtn = container.querySelector('#vfStepBackBtn');
    const resetBtn = container.querySelector('#vfResetFlowBtn');
    const injectFailBtn = container.querySelector('#vfInjectFailureBtn');

    expect(stepFwdBtn).toBeTruthy();
    expect(stepBackBtn).toBeTruthy();
    expect(resetBtn).toBeTruthy();
    expect(injectFailBtn).toBeTruthy();

    // Step forward 1
    canvas.stepForward();
    expect(canvas.executionStep).toBe(1);
    const n0 = Array.from(canvas.nodes.values())[0];
    expect(n0.state).toBe('passed');

    // Step forward 2
    canvas.stepForward();
    expect(canvas.executionStep).toBe(2);
    const n1 = Array.from(canvas.nodes.values())[1];
    expect(n1.state).toBe('passed');

    // Step backward
    canvas.stepBackward();
    expect(canvas.executionStep).toBe(1);
    expect(n1.state).toBe('pending');

    // Failure injection
    canvas.injectFailure();
    const failedNode = Array.from(canvas.nodes.values()).find(n => n.state === 'failed');
    expect(failedNode).toBeTruthy();
    const blockedNode = Array.from(canvas.nodes.values()).find(n => n.state === 'blocked');
    expect(blockedNode).toBeTruthy();

    // Reset
    canvas.resetSimulation();
    expect(canvas.executionStep).toBe(0);
    Array.from(canvas.nodes.values()).forEach(n => {
      expect(n.state).toBe('pending');
    });
  });

  it('should open Manim MCP Modal with synthesized Python animation script', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    const manimBtn = container.querySelector('#vfManimMcpBtn');
    expect(manimBtn).toBeTruthy();

    // Open Manim modal
    canvas.openManimModal();
    const modal = document.getElementById('vfManimModal');
    expect(modal).toBeTruthy();
    expect(modal.style.display).toBe('flex');

    const codePreview = modal.querySelector('.vf-code-preview');
    expect(codePreview).toBeTruthy();
    expect(codePreview.textContent).toContain('from manim import *');
    expect(codePreview.textContent).toContain('Scene(Scene):');

    const copyBtn = modal.querySelector('#btnCopyManimCode');
    expect(copyBtn).toBeTruthy();

    const closeBtn = modal.querySelector('#btnManimModalClose');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(modal.style.display).toBe('none');
  });

  it('should immediately display the Dynamic Flow HUD Banner and update node mode pills when Learning Flow is selected', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    // Select Learning Flow
    canvas.setFlowDirection('learning');

    expect(canvas.activeFlowDirection).toBe('learning');
    const banner = container.querySelector('#vfDirectionBanner');
    expect(banner).toBeTruthy();
    expect(banner.style.display).toBe('flex');
    expect(banner.innerHTML).toContain('12. Learning Flow');
    expect(banner.innerHTML).toContain('COMPLETE LEARNING LOOP');
    expect(banner.innerHTML).toContain('Prerequisites ➔ Concept Lesson');

    // Verify nodes have learning phase pills
    const pills = container.querySelectorAll('.vf-node-mode-pill.learning');
    expect(pills.length).toBe(canvas.nodes.size);
    expect(pills[0].textContent).toContain('Phase 1: Prerequisites');
    expect(pills[1].textContent).toContain('Phase 2: Theory Lesson');
    expect(pills[2].textContent).toContain('Phase 3: Interactive Lab');

    // Verify Copilot Guide updated with 5 phases
    const guide = container.querySelector('#vfCopilotGuide');
    expect(guide.innerHTML).toContain('The 5-Phase Learning Journey');
    expect(guide.innerHTML).toContain('Phase 1: Prerequisites Check');
    expect(guide.innerHTML).toContain('Phase 5: Portfolio Project');

    // Test banner dismissal
    const closeBtn = banner.querySelector('#btnCloseDirectionBanner');
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    expect(banner.style.display).toBe('none');
  });

  it('should adapt banner and node mode pills when selecting Security and Observability flows', () => {
    const container = document.getElementById('flowWorkspaceContainer');
    const canvas = new VisualFlowCanvas(container, { activeTemplate: 'rag' });

    // Select Security Flow
    canvas.setFlowDirection('security');
    expect(canvas.activeFlowDirection).toBe('security');
    const banner = container.querySelector('#vfDirectionBanner');
    expect(banner.style.display).toBe('flex');
    expect(banner.innerHTML).toContain('Zero-Trust');

    const secPills = container.querySelectorAll('.vf-node-mode-pill.security');
    expect(secPills.length).toBe(canvas.nodes.size);

    // Select Observability Flow
    canvas.setFlowDirection('observability');
    expect(canvas.activeFlowDirection).toBe('observability');
    expect(banner.innerHTML).toContain('MELT Signals');

    const obsPills = container.querySelectorAll('.vf-node-mode-pill.observability');
    expect(obsPills.length).toBe(canvas.nodes.size);
  });
});

