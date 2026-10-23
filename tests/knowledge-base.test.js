import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Engineering Knowledge Base (knowledge/index.html)', () => {
  const htmlPath = path.resolve(__dirname, '../knowledge/index.html');
  expect(fs.existsSync(htmlPath)).toBe(true);

  function createTestDom() {
    const htmlText = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(htmlText, {
      runScripts: 'dangerously',
      url: 'https://example.com/knowledge/'
    });
    return { window: dom.window, document: dom.window.document };
  }

  it('should render the knowledge base with proper title and meta description', () => {
    const { document } = createTestDom();
    expect(document.title).toContain('Engineering Knowledge Base');
    expect(document.querySelector('h1').textContent).toContain('Engineering Knowledge Base');
    const metaDesc = document.querySelector('meta[name="description"]');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc.getAttribute('content')).toContain('runbooks');
  });

  it('should render all 15 production field guides and runbooks in the grid', () => {
    const { document } = createTestDom();
    const cards = document.querySelectorAll('.article-card');
    expect(cards.length).toBe(15);

    const stats = document.getElementById('kbResultCount');
    expect(stats.textContent).toContain('15');
  });

  it('should verify every article card has structured metadata, runbook points, and action links', () => {
    const { document } = createTestDom();
    const cards = document.querySelectorAll('.article-card');

    cards.forEach((card, idx) => {
      const title = card.querySelector('.art-title');
      expect(title, `Card at index ${idx} missing title`).toBeTruthy();
      expect(title.textContent.length).toBeGreaterThan(5);

      const badge = card.querySelector('.art-badge');
      expect(badge, `Card ${title.textContent} missing badge`).toBeTruthy();

      const readTime = card.querySelector('.art-readtime');
      expect(readTime, `Card ${title.textContent} missing read time`).toBeTruthy();

      const keyPoints = card.querySelectorAll('.art-key-points li');
      expect(keyPoints.length, `Card ${title.textContent} should have 3 key runbook points`).toBe(3);

      const studioLink = card.querySelector('.art-link');
      expect(studioLink, `Card ${title.textContent} missing studio launch link`).toBeTruthy();
      expect(studioLink.getAttribute('href')).toMatch(/^\.\.\/(tools|finops|incident|toolbox|plugins)\//);

      const pluginLink = card.querySelector('.art-plugin-link');
      expect(pluginLink, `Card ${title.textContent} missing Claude plugin link`).toBeTruthy();
      expect(pluginLink.getAttribute('href')).toContain('../plugins/?plugin=');
    });
  });

  it('should filter cards dynamically via the instant search input', () => {
    const { window, document } = createTestDom();
    const searchInput = document.getElementById('kbSearchInput');
    expect(searchInput).toBeTruthy();

    // Search for "Patroni"
    searchInput.value = 'Patroni';
    searchInput.dispatchEvent(new window.Event('input'));

    const cards = Array.from(document.querySelectorAll('.article-card'));
    const visibleCards = cards.filter(c => c.style.display !== 'none');
    expect(visibleCards.length).toBe(1);
    expect(visibleCards[0].textContent).toContain('PostgreSQL');

    const stats = document.getElementById('kbResultCount');
    expect(stats.textContent).toContain('1 of 15');
  });

  it('should filter cards via topic category filter chips', () => {
    const { window, document } = createTestDom();
    const chipsRow = document.getElementById('kbChipsRow');
    expect(chipsRow).toBeTruthy();

    const aiChip = chipsRow.querySelector('[data-cat="ai"]');
    expect(aiChip).toBeTruthy();

    aiChip.click();

    const cards = Array.from(document.querySelectorAll('.article-card'));
    const visibleCards = cards.filter(c => c.style.display !== 'none');
    expect(visibleCards.length).toBe(4);

    // Switch back to All
    const allChip = chipsRow.querySelector('[data-cat="all"]');
    allChip.click();

    const allVisible = cards.filter(c => c.style.display !== 'none');
    expect(allVisible.length).toBe(15);
  });

  it('should display an empty state when search finds no matching field guides', () => {
    const { window, document } = createTestDom();
    const searchInput = document.getElementById('kbSearchInput');

    searchInput.value = 'xyzNonExistentTechnology999';
    searchInput.dispatchEvent(new window.Event('input'));

    const emptyState = document.getElementById('kbEmptyState');
    expect(emptyState).toBeTruthy();
    expect(emptyState.style.display).not.toBe('none');
    expect(emptyState.textContent).toContain('No Matching Field Guides Found');

    const resetBtn = document.getElementById('kbResetFilters');
    expect(resetBtn).toBeTruthy();
    resetBtn.click();

    expect(searchInput.value).toBe('');
    const cards = Array.from(document.querySelectorAll('.article-card'));
    const visibleCards = cards.filter(c => c.style.display !== 'none');
    expect(visibleCards.length).toBe(15);
  });
});
