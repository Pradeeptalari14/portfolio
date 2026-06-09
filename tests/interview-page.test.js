import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('SRE Interview Page Interactivity', () => {
  let dom;
  let window;

  beforeAll(() => {
    const filePath = path.resolve(__dirname, '../interview/index.html');
    const htmlText = fs.readFileSync(filePath, 'utf8');

    // Create JSDOM instance with local URL to support localStorage and disable auto-execution
    dom = new JSDOM(htmlText, {
      url: "http://localhost/interview/",
      runScripts: "outside-only"
    });
    window = dom.window;

    // Define mocks BEFORE running scripts
    window.mermaid = {
      run: () => {},
      initialize: () => {}
    };

    // Mock clipboard API
    window.navigator.clipboard = {
      writeText: () => Promise.resolve()
    };

    // Mock fetch for tools.json
    window.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { title: "🐳 Docker Manager", category: "Config & Auto", repository: "Pradeeptalari14/tp-docker", link: "docker/" }
      ])
    });

    // Manually execute inline scripts after definitions are mocked
    const scripts = window.document.querySelectorAll('script');
    scripts.forEach(script => {
      if (!script.src && script.textContent) {
        try {
          window.eval(script.textContent);
        } catch (err) {
          console.error('Script execution error in test setup:', err);
        }
      }
    });

    // Dispatch DOMContentLoaded to trigger page init
    const event = new window.Event('DOMContentLoaded');
    window.dispatchEvent(event);
    window.document.dispatchEvent(event);
  });

  it('should initialize and show onboarding modal by default', () => {
    const modal = window.document.getElementById('onboarding-modal');
    expect(modal).not.toBeNull();
    // In local storage it should be empty, so modal is not display: none
    expect(modal.style.display).not.toBe('none');
  });

  it('should hide onboarding modal and set focus level when setKnowledgeLevel is called', () => {
    window.setKnowledgeLevel('Beginner');
    const modal = window.document.getElementById('onboarding-modal');
    expect(modal.style.display).toBe('none');
    expect(window.localStorage.getItem('sre_focus_level')).toBe('Beginner');
    expect(window.document.getElementById('telemetry-focus').textContent).toBe('Beginner');
  });

  it('should switch pillars correctly', () => {
    expect(window.switchPillar).toBeTypeOf('function');
    
    const btn = window.document.querySelector('.pillar-btn');
    expect(btn).not.toBeNull();
    
    window.switchPillar('about', btn);
    expect(btn.classList.contains('active')).toBe(true);
  });

  it('should switch tabs correctly', () => {
    expect(window.switchTab).toBeTypeOf('function');
    
    const btn = window.document.querySelector('.mode-tab-btn');
    expect(btn).not.toBeNull();
    
    window.switchTab('interview', btn);
    expect(btn.classList.contains('active')).toBe(true);
  });
});
