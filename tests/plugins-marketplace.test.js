import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(rootDir, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(rootDir, rel));
const listDirs = (rel) =>
  fs.readdirSync(path.join(rootDir, rel), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

const { parseFrontmatter, escapeHtml, buildCatalog, buildMarketplace, MARKETPLACE } = require('../scripts/generate-plugins.js');

const catalog = JSON.parse(read('plugins/catalog.json'));
const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
const engineers = catalog.plugins.filter((p) => p.source === 'engineers');
const anthropic = catalog.plugins.filter((p) => p.source === 'anthropic');

describe('Engineer role plugins (20+ engineers)', () => {
  it('ships at least 20 engineer-role plugins', () => {
    expect(engineers.length).toBeGreaterThanOrEqual(20);
    expect(listDirs('plugins/engineers').length).toBe(engineers.length);
  });

  it('covers the core engineering disciplines', () => {
    const ids = engineers.map((p) => p.id);
    for (const required of [
      'sre-engineer', 'devops-engineer', 'platform-engineer', 'kubernetes-engineer', 'mlops-engineer',
      'llmops-engineer', 'devsecops-engineer', 'appsec-engineer', 'data-engineer', 'qa-engineer', 'incident-commander'
    ]) {
      expect(ids).toContain(required);
    }
  });

  it.each(engineers.map((p) => [p.id, p]))('%s has a valid manifest, README, skills and commands', (id, plugin) => {
    const base = `plugins/engineers/${id}`;
    const manifest = JSON.parse(read(`${base}/.claude-plugin/plugin.json`));
    expect(manifest.name).toBe(id);
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description.length).toBeGreaterThan(20);
    expect(exists(`${base}/README.md`)).toBe(true);

    expect(plugin.skills.length).toBeGreaterThanOrEqual(2);
    expect(plugin.commands.length).toBeGreaterThanOrEqual(2);

    for (const skill of plugin.skills) {
      const text = read(`${base}/skills/${skill.name}/SKILL.md`);
      const fm = parseFrontmatter(text);
      expect(fm.name).toBe(skill.name);
      expect(fm.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(fm.description.length).toBeGreaterThan(40);
      expect(fm.description.length).toBeLessThanOrEqual(1024);
      for (const heading of ['## When to use', '## Workflow', '## Quality checklist', '## Output format', '## Common pitfalls']) {
        expect(text).toContain(heading);
      }
    }

    for (const cmd of plugin.commands) {
      const fm = parseFrontmatter(read(`${base}/commands/${cmd.name}.md`));
      expect(fm.description.length).toBeGreaterThan(10);
      expect(fm['argument-hint']).toBeTruthy();
    }
  });

  it('has unique plugin and skill names', () => {
    const ids = catalog.plugins.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of catalog.plugins) {
      const skillNames = p.skills.map((s) => s.name);
      expect(new Set(skillNames).size).toBe(skillNames.length);
    }
  });
});

