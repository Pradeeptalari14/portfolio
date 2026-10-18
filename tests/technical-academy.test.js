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

    // Node Details Drawer Tabs
    const dtabs = document.querySelectorAll('.dtab-btn');
    expect(dtabs.length).toBe(4);

    // Live Status HUD
    const hud = document.querySelector('.live-status-hud');
    expect(hud).not.toBeNull();
    expect(hud.textContent).toContain('95.2%');
    expect(hud.textContent).toContain('2m 18s');
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
  });
});
