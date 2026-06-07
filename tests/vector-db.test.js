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

describe('Vector Database Optimizer Studio', () => {
  it('should compile default Qdrant config', () => {
    const window = loadToolDom('../tools/vector-db/index.html', '../src/js/generators/vector-db-gen.js');
    const outputBox = window.document.getElementById('output-box');

    expect(outputBox.textContent).toContain('on_disk_payload: true');
    expect(outputBox.textContent).toContain('m: 16');
    expect(outputBox.textContent).toContain('size: 1536');
    expect(outputBox.textContent).toContain('distance: Cosine');
  });

  it('should compile pgvector-init.sql with HNSW options', () => {
    const window = loadToolDom('../tools/vector-db/index.html', '../src/js/generators/vector-db-gen.js');
    const outputBox = window.document.getElementById('output-box');

    window.switchTab('vdb_sql');
    expect(outputBox.textContent).toContain('CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;');
    expect(outputBox.textContent).toContain('CREATE TABLE vector_storage.embeddings_store');
    expect(outputBox.textContent).toContain('USING hnsw (embedding vector_cosine_ops)');
  });

  it('should switch tabs and update download filename', () => {
    const window = loadToolDom('../tools/vector-db/index.html', '../src/js/generators/vector-db-gen.js');
    const filenameInput = window.document.getElementById('download-name-input');

    expect(filenameInput.value).toBe('qdrant-config.yaml');

    window.switchTab('vdb_sql');
    expect(filenameInput.value).toBe('pgvector-init.sql');

    window.switchTab('vdb_py');
    expect(filenameInput.value).toBe('query-db.py');
  });
});
