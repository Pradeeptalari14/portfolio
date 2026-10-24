import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Projects Showcase & 341 Open Source Repositories Explorer', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../projects/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/projects/'
    });
    window = dom.window;
    document = window.document;
  });

  it('should render the 12 flagship architectural systems cards', () => {
    const flagshipCards = document.querySelectorAll('.project-card');
    expect(flagshipCards.length).toBe(12);

    const titles = Array.from(flagshipCards).map(c => c.querySelector('.project-title')?.textContent?.trim());
    expect(titles).toContain('Enterprise Agentic Operating System');
    expect(titles).toContain('Enterprise Hybrid RAG Platform');
    expect(titles).toContain('AI Infrastructure Monitoring Copilot');
    expect(titles).toContain('Cloud Landing Zone & IaC Platform');
    expect(titles).toContain('Enterprise Observability Platform');
    expect(titles).toContain('WhatsApp & Voice AI Assistant Platform');
    expect(titles).toContain('AI Agent Shield & OWASP Guardrails Gateway');
    expect(titles).toContain('vLLM Distributed Serving & PagedAttention Engine');
    expect(titles).toContain('Universal Model Context Protocol (MCP) Multi-Agent Gateway');
    expect(titles).toContain('Autonomous Kubernetes GPU Scheduler & AI FinOps Platform');
    expect(titles).toContain('SLSA-3 Cryptographic Supply Chain & DevSecOps Platform');
    expect(titles).toContain('Agentic Temporal Memory & Episodic Graph Platform');
  });

  it('should have the 347 Open Source Repositories Explorer section and controls', () => {
    const reposSection = document.getElementById('reposDirectory');
    expect(reposSection).toBeTruthy();

    const searchInput = document.getElementById('repoSearchInput');
    expect(searchInput).toBeTruthy();
    expect(searchInput.getAttribute('placeholder')).toContain('Search 347 repositories');

    const filterTabs = document.getElementById('repoFilterTabs');
    expect(filterTabs).toBeTruthy();
    const tabBtns = filterTabs.querySelectorAll('.repo-tab-btn');
    expect(tabBtns.length).toBe(7); // all, ai, automation, observability, cloud, cicd, devops

    const countDisplay = document.getElementById('repoCountDisplay');
    expect(countDisplay).toBeTruthy();
    expect(countDisplay.textContent).toContain('347');

    const gridContainer = document.getElementById('repoGridContainer');
    expect(gridContainer).toBeTruthy();
  });

  it('should verify tools.json contains valid repository mappings', () => {
    const toolsPath = path.resolve(__dirname, '../tools/tools.json');
    const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));

    expect(tools.length).toBeGreaterThanOrEqual(348);
    tools.forEach(t => {
      expect(t.title).toBeTruthy();
      expect(t.repository).toBeTruthy();
      expect(t.repository).toMatch(/^Pradeeptalari14\//);
      expect(t.link).toBeTruthy();
    });
  });

  it('should verify STUDIOS_AND_REPOSITORIES.md and GITHUB_PROVISIONING_GUIDE.md catalog all repositories', () => {
    const catDoc = fs.readFileSync(path.resolve(__dirname, '../STUDIOS_AND_REPOSITORIES.md'), 'utf8');
    expect(catDoc).toMatch(/(347|348|349)\s+Developer Studios & Repositories/);
    expect(catDoc).toMatch(/`(347|348|349)`/);

    const provGuide = fs.readFileSync(path.resolve(__dirname, '../GITHUB_PROVISIONING_GUIDE.md'), 'utf8');
    expect(provGuide).toContain('all **347 Developer Studios**');
    expect(provGuide).toContain('Exhaustive 347-Repository Execution Matrix');
  });

  it('should verify sections/projects.html points to all 347 repositories', () => {
    const secHtml = fs.readFileSync(path.resolve(__dirname, '../sections/projects.html'), 'utf8');
    expect(secHtml).toContain('347 Repositories');
    expect(secHtml).toContain('Explore 12 Flagship Platforms &amp; All 347 Open Source Repositories');
  });

  it('should verify all 12 architecture case study pages exist and contain valid structures', () => {
    const projectFiles = [
      'enterprise-agentic-os.html',
      'enterprise-rag-platform.html',
      'ai-infra-monitoring-copilot.html',
      'multi-cloud-landing-zone.html',
      'observability-platform-k8s.html',
      'whatsapp-voice-ai-assistant.html',
      'ai-agent-guardrails-shield.html',
      'vllm-inference-serving-engine.html',
      'mcp-agentic-interop-gateway.html',
      'gpu-finops-k8s-scheduler.html',
      'devsecops-slsa-supply-chain.html',
      'agentic-temporal-memory-graph.html'
    ];

    projectFiles.forEach(file => {
      const filePath = path.resolve(__dirname, '../projects', file);
      expect(fs.existsSync(filePath), `File ${file} must exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('class="detail-card"');
      expect(content).toContain('class="mermaid"');
    });
  });
});
