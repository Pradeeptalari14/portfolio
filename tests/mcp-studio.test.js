import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Model Context Protocol (MCP) Studio Compiler', () => {
  let dom;
  let window;

  beforeAll(() => {
    // Read the index.html file for mcp-studio
    const filePath = path.resolve(__dirname, '../tools/mcp-studio/index.html');
    const htmlText = fs.readFileSync(filePath, 'utf8');

    // Create JSDOM instance with script execution enabled
    dom = new JSDOM(htmlText, {
      runScripts: "dangerously"
    });
    window = dom.window;

    // Mock window.mermaid
    window.mermaid = {
      run: () => {}
    };

    // Mock setupCompilerTriggers for JSDOM context
    window.setupCompilerTriggers = (compileCallback) => {
      const inputs = window.document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', compileCallback);
        input.addEventListener('change', compileCallback);
      });
    };

    // Load and evaluate mcp-studio-gen.js manually in JSDOM context
    const jsPath = path.resolve(__dirname, '../src/js/generators/mcp-studio-gen.js');
    let jsCode = fs.readFileSync(jsPath, 'utf8');
    
    // Remove ES6 import statements so window.eval compiles it as a classic script
    jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    window.eval(jsCode);

    // Initialize state synchronously for tests
    if (typeof window.initializeMCPStudio === 'function') {
      window.initializeMCPStudio();
    }
  });

  it('should initialize and display the default Source Control category and GitHub MCP server', () => {
    expect(window.switchTab).toBeTypeOf('function');
    expect(window.downloadMCPKit).toBeTypeOf('function');

    const catSelect = window.document.getElementById('server_category');
    const srvSelect = window.document.getElementById('server_select');

    expect(catSelect.value).toBe('source_control');
    expect(srvSelect.value).toBe('github');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('# Model Context Protocol Guide: GitHub MCP');
    expect(outputBox.textContent).toContain('Enables AI agents to query repo data');
  });

  it('should switch tabs and update file extensions and viewport states', () => {
    const extTag = window.document.getElementById('file-ext-tag');
    const nameInput = window.document.getElementById('file-name-input');

    // Switch to config tab
    window.switchTab('config');
    expect(extTag.textContent).toBe('.json');
    expect(nameInput.value).toBe('github_mcp_config');
    expect(window.document.getElementById('output-box').textContent).toContain('"args": [');

    // Switch to operations tab
    window.switchTab('operations');
    expect(extTag.textContent).toBe('.md');
    expect(nameInput.value).toBe('github_mcp_guide');
    expect(window.document.getElementById('output-box').textContent).toContain('AI Operational Security Matrix: GitHub MCP');
  });

  it('should dynamically inject input fields when a server with connection parameters is selected', () => {
    const catSelect = window.document.getElementById('server_category');
    const srvSelect = window.document.getElementById('server_select');

    // Change category to Cloud and server to AWS
    catSelect.value = 'cloud';
    catSelect.dispatchEvent(new window.Event('change'));
    
    srvSelect.value = 'aws';
    srvSelect.dispatchEvent(new window.Event('change'));

    // Check if input parameter fields are rendered
    const keyInput = window.document.getElementById('param_aws_key');
    expect(keyInput).not.toBeNull();

    // Type a value and verify compilation changes
    keyInput.value = 'AKIA_TEST_KEY';
    keyInput.dispatchEvent(new window.Event('input'));

    window.switchTab('config');
    expect(window.document.getElementById('output-box').textContent).toContain('AKIA_TEST_KEY');
  });

  it('should filter and search automation recipes', () => {
    // Switch to recipes tab
    window.switchTab('recipes');

    const searchInput = window.document.getElementById('recipe-search');
    const filterSelect = window.document.getElementById('recipe-filter');

    // Filter by k8s
    filterSelect.value = 'kubernetes';
    filterSelect.dispatchEvent(new window.Event('change'));

    const listContainer = window.document.getElementById('recipes-list');
    expect(listContainer.children.length).toBeGreaterThan(0);
    expect(listContainer.innerHTML).toContain('kubernetes');

    // Search query
    searchInput.value = 'ImagePullBackOff';
    searchInput.dispatchEvent(new window.Event('input'));

    expect(listContainer.innerHTML).toContain('ImagePullBackOff');
  });
});
