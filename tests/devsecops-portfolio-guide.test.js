import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const toolsJsonPath = path.resolve(__dirname, '../tools/tools.json');
const toolsJson = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));

function loadDevSecOpsDom() {
  const htmlPath = path.resolve(__dirname, '../tools/devsecops-portfolio-guide/index.html');
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

describe('DevSecOps & Supply Chain Security Hub Page', () => {
  it('should fetch tools.json and render filtered DevSecOps studio cards', async () => {
    const window = loadDevSecOpsDom();

    // Manually dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);

    // Wait a brief tick for async fetch & render to execute
    await new Promise(resolve => setTimeout(resolve, 200));

    const cards = window.document.querySelectorAll('.sec-card');
    expect(cards.length).toBeGreaterThan(10);

    const firstCardTitle = cards[0].querySelector('h4').textContent;
    expect(firstCardTitle).toBeTruthy();
  }, 30000);

  it('should search and filter cards based on security text query', async () => {
    const window = loadDevSecOpsDom();
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 200));

    const searchInput = window.document.getElementById('sec-search');
    searchInput.value = 'Trivy';
    searchInput.dispatchEvent(new window.Event('input'));

    const visibleCards = Array.from(window.document.querySelectorAll('.sec-card'));
    expect(visibleCards.length).toBeGreaterThanOrEqual(1);
    expect(visibleCards.some(c => c.querySelector('h4').textContent.includes('Trivy'))).toBe(true);
  }, 30000);

  it('should filter cards on security category pill click', async () => {
    const window = loadDevSecOpsDom();
    const event = new window.Event('DOMContentLoaded');
    window.document.dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 200));

    const runtimePill = Array.from(window.document.querySelectorAll('#sec-filter-tabs .pill')).find(p => p.getAttribute('data-category') === 'runtime');
    expect(runtimePill).toBeTruthy();
    runtimePill.dispatchEvent(new window.Event('click'));

    const visibleCards = Array.from(window.document.querySelectorAll('.sec-card'));
    expect(visibleCards.length).toBeGreaterThanOrEqual(1);
  }, 30000);
});
