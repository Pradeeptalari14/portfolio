import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Studios Learning Hub Dataset (studios-learning.json)', () => {
  const jsonPath = path.resolve(__dirname, '../studios/learn/studios-learning.json');
  expect(fs.existsSync(jsonPath)).toBe(true);

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const studios = JSON.parse(rawData);

  it('should contain all 308 developer studios', () => {
    expect(studios.length).toBe(308);
  });

  it('should match category distributions across platform studios', () => {
    const counts = studios.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {});

    expect(counts['ai']).toBe(209);
    expect(counts['automation']).toBe(33);
    expect(counts['observability']).toBe(28);
    expect(counts['cloud']).toBe(26);
    expect(counts['cicd']).toBe(12);
  });

  it('should validate every studio has thorough learning attributes', () => {
    studios.forEach((studio, idx) => {
      expect(studio.title, `Studio at index ${idx} missing title`).toBeTruthy();
      expect(studio.category, `Studio ${studio.title} missing category`).toBeTruthy();
      expect(studio.link, `Studio ${studio.title} missing link`).toBeTruthy();
      expect(studio.domain, `Studio ${studio.title} missing domain`).toBeTruthy();
      expect(studio.skillLevel, `Studio ${studio.title} missing skillLevel`).toBeTruthy();
      expect(studio.useCase, `Studio ${studio.title} missing useCase`).toBeTruthy();
      expect(studio.useCase.length, `Studio ${studio.title} useCase too short`).toBeGreaterThan(15);
      expect(studio.bestTreatment, `Studio ${studio.title} missing bestTreatment`).toBeTruthy();
      expect(studio.bestTreatment.length, `Studio ${studio.title} bestTreatment too short`).toBeGreaterThan(15);
      expect(studio.antiPattern, `Studio ${studio.title} missing antiPattern`).toBeTruthy();
      expect(studio.antiPattern.length, `Studio ${studio.title} antiPattern too short`).toBeGreaterThan(10);
      expect(studio.realTimeDrill, `Studio ${studio.title} missing realTimeDrill`).toBeTruthy();
      expect(studio.realTimeDrill.length, `Studio ${studio.title} realTimeDrill too short`).toBeGreaterThan(10);
      expect(studio.sreMetric, `Studio ${studio.title} missing sreMetric`).toBeTruthy();
    });
  });
});

describe('Studios Learning Hub DOM & Interactive Mechanics (studios/learn/index.html)', () => {
  const htmlPath = path.resolve(__dirname, '../studios/learn/index.html');
  const jsonPath = path.resolve(__dirname, '../studios/learn/studios-learning.json');
  const studiosData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  function createTestDom() {
    const htmlText = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(htmlText, {
      runScripts: 'dangerously',
      url: 'https://example.com/studios/learn/',
      beforeParse(window) {
        window.fetch = (url) => {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(studiosData)
          });
        };
        window.navigator.clipboard = {
          writeText: () => Promise.resolve()
        };
      }
    });

    return { window: dom.window, dom };
  }

  it('should render the static header, hero metrics, simulator, and triage wizard', () => {
    const { window } = createTestDom();
    const document = window.document;

    expect(document.title).toContain('Learning Hub');
    expect(document.getElementById('scenarioChips')).toBeTruthy();
    expect(document.getElementById('wizardLayer')).toBeTruthy();
    expect(document.getElementById('wizardConstraint')).toBeTruthy();
    expect(document.getElementById('learnSearch')).toBeTruthy();
    expect(document.getElementById('studiosGrid')).toBeTruthy();
  });

  it('should load studios and populate cards in the catalog grid', async () => {
    const { window } = createTestDom();
    const document = window.document;

    // Wait microtask tick for async fetch & render
    await new Promise(r => setTimeout(r, 60));

    const grid = document.getElementById('studiosGrid');
    const cards = grid.querySelectorAll('.studio-learn-card');
    expect(cards.length).toBe(308);

    const catalogCount = document.getElementById('catalogCount');
    expect(catalogCount.textContent).toContain('308 of 308');
  });

  it('should filter cards when searching by keyword', async () => {
    const { window } = createTestDom();
    const document = window.document;

    await new Promise(r => setTimeout(r, 60));

    const searchInput = document.getElementById('learnSearch');
    searchInput.value = 'vLLM';
    searchInput.dispatchEvent(new window.Event('input'));

    const grid = document.getElementById('studiosGrid');
    const cards = grid.querySelectorAll('.studio-learn-card');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(308);

    const firstCard = cards[0];
    expect(firstCard.textContent.toLowerCase()).toContain('vllm');
  });

  it('should filter cards by category button click', async () => {
    const { window } = createTestDom();
    const document = window.document;

    await new Promise(r => setTimeout(r, 60));

    const cicdBtn = Array.from(document.querySelectorAll('.filter-pill')).find(b => b.dataset.cat === 'cicd');
    expect(cicdBtn).toBeTruthy();
    cicdBtn.click();

    const grid = document.getElementById('studiosGrid');
    const cards = grid.querySelectorAll('.studio-learn-card');
    expect(cards.length).toBe(12);
  });

  it('should switch incident archetypes in the Incident & Treatment Simulator', () => {
    const { window } = createTestDom();
    const document = window.document;

    const chips = document.getElementById('scenarioChips');
    const items = chips.querySelectorAll('.scenario-chip');
    expect(items.length).toBe(10);

    // Click the 2nd incident (eBPF CPU saturation)
    items[1].click();

    const simTitle = document.getElementById('simScenarioTitle');
    expect(simTitle.textContent).toContain('Silent Host CPU Saturation');

    const treatmentText = document.getElementById('simTreatmentText');
    expect(treatmentText.textContent).toContain('eBPF');
  });

  it('should execute architecture triage wizard and show recommendation', () => {
    const { window } = createTestDom();
    const document = window.document;

    const layerSel = document.getElementById('wizardLayer');
    const failSel = document.getElementById('wizardConstraint');
    const resultTitle = document.getElementById('wizResultTitle');

    layerSel.value = 'ai-runtime';
    failSel.value = 'oom';
    layerSel.dispatchEvent(new window.Event('change'));

    expect(resultTitle.textContent).toContain('DeepSpeed ZeRO-3');
  });
});
