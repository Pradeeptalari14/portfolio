import { describe, it, expect, vi } from 'vitest';
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

  // Load real SreCore helper logic
  const coreJsPath = path.resolve(__dirname, '../src/js/core-tool.js');
  const coreJsCode = fs.readFileSync(coreJsPath, 'utf8');
  window.eval(coreJsCode);

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

describe('Knowledge Graph & Entity Extraction Studio', () => {
  it('should compile entity extraction code, cypher schemas, and run terminal commands', () => {
    const window = loadToolDom('../tools/knowledge-graph/index.html', '../src/js/generators/knowledge-graph-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Default configuration: spacy_sm, neo4j
    expect(outputBox.textContent).toContain('nlp = spacy.load(\'en_core_web_sm\')');
    expect(outputBox.textContent).toContain('allowed_labels = set(["SERVICE","DATABASE","CONFIG","OUTAGE"])');

    // Test form values changes
    const modelSelect = window.document.getElementById('extraction_model');
    const formatSelect = window.document.getElementById('graph_storage');
    const confidenceInput = window.document.getElementById('confidence_score');
    const entityInput = window.document.getElementById('entity_types');

    modelSelect.value = 'gliner';
    formatSelect.value = 'rdf';
    confidenceInput.value = '0.85';
    entityInput.value = 'IP, DNS, PORT';

    modelSelect.dispatchEvent(new window.Event('change'));
    formatSelect.dispatchEvent(new window.Event('change'));
    confidenceInput.dispatchEvent(new window.Event('input'));
    entityInput.dispatchEvent(new window.Event('input'));

    // Assert updated entity_extractor.py logic
    expect(outputBox.textContent).toContain('from gliner import GLiNER');
    expect(outputBox.textContent).toContain('threshold=0.85');
    expect(outputBox.textContent).toContain('["IP","DNS","PORT"]');

    // Switch to graph_construction.py
    window.switchTab('graph_construction_py');
    expect(outputBox.textContent).toContain('import networkx as nx');
    expect(outputBox.textContent).toContain('def build_knowledge_graph');

    // Switch to RDF TTL schema tab (dynamic name based on selection)
    window.switchTab('schema_cypher');
    expect(outputBox.textContent).toContain('@prefix rdf:');
    expect(outputBox.textContent).toContain('kg:ServiceNode rdf:type kg:Entity');

    // Switch to github actions workflow
    window.switchTab('github_actions_yml');
    expect(outputBox.textContent).toContain('name: SRE Validation & Integration Verification');
    expect(outputBox.textContent).toContain('docker compose up -d');

    // Test SRE Terminal Emulator
    vi.useFakeTimers();
    window.switchTab('terminal');
    window.runTerminalCommand('docker compose up -d');
    vi.advanceTimersByTime(2000);
    const logs = window.document.getElementById('terminal-logs');
    expect(logs.textContent).toContain('Creating container tp-knowledge-graph-db-1');
    expect(logs.textContent).toContain('running (healthy)');

    window.runTerminalCommand('bash scripts/validate.sh');
    vi.advanceTimersByTime(1500);
    expect(logs.textContent).toContain('SRE compliance validation complete for knowledge-graph.');
    vi.useRealTimers();
  });
});

describe('Vectorless RAG & Sparse Search Studio', () => {
  it('should compile BM25 retrievers, relational FTS schemas, and run terminal validation', () => {
    const window = loadToolDom('../tools/vectorless-rag/index.html', '../src/js/generators/vectorless-rag-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Default configuration: bm25, english stopwords, k1=1.5, b=0.75
    expect(outputBox.textContent).toContain('class BM25Retriever:');
    expect(outputBox.textContent).toContain('self.k1 = 1.5');
    expect(outputBox.textContent).toContain('self.b = 0.75');
    expect(outputBox.textContent).toContain('STOP_WORDS = set([');

    // Test form controls changes
    const engineSelect = window.document.getElementById('retriever_engine');
    const stopwordsSelect = window.document.getElementById('stopwords_set');
    const k1Input = window.document.getElementById('k1_param');
    const bInput = window.document.getElementById('b_param');

    engineSelect.value = 'postgres_fts';
    stopwordsSelect.value = 'none';
    k1Input.value = '2.0';
    bInput.value = '0.5';

    engineSelect.dispatchEvent(new window.Event('change'));
    stopwordsSelect.dispatchEvent(new window.Event('change'));
    k1Input.dispatchEvent(new window.Event('input'));
    bInput.dispatchEvent(new window.Event('input'));

    // Assert updated python BM25 retriever parameters
    expect(outputBox.textContent).toContain('self.k1 = 2');
    expect(outputBox.textContent).toContain('self.b = 0.5');
    expect(outputBox.textContent).toContain('STOP_WORDS = set([])');

    // Switch to relational FTS search query
    window.switchTab('relational_search_sql');
    expect(outputBox.textContent).toContain('CREATE TABLE IF NOT EXISTS documents');
    expect(outputBox.textContent).toContain('to_tsvector(\'simple\', NEW.body)'); // none stopwords -> simple language

    // Switch to config.json
    window.switchTab('config_json');
    const config = JSON.parse(outputBox.textContent);
    expect(config.retriever_engine).toBe('postgres_fts');
    expect(config.hyperparameters.k1).toBe(2);
    expect(config.hyperparameters.b).toBe(0.5);
    expect(config.indexing_pipeline.method).toBe('relational_fts');

    // Switch to github actions workflow
    window.switchTab('github_actions_yml');
    expect(outputBox.textContent).toContain('Spin up SQL database container');

    // Test SRE Terminal Emulator
    vi.useFakeTimers();
    window.switchTab('terminal');
    window.runTerminalCommand('docker compose up -d');
    vi.advanceTimersByTime(2000);
    const logs = window.document.getElementById('terminal-logs');
    expect(logs.textContent).toContain('Creating container tp-vectorless-rag-db-1');

    window.runTerminalCommand('bash scripts/validate.sh');
    vi.advanceTimersByTime(1500);
    expect(logs.textContent).toContain('SRE compliance validation complete for vectorless-rag.');
    vi.useRealTimers();
  });
});

describe('Production Secrets & Rotation Studio', () => {
  it('should compile dynamic Vault / AWS secret rotation configs and run verification', () => {
    const window = loadToolDom('../tools/production-secrets/index.html', '../src/js/generators/production-secrets-gen.js');
    const outputBox = window.document.getElementById('output-box');

    // Default configuration: vault provider, 1h interval, eso sync
    expect(outputBox.textContent).toContain('resource "vault_database_secrets_mount" "db"');
    expect(outputBox.textContent).toContain('default_ttl         = 3600');

    // Test form controls changes
    const providerSelect = window.document.getElementById('secrets_provider');
    const intervalSelect = window.document.getElementById('rotation_interval');
    const syncSelect = window.document.getElementById('secret_store_type');
    const pathInput = window.document.getElementById('vault_secret_path');

    providerSelect.value = 'aws';
    intervalSelect.value = '30d';
    syncSelect.value = 'sealed';
    pathInput.value = 'production/rds-credentials';

    providerSelect.dispatchEvent(new window.Event('change'));
    intervalSelect.dispatchEvent(new window.Event('change'));
    syncSelect.dispatchEvent(new window.Event('change'));
    pathInput.dispatchEvent(new window.Event('input'));

    // Assert AWS rotation terraform
    expect(outputBox.textContent).toContain('resource "aws_secretsmanager_secret" "prod_secret"');
    expect(outputBox.textContent).toContain('name = "production/rds-credentials"');
    expect(outputBox.textContent).toContain('automatically_after_days = 30');

    // Switch to external_secrets_yaml (SealedSecrets config)
    window.switchTab('external_secrets_yaml');
    expect(outputBox.textContent).toContain('kind: SealedSecret');
    expect(outputBox.textContent).toContain('name: k8s-db-credentials-sealed');

    // Switch to credential_retriever.py (boto3 secret manager helper)
    window.switchTab('credential_retriever_py');
    expect(outputBox.textContent).toContain('import boto3');
    expect(outputBox.textContent).toContain('SecretId="production/rds-credentials"');

    // Switch to github actions workflow
    window.switchTab('github_actions_yml');
    expect(outputBox.textContent).toContain('Spin up vault service');

    // Test SRE Terminal Emulator
    vi.useFakeTimers();
    window.switchTab('terminal');
    window.runTerminalCommand('docker compose up -d');
    vi.advanceTimersByTime(2000);
    const logs = window.document.getElementById('terminal-logs');
    expect(logs.textContent).toContain('Creating container tp-production-secrets-db-1');

    window.runTerminalCommand('bash scripts/validate.sh');
    vi.advanceTimersByTime(1500);
    expect(logs.textContent).toContain('SRE compliance validation complete for production-secrets.');
    vi.useRealTimers();
  });
});
