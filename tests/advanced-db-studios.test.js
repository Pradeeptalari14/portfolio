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

  // Mock SreCore setupStudioTabs / window.SreCore
  window.SreCore = {
    setupStudioTabs: (tabs, defaultTab, elements, tabSwitchCallback) => {
      window.switchTab = (tabId) => {
        tabSwitchCallback(tabId);
      };
    }
  };

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

describe('GraphRAG & Neo4j Database Studio', () => {
  it('should compile Neo4j Cypher schemas and docker-compose files', () => {
    const window = loadToolDom('../tools/neo4j-graphrag/index.html', '../src/js/generators/neo4j-graphrag-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('CREATE CONSTRAINT unique_document_id');
    expect(outputBox.textContent).toContain('apoc.import.json');

    // Change similarity threshold and embedding
    const thresholdInput = window.document.getElementById('similarity_threshold');
    const embeddingSelect = window.document.getElementById('embedding_model');

    thresholdInput.value = '0.85';
    embeddingSelect.value = 'bge-large-en';

    thresholdInput.dispatchEvent(new window.Event('input'));
    embeddingSelect.dispatchEvent(new window.Event('change'));

    // Switch to Vector Index tab
    window.switchTab('vector_index_cypher');
    expect(outputBox.textContent).toContain('CREATE VECTOR INDEX chunk_embeddings');
    expect(outputBox.textContent).toContain('`vector.dimensions`: 1024');
    expect(outputBox.textContent).toContain('score >= 0.85');

    // Switch to docker-compose
    window.switchTab('docker_compose_yml');
    expect(outputBox.textContent).toContain('image: neo4j:5.20.0-community');
  });
});

describe('Supabase & pgvector Developer Studio', () => {
  it('should compile Supabase postgres schemas and CLI configs', () => {
    const window = loadToolDom('../tools/supabase-pgvector/index.html', '../src/js/generators/supabase-pgvector-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('CREATE EXTENSION IF NOT EXISTS vector');
    expect(outputBox.textContent).toContain('embedding vector(1536)');
    expect(outputBox.textContent).toContain('ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;');

    // Change similarity metric
    const similaritySelect = window.document.getElementById('similarity_metric');
    similaritySelect.value = 'l2';
    similaritySelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain('documents_hnsw_idx ON public.documents');
    expect(outputBox.textContent).toContain('documents.embedding <-> query_embedding');

    // Switch to seed
    window.switchTab('seed_sql');
    expect(outputBox.textContent).toContain("('Kubernetes OOM Outage Manual',");

    // Switch to config
    window.switchTab('config_toml');
    expect(outputBox.textContent).toContain('port = 54322');
  });
});

describe('Kafka & Flink Streaming Studio', () => {
  it('should compile Flink SQL ingestion and Kafka brokers compose files', () => {
    const window = loadToolDom('../tools/kafka-flink-streaming/index.html', '../src/js/generators/kafka-flink-streaming-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain("connector' = 'kafka'");
    expect(outputBox.textContent).toContain("'topic' = 'incident_events_stream'");

    // Change topic name and window size
    const topicInput = window.document.getElementById('topic_name');
    const windowInput = window.document.getElementById('window_seconds');

    topicInput.value = 'sre_live_telemetry';
    windowInput.value = '120';

    topicInput.dispatchEvent(new window.Event('input'));
    windowInput.dispatchEvent(new window.Event('input'));

    expect(outputBox.textContent).toContain("'topic' = 'sre_live_telemetry'");
    expect(outputBox.textContent).toContain("INTERVAL '120' SECOND");

    // Switch to producer
    window.switchTab('producer_py');
    expect(outputBox.textContent).toContain("producer.send('sre_live_telemetry'");

    // Switch to docker-compose
    window.switchTab('docker_compose_yml');
    expect(outputBox.textContent).toContain('image: confluentinc/cp-kafka:7.5.0');
  });
});

describe('Milvus & Weaviate Vector DB Clustering Studio', () => {
  it('should compile Weaviate and Milvus cluster Helm values and schemas', () => {
    const window = loadToolDom('../tools/milvus-weaviate-cluster/index.html', '../src/js/generators/milvus-weaviate-cluster-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('replicaCount: 2');
    expect(outputBox.textContent).toContain('storageClassName: "premium-rwo"');

    // Switch to Python schema
    window.switchTab('collection_schema_py');
    expect(outputBox.textContent).toContain("class_obj = {");
    expect(outputBox.textContent).toContain("'factor': 2");

    // Change cluster type to Milvus
    const typeSelect = window.document.getElementById('cluster_type');
    typeSelect.value = 'milvus';
    typeSelect.dispatchEvent(new window.Event('change'));

    // Switch to Helm values
    window.switchTab('cluster_values_yaml');
    expect(outputBox.textContent).toContain('milvus:');
    expect(outputBox.textContent).toContain('minio:');

    // Switch to Python schema
    window.switchTab('collection_schema_py');
    expect(outputBox.textContent).toContain('from pymilvus import connections');
    expect(outputBox.textContent).toContain('num_shards=2');
  });
});

describe('Pinecone Serverless Vector DB Studio', () => {
  it('should compile Pinecone serverless Python setups and IAM policies', () => {
    const window = loadToolDom('../tools/pinecone-serverless/index.html', '../src/js/generators/pinecone-serverless-gen.js');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain("region='us-east-1'");
    expect(outputBox.textContent).toContain("dimension=1536");

    // Change region and dimensions
    const regionSelect = window.document.getElementById('pinecone_region');
    const dimsSelect = window.document.getElementById('dimensions');

    regionSelect.value = 'eu-west-1';
    dimsSelect.value = '3072';

    regionSelect.dispatchEvent(new window.Event('change'));
    dimsSelect.dispatchEvent(new window.Event('change'));

    expect(outputBox.textContent).toContain("region='eu-west-1'");
    expect(outputBox.textContent).toContain("dimension=3072");

    // Switch to Query script
    window.switchTab('query_vector_py');
    expect(outputBox.textContent).toContain('query_vector = [0.15] * 3072');

    // Switch to IAM policy
    window.switchTab('iam_policy_json');
    expect(outputBox.textContent).toContain('arn:aws:secretsmanager:us-west-2:123456789012:secret:pinecone-api-key-*');
  });
});