describe('Vendored Anthropic knowledge-work plugins', () => {
  it('keeps the Apache-2.0 license and attribution next to the copied files', () => {
    expect(read('plugins/anthropic/LICENSE')).toContain('Apache License');
    const attribution = read('plugins/anthropic/ATTRIBUTION.md');
    expect(attribution).toContain('anthropics/knowledge-work-plugins');
    expect(attribution).toContain('33d3dea41a341b341d4f5da2e8801ae0c89be2b8');
  });

  it('includes the 17 first-party plugins and excludes third-party partner-built ones', () => {
    expect(anthropic.length).toBe(17);
    expect(exists('plugins/anthropic/partner-built')).toBe(false);
    for (const p of anthropic) {
      expect(exists(`${p.dir}/.claude-plugin/plugin.json`)).toBe(true);
      expect(p.skills.length + p.commands.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(20);
    }
  });
});

describe('Catalogue and marketplace manifest', () => {
  it('catalog.json is in sync with the plugin files on disk', () => {
    const fresh = buildCatalog();
    expect(fresh.length).toBe(catalog.plugins.length);
    expect(catalog.totals.plugins).toBe(fresh.length);
    expect(catalog.totals.skills).toBe(fresh.reduce((n, p) => n + p.skills.length, 0));
    expect(catalog.totals.commands).toBe(fresh.reduce((n, p) => n + p.commands.length, 0));
  });

  it('marketplace.json lists every plugin with a resolvable relative source', () => {
    expect(marketplace.name).toBe(MARKETPLACE);
    expect(marketplace.owner.name).toBeTruthy();
    expect(marketplace.plugins.length).toBe(catalog.plugins.length);
    const names = marketplace.plugins.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    for (const entry of marketplace.plugins) {
      expect(entry.source.startsWith('./')).toBe(true);
      expect(exists(`${entry.source.slice(2)}/.claude-plugin/plugin.json`)).toBe(true);
    }
    expect(buildMarketplace(buildCatalog()).plugins.map((p) => p.name)).toEqual(names);
  });
});

describe('Marketplace page /plugins/', () => {
  const html = read('plugins/index.html');
  const { document } = new JSDOM(html).window;

  it('has SEO essentials within the limits enforced by optimize-seo', () => {
    const title = document.title;
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = document.querySelector('meta[name="description"]').getAttribute('content');
    expect(desc.length).toBeLessThanOrEqual(155);
    expect(document.querySelectorAll('h1').length).toBe(1);
    expect(document.querySelector('meta[property="og:title"]')).not.toBeNull();
    expect(document.documentElement.lang).toBe('en');
  });

  it('pre-renders one card per catalogue plugin with unique ids', () => {
    const cards = Array.from(document.querySelectorAll('.plugin-card'));
    expect(cards.length).toBe(catalog.plugins.length);
    const ids = cards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual(catalog.plugins.map((p) => `plugin-${p.id}`).sort());
  });

  it('keeps headline numbers consistent with the catalogue', () => {
    const desc = document.querySelector('meta[name="description"]').getAttribute('content');
    expect(desc).toContain(`${catalog.totals.plugins} Claude plugins`);
    expect(desc).toContain(`${engineers.length} engineer-role`);
    const stats = Array.from(document.querySelectorAll('.stat-num')).map((n) => Number(n.textContent));
    expect(stats).toEqual([catalog.totals.plugins, engineers.length, catalog.totals.skills, catalog.totals.commands]);
  });

  it('is accessible: skip link, labelled controls, live status region', () => {
    expect(document.querySelector('a.skip-link[href="#main"]')).not.toBeNull();
    expect(document.querySelector('main#main')).not.toBeNull();
    expect(document.querySelector('label[for="pluginSearch"]')).not.toBeNull();
    expect(document.getElementById('pluginStatus').getAttribute('aria-live')).toBe('polite');
    for (const btn of document.querySelectorAll('.pc-copy')) {
      expect((btn.getAttribute('aria-label') || '').length).toBeGreaterThan(5);
    }
  });

  it('is safe: no inline handlers, external links use noopener, strict script CSP', () => {
    expect(html).not.toMatch(/\son[a-z]+\s*=\s*["']/i);
    for (const a of document.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute('rel')).toContain('noopener');
    }
    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).toContain("object-src 'none'");
  });

  it('embeds valid JSON-LD describing every plugin', () => {
    const ld = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    expect(ld['@type']).toBe('CollectionPage');
    expect(ld.mainEntity.numberOfItems).toBe(catalog.plugins.length);
    expect(ld.mainEntity.itemListElement.length).toBe(catalog.plugins.length);
  });

  it('loads its own module script and stylesheet', () => {
    expect(document.querySelector('script[type="module"][src="./plugins.js"]')).not.toBeNull();
    expect(document.querySelector('link[rel="stylesheet"][href="./plugins.css"]')).not.toBeNull();
    expect(exists('plugins/plugins.js')).toBe(true);
    expect(exists('plugins/plugins.css')).toBe(true);
  });
});

describe('Site integration for /plugins/', () => {
  it('is linked from the navbar, command palette, sitemap, vite build and route registry', () => {
    expect(read('sections/navbar.html')).toContain('href="plugins/"');
    expect(read('script.js')).toContain("url: 'plugins/'");
    expect(read('scripts/generate-sitemap.js')).toContain("url: 'plugins/'");
    expect(read('vite.config.js')).toContain("plugins/index.html");
    expect(read('scripts/generate-route-registry.js')).toContain("path: '/plugins/'");
  });

  it('is cross-linked from studios hub, learn hub, and visual flow canvas', () => {
    expect(read('studios/index.html')).toContain('href="/plugins/"');
    expect(read('studios/learn/index.html')).toContain('href="/plugins/"');
    expect(read('tools/visual-flow-canvas.js')).toContain('href="/plugins/"');
  });

  it('builds the catalogue as part of npm run build', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['plugins:build']).toContain('generate-plugins.js');
    expect(pkg.scripts.build.startsWith('npm run plugins:build')).toBe(true);
  });
});

describe('Connected Platform Ecosystem and Production Scenarios', () => {
  it('every engineer role has complete ecosystem links and real-world production data', () => {
    for (const p of engineers) {
      expect(p.studioLink).toBeTruthy();
      expect(p.studioName).toBeTruthy();
      expect(p.learnLink).toBeTruthy();
      expect(p.learnTopic).toBeTruthy();
      expect(p.flowLink).toBeTruthy();
      expect(p.flowName).toBeTruthy();
      expect(p.projectRepo).toBeTruthy();
      expect(p.realWorldScenario.length).toBeGreaterThan(25);
      expect(p.businessGain.length).toBeGreaterThan(25);
    }
  });

  it('pre-renders ecosystem buttons and production scenario cards in HTML', () => {
    const html = read('plugins/index.html');
    const { document } = new JSDOM(html).window;
    const cards = document.querySelectorAll('.plugin-card[data-source="engineers"]');
    expect(cards.length).toBe(engineers.length);
    for (const card of cards) {
      expect(card.querySelector('.pc-ecosystem')).not.toBeNull();
      expect(card.querySelector('.pc-pill-lab')).not.toBeNull();
      expect(card.querySelector('.pc-pill-learn')).not.toBeNull();
      expect(card.querySelector('.pc-pill-flow')).not.toBeNull();
      expect(card.querySelector('.pc-pill-repo')).not.toBeNull();
      expect(card.querySelector('.pc-scenario-card')).not.toBeNull();
      expect(card.querySelector('.pc-scenario-badge--case')).not.toBeNull();
      expect(card.querySelector('.pc-scenario-badge--gain')).not.toBeNull();
    }
  });
});

describe('Generator helpers', () => {
  it('escapeHtml neutralises markup and quotes', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">&\'')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;');
  });

  it('parseFrontmatter handles quoted values and block scalars', () => {
    const fm = parseFrontmatter('---\nname: demo\ndescription: "Quoted: value"\nargument-hint: \'<x>\'\nlong: >\n  folded text\n  continues here\n---\nbody');
    expect(fm.name).toBe('demo');
    expect(fm.description).toBe('Quoted: value');
    expect(fm['argument-hint']).toBe('<x>');
    expect(fm.long).toBe('folded text continues here');
    expect(parseFrontmatter('no frontmatter')).toEqual({});
  });
});
