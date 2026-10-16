import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Projects Showcase & 341 Open Source Repositories Explorer', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../projects/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/projects/'
    });
    window = dom.window;
    document = window.document;
  });

  it('should render the 6 flagship architectural systems cards', () => {
    const flagshipCards = document.querySelectorAll('.project-card');
    expect(flagshipCards.length).toBe(6);

    const titles = Array.from(flagshipCards).map(c => c.querySelector('.project-title')?.textContent?.trim());
    expect(titles).toContain('Enterprise Agentic Operating System');
    expect(titles).toContain('Enterprise Hybrid RAG Platform');
    expect(titles).toContain('AI Infrastructure Monitoring Copilot');
    expect(titles).toContain('Cloud Landing Zone & IaC Platform');
    expect(titles).toContain('Enterprise Observability Platform');
    expect(titles).toContain('WhatsApp & Voice AI Assistant Platform');
  });

  it('should have the 347 Open Source Repositories Explorer section and controls', () => {
    const reposSection = document.getElementById('reposDirectory');
    expect(reposSection).toBeTruthy();

    const searchInput = document.getElementById('repoSearchInput');
    expect(searchInput).toBeTruthy();
    expect(searchInput.getAttribute('placeholder')).toContain('Search 347 repositories');

    const filterTabs = document.getElementById('repoFilterTabs');
    expect(filterTabs).toBeTruthy();
    const tabBtns = filterTabs.querySelectorAll('.repo-tab-btn');
    expect(tabBtns.length).toBe(7); // all, ai, automation, observability, cloud, cicd, devops

    const countDisplay = document.getElementById('repoCountDisplay');
    expect(countDisplay).toBeTruthy();
    expect(countDisplay.textContent).toContain('347');

    const gridContainer = document.getElementById('repoGridContainer');
    expect(gridContainer).toBeTruthy();
  });

  it('should verify tools.json contains exactly 347 tools with valid repository mappings', () => {
    const toolsPath = path.resolve(__dirname, '../tools/tools.json');
    const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

    expect(tools.length).toBe(347);
    tools.forEach(t => {
      expect(t.title).toBeTruthy();
      expect(t.repository).toBeTruthy();
      expect(t.repository).toMatch(/^Pradeeptalari14\//);
      expect(t.link).toBeTruthy();
    });
  });

  it('should verify STUDIOS_AND_REPOSITORIES.md and GITHUB_PROVISIONING_GUIDE.md catalog all 347 repositories', () => {
    const catDoc = fs.readFileSync(path.resolve(__dirname, '../STUDIOS_AND_REPOSITORIES.md'), 'utf8');
    expect(catDoc).toContain('347 Developer Studios & Repositories');
    expect(catDoc).toContain('`347`');

    const provGuide = fs.readFileSync(path.resolve(__dirname, '../GITHUB_PROVISIONING_GUIDE.md'), 'utf8');
    expect(provGuide).toContain('all **347 Developer Studios**');
    expect(provGuide).toContain('Exhaustive 347-Repository Execution Matrix');
  });

  it('should verify sections/projects.html points to all 347 repositories', () => {
    const secHtml = fs.readFileSync(path.resolve(__dirname, '../sections/projects.html'), 'utf8');
    expect(secHtml).toContain('347 Repositories');
    expect(secHtml).toContain('Explore 6 Flagship Platforms &amp; All 347 Open Source Repositories');
  });
});
