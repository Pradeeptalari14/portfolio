import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Studios Workbench Hub (studios/index.html)', () => {
  let dom;
  let window;
  let document;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, '../studios/index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(htmlContent, {
      url: 'http://localhost/studios/',
      runScripts: 'outside-only'
    });
    window = dom.window;
    document = window.document;
  });

  it('should render brand navigation with backend status pill and workspace selector', () => {
    const brand = document.querySelector('.hub-brand');
    expect(brand).toBeTruthy();
    expect(brand.textContent).toContain('TALARI PRADEEP');

    const statusPill = document.getElementById('backendStatusPill');
    expect(statusPill).toBeTruthy();
    expect(statusPill.textContent).toContain('Checking Platform Status');

    const workspaceBtn = document.getElementById('workspaceBtn');
    expect(workspaceBtn).toBeTruthy();
    expect(workspaceBtn.textContent).toContain('Workspace');

    const copilotBtn = document.getElementById('copilotHeaderBtn');
    expect(copilotBtn).toBeTruthy();
    expect(copilotBtn.textContent).toContain('SRE Copilot');
  });

  it('should render the search bar and skill maturity level filters', () => {
    const searchInput = document.getElementById('studioSearch');
    expect(searchInput).toBeTruthy();
    expect(searchInput.getAttribute('placeholder')).toContain('Search 341 engineering studios');

    const levelFilters = document.getElementById('levelFilters');
    expect(levelFilters).toBeTruthy();
    const levelBtns = levelFilters.querySelectorAll('.level-btn');
    expect(levelBtns.length).toBe(5); // all, 1, 2, 3, 4
  });

  it('should contain the collapsible SRE AI Copilot drawer and prompt chips', () => {
    const drawer = document.getElementById('copilotDrawer');
    expect(drawer).toBeTruthy();

    const drawerTitle = drawer.querySelector('.drawer-title');
    expect(drawerTitle.textContent).toContain('SRE AI Copilot');

    const promptChips = drawer.querySelectorAll('.prompt-chip');
    expect(promptChips.length).toBeGreaterThanOrEqual(3);

    const copilotInput = document.getElementById('copilotInput');
    expect(copilotInput).toBeTruthy();

    const sendBtn = document.getElementById('copilotSendBtn');
    expect(sendBtn).toBeTruthy();
  });

  it('should contain the Project Workspaces modal and creation controls', () => {
    const modal = document.getElementById('workspaceModal');
    expect(modal).toBeTruthy();

    const newWorkspaceInput = document.getElementById('newWorkspaceNameInput');
    expect(newWorkspaceInput).toBeTruthy();

    const createBtn = document.getElementById('createWorkspaceBtn');
    expect(createBtn).toBeTruthy();
  });

  it('should preserve the main studios grid container and category pills', () => {
    const grid = document.getElementById('studioGrid');
    expect(grid).toBeTruthy();

    const pills = document.getElementById('categoryPills');
    expect(pills).toBeTruthy();
    const catBtns = pills.querySelectorAll('.cat-btn');
    expect(catBtns.length).toBeGreaterThanOrEqual(8);
  });
});
