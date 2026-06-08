import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom(htmlRelativePath, jsRelativePath) {
  const htmlPath = path.resolve(__dirname, htmlRelativePath);
  const htmlText = fs.readFileSync(htmlPath, 'utf8');
  
  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  // Mock Mermaid
  window.mermaid = {
    init: () => {},
    run: () => {},
    render: () => {}
  };

  // Load core-tool.js
  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreCode = fs.readFileSync(corePath, 'utf8');
  window.eval(coreCode);

  // Load the generator JS code
  const jsPath = path.resolve(__dirname, jsRelativePath);
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  // Manually dispatch DOMContentLoaded
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('MCP Server Builder Studio', () => {
  it('should compile default Python SDK code configurations', () => {
    const window = loadToolDom('../tools/mcp-server/index.html', '../src/js/generators/mcp-server-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('from mcp.server import Server');
    expect(outputBox.textContent).toContain('app = Server("mcp-sre-server")');
    expect(outputBox.textContent).toContain('def inspect_logs(namespace: str, lines: int = 50) -> str:');
    expect(outputBox.textContent).toContain('REQUESTS.labels(tool="inspect_logs").inc()');
  });

  it('should compile mcp-config.json and handle configuration settings', () => {
    const window = loadToolDom('../tools/mcp-server/index.html', '../src/js/generators/mcp-server-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('mcp_config');
    const parsedConfig = JSON.parse(outputBox.textContent);
    expect(parsedConfig.mcpServers['sre-mcp-server']).toBeDefined();
    expect(parsedConfig.mcpServers['sre-mcp-server'].command).toBe('python');
    expect(parsedConfig.mcpServers['sre-mcp-server'].env.MCP_AUTH_LEVEL).toBe('APIKey');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/mcp-server/index.html', '../src/js/generators/mcp-server-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('mcp-server.py');

    window.switchTab('mcp_config');
    expect(filenameInput.value).toBe('mcp-config.json');
  });
});
