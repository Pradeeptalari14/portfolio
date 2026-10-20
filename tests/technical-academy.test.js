import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Technical Academy & Interactive Engineering Lab (4-Quadrant Experience)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const academyHtmlPath = path.join(rootDir, 'academy', 'index.html');
  const academyCssPath = path.join(rootDir, 'academy', 'academy.css');
  const academyJsPath = path.join(rootDir, 'academy', 'academy.js');

  it('should verify academy files exist and are populated', () => {
    expect(fs.existsSync(academyHtmlPath)).toBe(true);
    expect(fs.existsSync(academyCssPath)).toBe(true);
    expect(fs.existsSync(academyJsPath)).toBe(true);

    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    expect(html.length).toBeGreaterThan(1000);
  });

  it('should render the top navigation bar with brand, search, and user streak', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const brand = document.querySelector('.nav-brand-logo');
    expect(brand).not.toBeNull();
    expect(brand.textContent).toContain('TalariPradeep');

    const search = document.getElementById('academyGlobalSearch');
    expect(search).not.toBeNull();
    expect(search.getAttribute('placeholder')).toContain('Search Studios');

    const streak = document.querySelector('.user-streak-badge');
    expect(streak).not.toBeNull();
    expect(streak.textContent).toContain('42 Streak');
  });

  it('should provide view mode switcher for all 4 quadrants and single-focus views', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const tabs = document.querySelectorAll('.view-mode-btn');
    expect(tabs.length).toBe(5);

    const modes = Array.from(tabs).map(t => t.dataset.mode);
    expect(modes).toContain('quad');
    expect(modes).toContain('dash');
    expect(modes).toContain('lesson');
    expect(modes).toContain('flow');
    expect(modes).toContain('lab');
  });

  it('should render Quadrant 1: Learning Dashboard with path ladder and studio tracks', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const quad1 = document.getElementById('quad-dash');
    expect(quad1).not.toBeNull();

    // Welcome title & streak
    const title = document.getElementById('dashTitle');
    expect(title.textContent).toContain('Welcome back, Pradeep!');

    // Continue learning card
    const continueCard = document.querySelector('.continue-card');
    expect(continueCard).not.toBeNull();
    expect(continueCard.textContent).toContain('Kubernetes Fundamentals');
    expect(continueCard.textContent).toContain('In Progress');

    // 4-Step Learning Path Ladder
    const pathCards = document.querySelectorAll('.path-step-card');
    expect(pathCards.length).toBe(4);
    const pathText = Array.from(pathCards).map(p => p.textContent.trim()).join(' ');
    expect(pathText).toContain('Learn');
    expect(pathText).toContain('Lab');
    expect(pathText).toContain('Flow');
    expect(pathText).toContain('Project');

    // Studios Track Grid
    const tracks = document.querySelectorAll('.track-box');
    expect(tracks.length).toBeGreaterThanOrEqual(4);
  });

  it('should render Quadrant 2: Structured Lesson with syllabus, tabs, objectives, and quiz', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const quad2 = document.getElementById('quad-lesson');
    expect(quad2).not.toBeNull();

    // Module syllabus
    const modules = document.querySelectorAll('.tree-module-group');
    expect(modules.length).toBe(4);

    // Lesson Tabs
    const tabs = document.querySelectorAll('#lessonTabs .tab-btn');
    expect(tabs.length).toBe(6);
    const tabNames = Array.from(tabs).map(t => t.dataset.tab);
    expect(tabNames).toEqual(['overview', 'visual', 'examples', 'quiz', 'notes', 'resources']);

    // Learning Objectives Checklist
    const objectives = document.querySelectorAll('.objectives-list li');
    expect(objectives.length).toBe(3);

    // Interactive Quiz
    const quizPanel = document.getElementById('panel-quiz');
    expect(quizPanel).not.toBeNull();
    const submitBtn = document.getElementById('btnSubmitQuiz');
    expect(submitBtn).not.toBeNull();
  });

  it('should render Quadrant 3: Interactive Engineering Flow with DAG nodes and live status HUD', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const quad3 = document.getElementById('quad-flow');
    expect(quad3).not.toBeNull();

    // 7 Pipeline Nodes
    const nodes = document.querySelectorAll('.pipeline-node');
    expect(nodes.length).toBe(7);
    const nodeKeys = Array.from(nodes).map(n => n.dataset.node);
    expect(nodeKeys).toEqual(['dev', 'git', 'build', 'test', 'security', 'deploy', 'monitor']);

    // Node Details Drawer Tabs (Details, Live State, Verification & Logs, Remediation, Hints)
    const dtabs = document.querySelectorAll('.dtab-btn');
    expect(dtabs.length).toBe(5);

    // Live Status HUD
    const hud = document.querySelector('.live-status-hud');
    expect(hud).not.toBeNull();
    expect(hud.textContent).toContain('95.2%');
    expect(hud.textContent).toContain('2m 18s');

    // Flow controls: failure injection and reset
    expect(document.getElementById('btnInjectFailureDrill')).not.toBeNull();
    expect(document.getElementById('btnFlowReset')).not.toBeNull();
  });

  it('should render Quadrant 4: Practical Lab with 5 steps, terminal sandbox, and quick commands', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const quad4 = document.getElementById('quad-lab');
    expect(quad4).not.toBeNull();

    // 5 Steps Progression
    const steps = document.querySelectorAll('.lab-step-btn');
    expect(steps.length).toBe(5);

    // Expected Output Block
    const expected = document.getElementById('labStepExpected');
    expect(expected).not.toBeNull();
    expect(expected.textContent).toContain('kubectl get deployments');

    // Terminal Input
    const termInput = document.getElementById('termInputField');
    expect(termInput).not.toBeNull();

    // Lab Environment Timer
    const timer = document.getElementById('labCountdownTimer');
    expect(timer).not.toBeNull();
    expect(timer.textContent).toBe('29:15');

    // Quick Command Buttons
    const quickCmds = document.querySelectorAll('.btn-quick-cmd');
    expect(quickCmds.length).toBe(4);

    // Lab Actions: End Lab, Reset Lab, Hints Drawer, and Copy Button
    expect(document.getElementById('btnEndLab')).not.toBeNull();
    expect(document.getElementById('btnResetLab')).not.toBeNull();
    expect(document.getElementById('btnToggleHint')).not.toBeNull();
    expect(document.getElementById('btnToggleSolution')).not.toBeNull();
    expect(document.getElementById('btnCopyLabCode')).not.toBeNull();
    expect(document.getElementById('btnRunLabValidation')).not.toBeNull();
    expect(document.getElementById('academyModal')).not.toBeNull();

    // Multi-Scenario Project Picker & Real-Time Hits Bar
    expect(document.getElementById('labProjectSelect')).not.toBeNull();
    expect(document.getElementById('terminalHitsBar')).not.toBeNull();
    const hitBtns = document.querySelectorAll('.btn-terminal-hit');
    expect(hitBtns.length).toBeGreaterThanOrEqual(4);
  });

  it('should render Execution & Telemetry Engine Status Bar with live probe, virtual sandbox, simulated DAG, and localStorage indicators', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    const statusBar = document.querySelector('.academy-engine-status-bar');
    expect(statusBar).not.toBeNull();

    const rttProbe = document.getElementById('edgeProbeRtt');
    expect(rttProbe).not.toBeNull();

    const pulse = document.querySelector('.pulse-indicator');
    expect(pulse).not.toBeNull();

    expect(statusBar.textContent).toContain('Virtual Container Sandbox');
    expect(statusBar.textContent).toContain('Simulated State Machine');
    expect(statusBar.textContent).toContain('localStorage Active');
  });

  it('should render Real versus Simulated status badges across KPIs, Flow, HUD, and Lab', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // KPI Badges
    const kpis = document.querySelector('.dash-kpis');
    expect(kpis.textContent).toContain('Demo Benchmark');
    expect(kpis.textContent).toContain('Demo Target');
    expect(kpis.textContent).toContain('Local Calculated');

    // Flow & HUD Badges
    const flowTitle = document.getElementById('flowHeading');
    expect(flowTitle.textContent).toContain('Simulated DAG Drill');

    const hudTitle = document.querySelector('.live-status-hud .hud-title');
    expect(hudTitle.textContent).toContain('Simulated State Machine');

    // Lab Badges
    const labBadge = document.querySelector('.lab-project-badge');
    expect(labBadge.textContent).toContain('Virtual Sandbox');

    const envHud = document.querySelector('.env-hud-card');
    expect(envHud.textContent).toContain('Simulated Kind Cluster');
  });

  it('should provide zero-search Next-Step Journey with Studio, Flow, Lab, and Project links across all 10 topics', () => {
    const html = fs.readFileSync(academyHtmlPath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Journey Card in DOM
    const journeyCard = document.querySelector('.next-step-journey-card');
    expect(journeyCard).not.toBeNull();
    expect(document.getElementById('journeyStudioLink')).not.toBeNull();
    expect(document.getElementById('journeyFlowLink')).not.toBeNull();
    expect(document.getElementById('journeyLabLink')).not.toBeNull();
    expect(document.getElementById('journeyProjectLink')).not.toBeNull();

    // Verify 10 distinct topics in syllabus nav
    const treeBtns = document.querySelectorAll('.tree-item-btn');
    expect(treeBtns.length).toBe(10);
    const topicKeys = Array.from(treeBtns).map(b => b.dataset.topic);
    const expectedTopics = [
      'intro-k8s', 'arch-overview', 'usecases-k8s',
      'pods-containers', 'deployments-replicas', 'services-endpoints', 'config-secrets',
      'ingress-controllers', 'network-policies', 'persistent-volumes'
    ];
    expect(topicKeys).toEqual(expectedTopics);

    // Verify academy.js topicDb contains all 10 topics with complete journey links
    const jsContent = fs.readFileSync(academyJsPath, 'utf8');
    expectedTopics.forEach(topic => {
      expect(jsContent).toContain(`'${topic}':`);
    });
  });
});

