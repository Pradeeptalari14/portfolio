import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadGuideDom() {
  const htmlPath = path.resolve(__dirname, '../tools/github-provisioning-guide/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  // Mock global clipboard APIs
  window.navigator.clipboard = {
    writeText: vi.fn(() => Promise.resolve())
  };

  // Mock global mermaid
  window.mermaid = {
    initialize: () => {},
    run: () => {}
  };

  // Mock fetch to return tools.json
  const toolsJsonPath = path.resolve(__dirname, '../tools/tools.json');
  const toolsJson = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
  
  window.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('tools.json')) {
      return Promise.resolve({
        json: () => Promise.resolve(toolsJson)
      });
    }
    return Promise.reject(new Error('not found'));
  });

  return window;
}

describe('GitHub Provisioning & SRE Execution Hub Page', () => {
  it('should fetch tools.json and render 268 studio cards', async () => {
    const window = loadGuideDom();

    // Manually dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);

    // Wait a brief tick for async fetch & render to execute
    await new Promise(resolve => setTimeout(resolve, 200));

    const cards = window.document.querySelectorAll('.repo-card');
    expect(cards.length).toBe(268);

    const firstCardTitle = cards[0].querySelector('h4').textContent;
    expect(firstCardTitle).toBe('DevOps AI RAG Studio');
  });

  it('should search and filter cards based on text query', async () => {
    const window = loadGuideDom();
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 200));

    const searchInput = window.document.getElementById('repo-search');
    searchInput.value = 'LocalStack';
    searchInput.dispatchEvent(new window.Event('input'));

    const visibleCards = Array.from(window.document.querySelectorAll('.repo-card'));
    expect(visibleCards.length).toBe(1);
    expect(visibleCards[0].querySelector('h4').textContent).toContain('LocalStack');
  });

  it('should filter cards on category pill click', async () => {
    const window = loadGuideDom();
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 200));

    const aiPill = Array.from(window.document.querySelectorAll('#filter-tabs .pill')).find(p => p.getAttribute('data-category') === 'ai');
    aiPill.dispatchEvent(new window.Event('click'));

    const visibleCards = Array.from(window.document.querySelectorAll('.repo-card'));
    expect(visibleCards.length).toBe(173);
  });
});
