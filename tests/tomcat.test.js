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

describe('Apache Tomcat Tuning Studio', () => {
  it('should compile default Tomcat server.xml parameters', () => {
    const window = loadToolDom('../tools/tomcat/index.html', '../src/js/generators/tomcat-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('<Server port="8005" shutdown="SHUTDOWN">');
    expect(outputBox.textContent).toContain('Connector port="8080"');
    expect(outputBox.textContent).toContain('port="8443"');
  });

  it('should reflect checkbox state transitions in config outputs', () => {
    const window = loadToolDom('../tools/tomcat/index.html', '../src/js/generators/tomcat-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Switch SSL off
    const sslCheckbox = window.document.getElementById('tc_connector_ssl');
    sslCheckbox.checked = false;
    sslCheckbox.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).not.toContain('port="8443"');

    // Switch JNDI pool on/off and inspect context
    window.switchTab('tc_context');
    expect(outputBox.textContent).toContain('<Resource name="jdbc/AppDataSource"');

    const dbPoolCheckbox = window.document.getElementById('tc_db_pool');
    dbPoolCheckbox.checked = false;
    dbPoolCheckbox.dispatchEvent(new window.Event('change'));
    expect(outputBox.textContent).not.toContain('<Resource name="jdbc/AppDataSource"');
  });

  it('should switch tabs and update output filename', () => {
    const window = loadToolDom('../tools/tomcat/index.html', '../src/js/generators/tomcat-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('server.xml');

    window.switchTab('tc_context');
    expect(filenameInput.value).toBe('context.xml');

    window.switchTab('tc_setenv');
    expect(filenameInput.value).toBe('setenv.sh');
  });
});
