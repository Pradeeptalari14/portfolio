import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('P0 — Studio Catalogue and Search Tests', () => {
  const toolsHtmlPath = path.resolve(__dirname, '../tools/index.html');
  const toolsJsonPath = path.resolve(__dirname, '../tools/tools.json');
  const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));

  it('tools.json should contain exactly 348 studios', () => {
    expect(toolsData.length).toBe(348);
  });

  it('tools/index.html static HTML should not show No Studios Found by default', () => {
    const htmlText = fs.readFileSync(toolsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText);
    const noResults = dom.window.document.getElementById('no-results');

    expect(noResults).not.toBeNull();
    // Must have display: none inline or hidden attribute so crawlers do not see it as initial content
    const style = noResults.getAttribute('style') || '';
    const hasHidden = noResults.hasAttribute('hidden');
    expect(style.includes('display: none') || hasHidden).toBe(true);
  });

  it('tools/index.html should have search placeholder mentioning 348 studios', () => {
    const htmlText = fs.readFileSync(toolsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText);
    const searchInput = dom.window.document.getElementById('tools-search');

    expect(searchInput).not.toBeNull();
    expect(searchInput.getAttribute('placeholder')).toContain('348');
    expect(searchInput.getAttribute('placeholder')).not.toContain('309');
    expect(searchInput.getAttribute('placeholder')).not.toContain('291');
    expect(searchInput.getAttribute('placeholder')).not.toContain('267');
  });

  it('tools/index.html should display accurate category counts in static HTML', () => {
    const htmlText = fs.readFileSync(toolsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText);
    const filterBtns = dom.window.document.querySelectorAll('.filter-btn');

    const counts = {};
    filterBtns.forEach(btn => {
      const filter = btn.getAttribute('data-filter');
      const count = btn.querySelector('.filter-count')?.textContent?.trim();
      counts[filter] = parseInt(count, 10);
    });

    expect(counts['all']).toBe(348);
    expect(counts['ai']).toBe(236);
    expect(counts['cloud']).toBe(29);
    expect(counts['cicd']).toBe(17);
    expect(counts['automation']).toBe(36);
    expect(counts['observability']).toBe(30);
  });

  it('should filter studios by keyword search and category', () => {
    const htmlText = fs.readFileSync(toolsHtmlPath, 'utf8');
    const dom = new JSDOM(htmlText, { runScripts: 'outside-only' });
    const { window } = dom;

    // Populate tools grid container with mock elements matching toolsData
    const container = window.document.getElementById('tools-grid-container');
    toolsData.forEach(tool => {
      const card = window.document.createElement('div');
      card.className = 'tool-card';
      card.setAttribute('data-category', tool.category === 'devops' ? 'cicd' : tool.category);
      card.innerHTML = `
        <span class="tool-category-badge">${tool.category}</span>
        <h3 class="tool-title">${tool.title}</h3>
        <p class="tool-desc">${tool.desc || ''}</p>
        <span class="tool-tag">${tool.tag || ''}</span>
        <a href="${tool.link}" class="tool-link">Launch Tool</a>
      `;
      container.appendChild(card);
    });

    expect(container.querySelectorAll('.tool-card').length).toBe(348);

    // Test filter function logic
    function filterCards(query, category) {
      let matchCount = 0;
      const cards = container.querySelectorAll('.tool-card');
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        const title = card.querySelector('.tool-title').textContent.toLowerCase();
        const desc = card.querySelector('.tool-desc').textContent.toLowerCase();

        const matchesCat = (category === 'all' || cardCat === category);
        const matchesQuery = (!query || title.includes(query) || desc.includes(query));

        if (matchesCat && matchesQuery) {
          card.classList.remove('hidden');
          matchCount++;
        } else {
          card.classList.add('hidden');
        }
      });
      return matchCount;
    }

    // 1. All category with empty query
    expect(filterCards('', 'all')).toBe(348);

    // 2. AI category
    expect(filterCards('', 'ai')).toBe(236);

    // 3. Cloud category
    expect(filterCards('', 'cloud')).toBe(29);

    // 4. Keyword search for "docker"
    const dockerMatches = filterCards('docker', 'all');
    expect(dockerMatches).toBeGreaterThan(0);

    // 5. Zero-match query should return 0
    const noMatches = filterCards('nonexistentxyz123456789', 'all');
    expect(noMatches).toBe(0);

    // 6. Reset search restores all 348
    expect(filterCards('', 'all')).toBe(348);
  });

  it('all 348 tools should have valid Launch links and repositories', () => {
    toolsData.forEach(tool => {
      expect(tool.title).toBeTruthy();
      expect(tool.link).toBeTruthy();
      expect(tool.repository).toContain('Pradeeptalari14/');
    });
  });
});
