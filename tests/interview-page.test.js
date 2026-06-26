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

    // Mock fetch for tools.json and topics.json
    window.fetch = (url) => {
      if (url.includes('topics.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            about: {
              topics: {
                sre_practices: {
                  title: "SRE Practices",
                  interview: [{ q: "What is SRE?", expert: "Site Reliability Engineering..." }],
                  purpose: { solve: "reliability", why: "uptime", before: "manual ops" },
                  archGaps: {},
                  flow: {
                    learning: "Service Metrics ➜ SLIs ➜ SLOs",
                    execution: "Dev Push ➜ SLA Check",
                    repo: "repo ➜ config"
                  },
                  quiz: [
                    {
                      q: "What is SLO?",
                      options: ["Service Level Objective", "Option B"],
                      a: "Service Level Objective",
                      explanation: "SLO stands for Service Level Objective."
                    }
                  ],
                  labs: { command: "promtool check" },
                  incident: { commands: "kubectl logs" }
                },
                platform_eng: {
                  title: "Platform Engineering",
                  interview: [{ q: "What is platform?", expert: "Developer platforms..." }],
                  purpose: { solve: "velocity", why: "standardization", before: "silos" },
                  archGaps: {},
                  flow: {
                    learning: "Service Metrics ➜ SLIs ➜ SLOs",
                    execution: "Dev Push ➜ SLA Check",
                    repo: "repo ➜ config"
                  },
                  quiz: [
                    {
                      q: "What is platform?",
                      options: ["Platform", "Option B"],
                      a: "Platform",
                      explanation: "Platform explanation."
                    }
                  ],
                  labs: { command: "promtool check" },
                  incident: { commands: "kubectl logs" }
                }
              }
            },
            skills: { topics: {} },
            experience: { topics: {} },
            projects: { topics: {} },
            tools: { topics: {} },
            contact: { topics: {} }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { title: "🐳 Docker Manager", category: "Config & Auto", repository: "Pradeeptalari14/tp-docker", link: "docker/" }
        ])
      });
    };

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

  it('should filter topics in sidebar using search query', () => {
    expect(window.filterSidebar).toBeTypeOf('function');

    // Create a search input element
    const searchInput = window.document.getElementById('topic-sidebar-search');
    expect(searchInput).not.toBeNull();

    // Populate sidebar first to have some buttons
    const pBtn = window.document.querySelector('.pillar-btn') || window.document.createElement('button');
    window.switchPillar('about', pBtn);

    const sidebarBtns = window.document.querySelectorAll('#topic-sidebar-list .sidebar-item-btn');
    expect(sidebarBtns.length).toBeGreaterThan(0);

    // Set search query and filter
    searchInput.value = 'practices';
    window.filterSidebar(searchInput);

    // Check visibility
    sidebarBtns.forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('practices')) {
        expect(btn.style.display).not.toBe('none');
      } else {
        expect(btn.style.display).toBe('none');
      }
    });
  });

  it('should evaluate draft answers and show evaluator reports', () => {
    expect(window.evaluateDraftAnswer).toBeTypeOf('function');

    // Mock selectedTopicKey and selectedQuestionIdx
    window.selectedTopicKey = 'sre_practices';
    window.selectedQuestionIdx = 0;

    // Create container elements if not present in mock DOM
    if (!window.document.getElementById('evaluator-result-card')) {
      const testCard = window.document.createElement('div');
      testCard.id = 'evaluator-result-card';
      window.document.body.appendChild(testCard);
    }

    const card = window.document.getElementById('evaluator-result-card');

    // Test short draft
    window.evaluateDraftAnswer('sre_practices', 0, 'Short');
    expect(card.style.display).toBe('block');
    expect(card.innerHTML).toContain('Response too short');

    // Test longer draft alignment
    const longDraft = 'This draft answer matches Site Reliability Engineering and SLIs/SLOs to reduce manual operations.';
    window.evaluateDraftAnswer('sre_practices', 0, longDraft);
    expect(card.innerHTML).toContain('SRE Evaluator Report');
    expect(card.innerHTML).toContain('Diagnostic Intent Match');
  });

  it('should simulate SRE Chaos events and output report details', () => {
    expect(window.injectSREChaos).toBeTypeOf('function');

    window.selectedTopicKey = 'sre_practices';

    if (!window.document.getElementById('chaos-report-panel')) {
      const testPanel = window.document.createElement('div');
      testPanel.id = 'chaos-report-panel';
      window.document.body.appendChild(testPanel);
    }

    const panel = window.document.getElementById('chaos-report-panel');

    // Test SPOF simulation
    window.injectSREChaos('spof');
    expect(panel.style.display).toBe('block');
    expect(panel.innerHTML).toContain('SPOF INJECTED');

    // Test scaling simulation
    window.injectSREChaos('scaling');
    expect(panel.innerHTML).toContain('RESOURCE SATURATION INJECTED');
  });

  it('should switch to analytics tab and render metrics from LocalStorage', () => {
    // Populate some study progress in LocalStorage
    window.localStorage.setItem('sre_qa_completed_sre_practices', JSON.stringify({ '0': true }));
    window.localStorage.setItem('sre_qa_drafts_sre_practices', JSON.stringify({ '0': 'This is draft answer for testing' }));

    const analyticsBtn = window.document.querySelector('[onclick*="analytics"]');
    expect(analyticsBtn).not.toBeNull();

    window.switchTab('analytics', analyticsBtn);

    const container = window.document.getElementById('content-container');
    expect(container).not.toBeNull();
    expect(container.innerHTML).toContain('SRE Study &amp; Mastery Analytics');
    expect(container.innerHTML).toContain('Questions Mastered');
    expect(container.innerHTML).toContain('Draft Answers Saved');
    expect(container.innerHTML).toContain('SRE Practices');
  });
});

