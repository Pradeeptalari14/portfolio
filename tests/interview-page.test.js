import { describe, it, expect, beforeAll, vi } from 'vitest';
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

  it('should render and run interactive SRE mock interview chatbot sessions', () => {
    // Set active topic
    window.selectedTopicKey = 'sre_practices';
    
    vi.useFakeTimers();

    // Switch to mock-interview tab
    const mockBtn = window.document.createElement('button');
    window.switchTab('mock-interview', mockBtn);

    // Advance by 100ms to allow initMockInterviewSession setTimeout(..., 50) to run
    vi.advanceTimersByTime(100);

    const container = window.document.getElementById('content-container');
    expect(container.innerHTML).toContain('🤖 SRE Live AI Mock Interviewer');
    expect(container.innerHTML).toContain('Active Topic Assessment:');

    const viewport = window.document.getElementById('mock-chat-viewport');
    expect(viewport).not.toBeNull();

    // Verify welcome message
    expect(viewport.innerHTML).toContain('Welcome to your live technical assessment session!');

    // Type and submit user answer
    const input = window.document.getElementById('mock-chat-input');
    input.value = 'We will set up Prometheus and monitor SLIs/SLOs to reduce manual operations.';
    
    // Trigger submit
    window.submitMockReply();
    expect(viewport.innerHTML).toContain('We will set up Prometheus and monitor SLIs/SLOs');

    // Wait for chatbot grading evaluation reply (setTimeout of 800ms)
    vi.advanceTimersByTime(1000);
    expect(viewport.innerHTML).toContain('Evaluator Feedback:');
    expect(viewport.innerHTML).toContain('Score:');
    vi.useRealTimers();
  });

  it('should display streak calendar grid and support backup actions', () => {
    // Populate study history streak
    const today = new Date().toISOString().split('T')[0];
    window.localStorage.setItem('sre_study_history', JSON.stringify([today]));
    window.localStorage.setItem('sre_current_streak', '5');
    window.localStorage.setItem('sre_max_streak', '12');

    // Switch to analytics tab
    const analyticsBtn = window.document.querySelector('[onclick*="analytics"]');
    window.switchTab('analytics', analyticsBtn);

    const container = window.document.getElementById('content-container');
    expect(container.innerHTML).toContain('🔥 SRE Study Streak Tracker');
    expect(container.innerHTML).toContain('Current Study Streak: <strong style="color:var(--accent-green); font-weight:700;">5 days</strong>');
    expect(container.innerHTML).toContain('Longest Study Streak: <strong style="color:var(--accent-purple); font-weight:700;">12 days</strong>');

    // Test export and print triggers exist
    expect(container.innerHTML).toContain('Export Progress');
    expect(container.innerHTML).toContain('Print Study Sheets');

    // Mock print
    let printed = false;
    window.print = () => { printed = true; };
    window.printStudyWorkspace();
    expect(printed).toBe(true);

    // Mock URL.createObjectURL
    window.URL.createObjectURL = () => 'blob:test';
    let clicked = false;
    // Mock document.createElement to intercept 'a' clicks
    const originalCreate = window.document.createElement;
    window.document.createElement = function(tagName) {
      const el = originalCreate.call(window.document, tagName);
      if (tagName === 'a') {
        el.click = () => { clicked = true; };
      }
      return el;
    };
    window.exportStudyProgress();
    expect(clicked).toBe(true);
    // Restore
    window.document.createElement = originalCreate;
  });
});

