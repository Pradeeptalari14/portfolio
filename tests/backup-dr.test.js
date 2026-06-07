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

  // Mock JSZip
  window.JSZip = function() {
    return {
      file: () => {},
      generateAsync: () => Promise.resolve(new Blob())
    };
  };

  // Mock setupCompilerTriggers for the JSDOM environment
  window.setupCompilerTriggers = (compileCallback, excludeIds = ['download-name-input']) => {
    const inputs = window.document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!excludeIds || !excludeIds.includes(input.id)) {
        input.addEventListener('input', compileCallback);
        input.addEventListener('change', compileCallback);
      }
    });
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

describe('Backup & DR Studio', () => {
  it('should compile default Velero backup parameters', () => {
    const window = loadToolDom('../tools/backup-dr/index.html', '../src/js/generators/backup-dr-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('kind: Schedule');
    expect(outputBox.textContent).toContain('includedNamespaces:');
  });

  it('should update backup settings when provider is pg_dump', () => {
    const window = loadToolDom('../tools/backup-dr/index.html', '../src/js/generators/backup-dr-gen.js');
    const outputBox = window.document.getElementById('output-box');

    const providerSelect = window.document.getElementById('backup_provider');
    providerSelect.value = 'pg_dump';
    providerSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('pg_backup.sh');
    expect(outputBox.textContent).toContain('pg_dumpall');
  });

  it('should switch tabs and update active filename and extension', () => {
    const window = loadToolDom('../tools/backup-dr/index.html', '../src/js/generators/backup-dr-gen.js');
    const nameBox = window.document.getElementById('download-name-input');
    const extTag = window.document.getElementById('file-extension-tag');

    expect(nameBox.value).toBe('velero_backup');
    expect(extTag.textContent).toBe('.yaml');

    window.switchTab('retention');
    expect(nameBox.value).toBe('lifecycle_policy');
    expect(extTag.textContent).toBe('.json');
  });
});
