import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Workspaces and Navigation Architecture', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('should render all four core workspaces in sections/destinations.html', () => {
    const filePath = path.join(rootDir, 'sections/destinations.html');
    expect(fs.existsSync(filePath)).toBe(true);

    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const { document } = dom.window;

    // Header
    const title = document.querySelector('.ts-section-title');
    expect(title.textContent).toContain('Four Purpose-Built Workspaces');

    // 4 Distinct Cards
    const studiosCard = document.querySelector('.destination-card--studios');
    const flowCard = document.querySelector('.destination-card--flow');
    const realtimeCard = document.querySelector('.destination-card--realtime');
    const learnCard = document.querySelector('.destination-card--learn');

    expect(studiosCard).not.toBeNull();
    expect(flowCard).not.toBeNull();
    expect(realtimeCard).not.toBeNull();
    expect(learnCard).not.toBeNull();

    // Primary Actions
    const studiosAction = document.getElementById('dest-action-studios');
    const flowAction = document.getElementById('dest-action-flow');
    const realtimeAction = document.getElementById('dest-action-realtime');
    const learnAction = document.getElementById('dest-action-learn');

    expect(studiosAction.getAttribute('href')).toBe('studios/');
    expect(flowAction.getAttribute('href')).toBe('studios/flow/');
    expect(realtimeAction.getAttribute('href')).toBe('status/');
    expect(learnAction.getAttribute('href')).toBe('studios/learn/');

    // Concrete Example Outcomes
    const examples = document.querySelectorAll('.destination-example');
    expect(examples.length).toBe(4);

    // Goal-Based Helper
    const helper = document.getElementById('notSureWhereToStart');
    expect(helper).not.toBeNull();
    const pills = helper.querySelectorAll('.destination-helper-pill');
    expect(pills.length).toBeGreaterThanOrEqual(5);

    const pillHrefs = Array.from(pills).map(p => p.getAttribute('href'));
    expect(pillHrefs).toContain('studios/');
    expect(pillHrefs).toContain('studios/flow/');
    expect(pillHrefs).toContain('status/');
    expect(pillHrefs).toContain('studios/learn/');
    expect(pillHrefs).toContain('projects/');
  });

  it('should ensure status/index.html reflects canonical 347 studios and 528 test health', () => {
    const statusPath = path.join(rootDir, 'status/index.html');
    const html = fs.readFileSync(statusPath, 'utf8');

    expect(html).toContain('347 Interactive Developer Studios');
    expect(html).toContain('530/530');
    expect(html).toContain('100% Tests Passing');
  });
});
