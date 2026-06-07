// Vector Database Optimizer Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initVectorDbStudio() {
  const elements = {
    dimensions: document.getElementById('vdb_dimensions'),
    distance: document.getElementById('vdb_distance'),
    postgresSchema: document.getElementById('vdb_postgres_schema'),
    m: document.getElementById('vdb_m'),
    efConstruct: document.getElementById('vdb_ef_construct'),
    indexingOnDisk: document.getElementById('vdb_indexing_on_disk'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-vdb'),
    btnDownload: document.getElementById('btn-download-vdb'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'vdb_qdrant';
  let compiledCode = {
    vdb_qdrant: '',
    vdb_sql: '',
    vdb_py: '',
    vdb_flow: ''
  };

  function compileConfigs() {
    const dim = elements.dimensions ? elements.dimensions.value : '1536';
    const dist = elements.distance ? elements.distance.value : 'cosine';
    const schema = elements.postgresSchema ? elements.postgresSchema.value : 'vector_storage';
    const mVal = elements.m ? elements.m.value : '16';
    const efConstructVal = elements.efConstruct ? elements.efConstruct.value : '128';
    const isOnDisk = elements.indexingOnDisk ? elements.indexingOnDisk.checked : true;

    // Distance metrics translations
    let qdrantDistance = 'Cosine';
    let pgvectorDistanceOp = 'cosine';
    if (dist === 'dot') {
      qdrantDistance = 'Dot';
      pgvectorDistanceOp = 'ip';
    } else if (dist === 'euclidean') {
      qdrantDistance = 'Euclid';
      pgvectorDistanceOp = 'l2';
    }

    // 1. Compile qdrant-config.yaml
    let qdrant = `storage:\n`;
    qdrant += `  on_disk_payload: ${isOnDisk ? 'true' : 'false'}\n`;
    qdrant += `  performance:\n`;
    qdrant += `    max_search_threads: 4\n\n`;

    qdrant += `index:\n`;
    qdrant += `  hnsw:\n`;
    qdrant += `    m: ${mVal}\n`;
    qdrant += `    ef_construct: ${efConstructVal}\n`;
    qdrant += `    full_scan_threshold: 10000\n`;
    qdrant += `    on_disk: ${isOnDisk ? 'true' : 'false'}\n\n`;

    qdrant += `vector:\n`;
    qdrant += `  size: ${dim}\n`;
    qdrant += `  distance: ${qdrantDistance}\n`;

    compiledCode.vdb_qdrant = qdrant;

    // 2. Compile pgvector-init.sql
    let sql = `-- Enable pgvector extension inside PostgreSQL\n`;
    sql += `CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;\n\n`;
    sql += `CREATE SCHEMA IF NOT EXISTS ${schema};\n\n`;
    sql += `CREATE TABLE ${schema}.embeddings_store (\n`;
    sql += `    id BIGSERIAL PRIMARY KEY,\n`;
    sql += `    document_chunk TEXT NOT NULL,\n`;
    sql += `    embedding vector(${dim}) NOT NULL,\n`;
    sql += `    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\n`;
    sql += `);\n\n`;
    sql += `-- Create optimized HNSW index for high performance vector searches\n`;
    sql += `CREATE INDEX ON ${schema}.embeddings_store \n`;
    sql += `USING hnsw (embedding vector_${pgvectorDistanceOp}_ops)\n`;
    sql += `WITH (m = ${mVal}, ef_construction = ${efConstructVal});\n`;

    compiledCode.vdb_sql = sql;

    // 3. Compile query-db.py
    let py = `import os\n`;
    py += `from qdrant_client import QdrantClient\n`;
    py += `from qdrant_client.http import models\n\n`;
    py += `# Initialize Qdrant Client\n`;
    py += `client = QdrantClient(host="localhost", port=6333)\n\n`;
    py += `# Define Collection Parameters\n`;
    py += `COLLECTION_NAME = "sre_knowledge_base"\n\n`;
    py += `# Recreate collection with tuned parameters\n`;
    py += `client.recreate_collection(\n`;
    py += `    collection_name=COLLECTION_NAME,\n`;
    py += `    vectors_config=models.VectorParams(\n`;
    py += `        size=${dim},\n`;
    py += `        distance=models.Distance.${qdrantDistance.toUpperCase()},\n`;
    py += `        on_disk=${isOnDisk ? 'True' : 'False'}\n`;
    py += `    ),\n`;
    py += `    hnsw_config=models.HnswConfigDiff(\n`;
    py += `        m=${mVal},\n`;
    py += `        ef_construct=${efConstructVal},\n`;
    py += `        on_disk=${isOnDisk ? 'True' : 'False'}\n`;
    py += `    )\n`;
    py += `)\n\n`;
    py += `print(f"Collection '{COLLECTION_NAME}' optimized with HNSW parameters successfully.")\n`;

    compiledCode.vdb_py = py;

    // 4. Compile Flow (Mermaid)
    let flow = 'graph TD\n';
    flow += '  Query[🔎 User Query Text] -->|1. Vectorize| Embedder[🧠 Embedding Model]\n';
    flow += `  Embedder -->|2. Generate Embeddings: Dimension ${dim}| Engine[⚡ Search Engine]\n`;
    flow += `  Engine -->|3. Similarity Match via ${qdrantDistance}| Index[🕸️ HNSW Graph Index: M=${mVal}]\n`;
    if (isOnDisk) {
      flow += '  Index -->|Retrieve payload from disk| Disk[💾 SSD Disk Payload Store]\n';
      flow += '  Disk -->|Return matched chunks| User[👨‍💻 Application Response]\n';
    } else {
      flow += '  Index -->|Retrieve payload from RAM| RAM[⚡ RAM Memory Store]\n';
      flow += '  RAM -->|Return matched chunks| User[👨‍💻 Application Response]\n';
    }
    compiledCode.vdb_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'vdb_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.vdb_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'qdrant-config.yaml';
      if (activeTab === 'vdb_sql') filename = 'pgvector-init.sql';
      if (activeTab === 'vdb_py') filename = 'query-db.py';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.dimensions, elements.distance, elements.postgresSchema,
    elements.m, elements.efConstruct, elements.indexingOnDisk
  ];
  controls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('change', compileConfigs);
      ctrl.addEventListener('input', compileConfigs);
    }
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['vdb_qdrant', 'vdb_sql', 'vdb_py', 'vdb_flow'],
    'vdb_qdrant',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('vdb_dimensions')) {
    initVectorDbStudio();
  }
});

window.initVectorDbStudio = initVectorDbStudio;
