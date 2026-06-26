// GraphRAG & Neo4j Database Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'schema_import_cypher';
  let compiledCode = {};

  function compileConfigs() {
    const license = document.getElementById('graph_node').value;
    const apoc = document.getElementById('apoc_enabled').value;
    const threshold = document.getElementById('similarity_threshold').value;
    const embedding = document.getElementById('embedding_model').value;

    compiledCode.schema_import_cypher = "// Neo4j Graph Database DDL Schema Constraints & APOC Setup\n" +
      "// Target Mode: " + license.toUpperCase() + "\n\n" +
      "// 1. Establish Unique Constraints on Graph Nodes\n" +
      "CREATE CONSTRAINT unique_document_id IF NOT EXISTS\n" +
      "FOR (d:Document) REQUIRE d.id IS UNIQUE;\n\n" +
      "CREATE CONSTRAINT unique_chunk_id IF NOT EXISTS\n" +
      "FOR (c:Chunk) REQUIRE c.id IS UNIQUE;\n\n" +
      "CREATE CONSTRAINT unique_entity_name IF NOT EXISTS\n" +
      "FOR (e:Entity) REQUIRE e.name IS UNIQUE;\n\n" +
      "// 2. Establish Relationship Indexes\n" +
      "CREATE INDEX relationship_type_idx IF NOT EXISTS\n" +
      "FOR ()-[r:RELATES_TO]-() ON (r.type);\n";

    if (apoc === 'true') {
      compiledCode.schema_import_cypher += "\n// Load entities using APOC json imports\n" +
        "CALL apoc.import.json('file:///entities_seed.json', {\n" +
        "  nodeLabels: {Entity: 'name'},\n" +
        "  relationshipTypes: {RELATES_TO: 'type'}\n" +
        "});\n";
    }

    compiledCode.vector_index_cypher = "// Neo4j Vector Index creation and cosine similarity traversal\n" +
      "// Dimension size and model: " + embedding + "\n\n" +
      "// Create the Vector Index\n" +
      "CREATE VECTOR INDEX chunk_embeddings IF NOT EXISTS\n" +
      "FOR (c:Chunk) ON (c.embedding)\n" +
      "OPTIONS {\n" +
      "  indexConfig: {\n" +
      "    `vector.dimensions`: " + (embedding === 'text-multilingual-embedding' ? '768' : (embedding === 'bge-large-en' ? '1024' : '1536')) + ",\n" +
      "    `vector.similarity_function`: 'cosine'\n" +
      "  }\n" +
      "};\n\n" +
      "// Query GraphRAG context with Cosine Similarity above " + threshold + "\n" +
      "MATCH (c:Chunk)\n" +
      "WHERE c.id IS NOT NULL\n" +
      "CALL db.index.vector.queryNodes('chunk_embeddings', 3, $queryVector)\n" +
      "YIELD node, score\n" +
      "WHERE score >= " + threshold + "\n" +
      "MATCH (node)-[:PART_OF]->(d:Document)\n" +
      "MATCH (node)-[:MENTIONS]->(e:Entity)\n" +
      "RETURN d.title AS document, node.text AS chunk, collect(e.name) AS entities, score\n" +
      "ORDER BY score DESC;\n";

    compiledCode.docker_compose_yml = "version: '3.8'\n" +
      "services:\n" +
      "  neo4j:\n" +
      "    image: neo4j:5.20.0-community\n" +
      "    container_name: neo4j-graphrag-dev\n" +
      "    ports:\n" +
      "      - \"7474:7474\" # HTTP UI\n" +
      "      - \"7687:7687\" # Bolt protocol\n" +
      "    volumes:\n" +
      "      - neo4j_data:/data\n" +
      "      - neo4j_import:/var/lib/neo4j/import\n" +
      "    environment:\n" +
      "      - NEO4J_AUTH=neo4j/sre_secure_password\n" +
      "      - NEO4J_PLUGINS=[\"apoc\", \"gds\"]\n" +
      "      - NEO4J_dbms_security_procedures_unrestricted=apoc.*,gds.*\n" +
      "      - NEO4J_dbms_security_procedures_allowlist=apoc.*,gds.*\n" +
      "      - NEO4J_apoc_import_file_enabled=" + apoc + "\n" +
      "    restart: unless-stopped\n\n" +
      "volumes:\n" +
      "  neo4j_data:\n" +
      "  neo4j_import:\n";

    compiledCode.github_actions_yml = "name: SRE Validation & Integration Verification\n\n" +
      "on:\n" +
      "  push:\n" +
      "    branches: [ main ]\n" +
      "  pull_request:\n" +
      "    branches: [ main ]\n\n" +
      "jobs:\n" +
      "  validate:\n" +
      "    runs-on: ubuntu-latest\n" +
      "    steps:\n" +
      "      - name: Checkout Code\n" +
      "        uses: actions/checkout@v4\n\n" +
      "      - name: Spin up Docker Compose services\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          echo \"Waiting for database services to boot...\"\n" +
      "          sleep 15\n\n" +
      "      - name: Run Environment Check\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'schema_import.cypher';
    if (activeTab === 'vector_index_cypher') filename = 'vector_index.cypher';
    if (activeTab === 'docker_compose_yml') filename = 'docker-compose.yml';
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');
      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
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
      elements.outputBox.textContent = compiledCode[activeTab] || '';
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
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
    ['schema_import_cypher', 'vector_index_cypher', 'docker_compose_yml', 'github_actions_yml', 'terminal'],
    'schema_import_cypher',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('neo4j-graphrag', 'GraphRAG & Neo4j Database Studio');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
