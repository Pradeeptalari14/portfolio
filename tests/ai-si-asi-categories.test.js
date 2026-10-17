import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('AI, SI, and ASI Dedicated Studio Categories & Catalogues', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('1. AI Studio Catalogue exists, renders curriculum, interactive lab, and quiz', () => {
    const filePath = path.join(rootDir, 'studios/ai/index.html');
    expect(fs.existsSync(filePath)).toBe(true);

    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { window } = dom;
    const { document } = window;

    // Header & Title
    expect(document.querySelector('h1').textContent).toContain('Artificial Intelligence');

    // 4 Progression Tracks
    expect(html).toContain('ML &amp; Tokenization Basics');
    expect(html).toContain('Enterprise Hybrid Retrieval');
    expect(html).toContain('Inference Engines &amp; KV Cache');
    expect(html).toContain('Multi-Agent Swarms &amp; MCP');

    // Interactive Architecture Diagram (6 Stages)
    const steps = document.querySelectorAll('.pipeline-step');
    expect(steps.length).toBe(6);

    // Interactive VRAM Calculator Lab
    expect(document.getElementById('calcModel')).not.toBeNull();
    const vramResult = document.getElementById('resTotalVRAM');
    expect(vramResult).not.toBeNull();
    window.eval('recalculateVRAM()');
    expect(parseFloat(vramResult.textContent)).toBeGreaterThan(0);

    // Self-Assessment Quiz
    const quizCards = document.querySelectorAll('.quiz-card');
    expect(quizCards.length).toBe(3);
    quizCards.forEach(card => {
      const correctIdx = parseInt(card.getAttribute('data-correct'), 10);
      const opts = card.querySelectorAll('.quiz-opt');
      opts[correctIdx].click();
    });
    expect(document.getElementById('quizScore').textContent).toBe('Score: 3/3');

    // Incident triage runbooks & cross-links
    expect(html).toContain('CUDA out of memory');
    expect(html).toContain('Prompt Injection');
    expect(html).toContain('/tools/vllm-paged-attention/');
    expect(html).toContain('/tools/speculative-rag-pipeline/');
  });

  it('2. SI Studio Catalogue clearly disambiguates Synthetic Intelligence from Superintelligence', () => {
    const filePath = path.join(rootDir, 'studios/si/index.html');
    expect(fs.existsSync(filePath)).toBe(true);

    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { window } = dom;
    const { document } = window;

    // Disambiguation Banner MUST be present
    const disambiguationBox = document.querySelector('.disambiguation-box');
    expect(disambiguationBox).not.toBeNull();
    const disambiguationText = disambiguationBox.textContent;

    // Explicit requirements:
    // 1. Distinguish SI as synthetic intelligence from SI as superintelligence
    expect(disambiguationText).toContain('Synthetic Intelligence');
    expect(disambiguationText).toContain('Superintelligence');
    // 2. State that Synthetic Intelligence is not a universally standardized category
    expect(disambiguationText.toLowerCase()).toContain('not a universally standardized');

    // 4 Cognitive Tracks
    expect(html).toContain('Global Workspace &amp; Dual-Process');
    expect(html).toContain('Neural Perception + First-Order Logic');
    expect(html).toContain('Active Inference &amp; World Models');
    expect(html).toContain('Emergence &amp; Stigmergic Consensus');

    // Interactive Cognitive Architecture Diagram (5 Stages)
    const steps = document.querySelectorAll('.pipeline-step');
    expect(steps.length).toBe(5);

    // Interactive Cognitive Arbitration Lab
    const scenarioSelect = document.getElementById('siScenario');
    expect(scenarioSelect).not.toBeNull();
    scenarioSelect.value = 'adversarial';
    window.eval('updateSILab()');
    expect(document.getElementById('resRouting').textContent).toContain('System 2');

    // Quiz evaluation
    const quizCards = document.querySelectorAll('.quiz-card');
    expect(quizCards.length).toBe(3);
    quizCards.forEach(card => {
      const correctIdx = parseInt(card.getAttribute('data-correct'), 10);
      const opts = card.querySelectorAll('.quiz-opt');
      opts[correctIdx].click();
    });
    expect(document.getElementById('siQuizScore').textContent).toBe('Score: 3/3');

    // Links to dedicated SI tools
    expect(html).toContain('/tools/synthetic-cognitive-architecture/');
    expect(html).toContain('/tools/neuro-symbolic-reasoner/');
  });

  it('3. ASI Studio Catalogue clearly labels hypothetical capabilities and theoretical research', () => {
    const filePath = path.join(rootDir, 'studios/asi/index.html');
    expect(fs.existsSync(filePath)).toBe(true);

    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html, { runScripts: 'dangerously' });
    const { window } = dom;
    const { document } = window;

    // Demarcation Warning MUST be present
    const warningBox = document.querySelector('.warning-banner');
    expect(warningBox).not.toBeNull();
    const warningText = warningBox.textContent;

    // Must clearly state hypothetical capabilities and not existing, proven technology
    expect(warningText.toLowerCase()).toContain('hypothetical');
    expect(warningText.toLowerCase()).toContain('not existing, proven');

    // 4 Theoretical Alignment Tracks
    expect(html).toContain('Outer, Inner &amp; Mesa-Optimization');
    expect(html).toContain('Sparse Autoencoders &amp; Circuits');
    expect(html).toContain('Air-Gaps, Tripwires &amp; Corrigibility');
    expect(html).toContain('Frontier Evals &amp; Hardware Treaties');

    // Interactive Containment Boundary Diagram (5 Stages)
    const steps = document.querySelectorAll('.pipeline-step');
    expect(steps.length).toBe(5);

    // Interactive Corrigibility & SAE Lab
    document.getElementById('asiFeature').value = 'power';
    document.getElementById('asiClamp').value = '2.5';
    window.eval('updateASILab()');
    expect(document.getElementById('resTripwire').textContent).toContain('CRITICAL ALERT');

    // Quiz evaluation
    const quizCards = document.querySelectorAll('.quiz-card');
    expect(quizCards.length).toBe(3);
    quizCards.forEach(card => {
      const correctIdx = parseInt(card.getAttribute('data-correct'), 10);
      const opts = card.querySelectorAll('.quiz-opt');
      opts[correctIdx].click();
    });
    expect(document.getElementById('asiQuizScore').textContent).toBe('Score: 3/3');

    // Links to dedicated ASI tools
    expect(html).toContain('/tools/asi-alignment-control/');
    expect(html).toContain('/tools/mechanistic-interpretability/');
  });

  it('4. All companion studio tools and learning guides exist with working tabs and navigation', () => {
    const companionTools = [
      { dir: 'synthetic-cognitive-architecture', title: 'Synthetic Cognitive Architecture' },
      { dir: 'neuro-symbolic-reasoner', title: 'Neuro-Symbolic' },
      { dir: 'asi-alignment-control', title: 'ASI Alignment' },
      { dir: 'mechanistic-interpretability', title: 'Mechanistic Interpretability' }
    ];

    for (const tool of companionTools) {
      const indexPath = path.join(rootDir, 'tools', tool.dir, 'index.html');
      const learnPath = path.join(rootDir, 'tools', tool.dir, 'learn.html');

      expect(fs.existsSync(indexPath)).toBe(true);
      expect(fs.existsSync(learnPath)).toBe(true);

      const indexHtml = fs.readFileSync(indexPath, 'utf8');
      const learnHtml = fs.readFileSync(learnPath, 'utf8');

      expect(indexHtml).toContain(tool.title);
      expect(indexHtml).toContain('tab-btn');
      expect(learnHtml).toContain('Guide');
      expect(learnHtml).toContain('href="./"');
    }
  });

  it('5. Global Studios Hub index.html integrates AI, SI, and ASI categories and banners', () => {
    const studiosPath = path.join(rootDir, 'studios/index.html');
    const html = fs.readFileSync(studiosPath, 'utf8');
    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;

    // Check category pills
    const catPills = document.getElementById('categoryPills');
    expect(catPills).not.toBeNull();
    expect(catPills.querySelector('[data-cat="ai"]')).not.toBeNull();
    expect(catPills.querySelector('[data-cat="si"]')).not.toBeNull();
    expect(catPills.querySelector('[data-cat="asi"]')).not.toBeNull();

    // Check 3-Pillar banners linking to catalogues
    expect(html).toContain('href="/studios/ai/"');
    expect(html).toContain('href="/studios/si/"');
    expect(html).toContain('href="/studios/asi/"');

    // Check filter function contains SI and ASI branches
    expect(html).toContain("activeCat === 'si'");
    expect(html).toContain("activeCat === 'asi'");
  });

  it('6. Learning Lab studios/learn/index.html integrates AI, SI, and ASI filters and quick links', () => {
    const learnPath = path.join(rootDir, 'studios/learn/index.html');
    const html = fs.readFileSync(learnPath, 'utf8');
    const dom = new JSDOM(html);
    const { window } = dom;
    const { document } = window;

    // Check checkboxes
    const catInputs = Array.from(document.querySelectorAll('input[name="catFilter"]')).map(i => i.value);
    expect(catInputs).toContain('ai');
    expect(catInputs).toContain('si');
    expect(catInputs).toContain('asi');

    // Check quick links
    expect(html).toContain('href="../ai/"');
    expect(html).toContain('href="../si/"');
    expect(html).toContain('href="../asi/"');

    // Check filtering logic includes SI and ASI
    expect(html).toContain("c === 'si'");
    expect(html).toContain("c === 'asi'");
  });

  it('7. Studios callout and navigation contain AI, SI, and ASI links', () => {
    const calloutPath = path.join(rootDir, 'sections/studios-callout.html');
    const calloutHtml = fs.readFileSync(calloutPath, 'utf8');
    expect(calloutHtml).toContain('studios/ai/');
    expect(calloutHtml).toContain('studios/si/');
    expect(calloutHtml).toContain('studios/asi/');
    expect(calloutHtml).toContain('Artificial Intelligence (AI)');
    expect(calloutHtml).toContain('Synthetic Intelligence (SI)');
    expect(calloutHtml).toContain('Superintelligence (ASI)');

    const navbarPath = path.join(rootDir, 'sections/navbar.html');
    const navbarHtml = fs.readFileSync(navbarPath, 'utf8');
    expect(navbarHtml).toContain('href="studios/ai/"');
    expect(navbarHtml).toContain('href="studios/si/"');
    expect(navbarHtml).toContain('href="studios/asi/"');
  });
});
