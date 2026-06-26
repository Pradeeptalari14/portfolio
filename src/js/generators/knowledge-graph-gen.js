// Knowledge Graph & Entity Extraction Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'entity_extractor_py';
  let compiledCode = {};

  function compileConfigs() {
    const model = document.getElementById('extraction_model').value;
    const format = document.getElementById('graph_storage').value;
    const score = document.getElementById('confidence_score').value;
    const labels = document.getElementById('entity_types').value.split(',').map(s => s.trim().toUpperCase());

    // 1. entity_extractor.py
    compiledCode.entity_extractor_py = "#!/usr/bin/env python3\n" +
      "# Programmatic Entity Extraction NLP Pipeline\n" +
      "# Extraction Model: " + model.toUpperCase() + "\n" +
      "# Target Labels: " + labels.join(', ') + "\n" +
      "# Minimum Confidence: " + score + "\n\n";

    if (model === 'gliner') {
      compiledCode.entity_extractor_py += "from gliner import GLiNER\n\n" +
        "def extract_semantic_entities(text):\n" +
        "    # Initialize Zero-Shot NLP Extractor\n" +
        "    model = GLiNER.from_pretrained('ursaber/gliner_medium-v2.1')\n" +
        "    labels = " + JSON.stringify(labels) + "\n\n" +
        "    entities = model.predict_entities(text, labels, threshold=" + score + ")\n" +
        "    extracted = []\n" +
        "    for ent in entities:\n" +
        "        extracted.append({\n" +
        "            'text': ent['text'],\n" +
        "            'label': ent['label'],\n" +
        "            'score': round(ent['score'], 4)\n" +
        "        })\n" +
        "    return extracted\n";
    } else {
      compiledCode.entity_extractor_py += "import spacy\n\n" +
        "def extract_semantic_entities(text):\n" +
        "    # Load pipeline model\n" +
        "    nlp = spacy.load('" + (model === 'spacy_trf' ? 'en_core_web_trf' : 'en_core_web_sm') + "')\n" +
        "    doc = nlp(text)\n" +
        "    extracted = []\n" +
        "    allowed_labels = set(" + JSON.stringify(labels) + ")\n\n" +
        "    for ent in doc.ents:\n" +
        "        if ent.label_ in allowed_labels:\n" +
        "            extracted.append({\n" +
        "                'text': ent.text,\n" +
        "                'label': ent.label_,\n" +
        "                'score': 1.0  # rule-based fallback\n" +
        "            })\n" +
        "    return extracted\n";
    }

    // 2. graph_construction.py
    compiledCode.graph_construction_py = "#!/usr/bin/env python3\n" +
      "# NetworkX Graph Construction & Relations Mapping\n\n" +
      "import networkx as nx\n" +
      "import json\n\n" +
      "def build_knowledge_graph(entity_list):\n" +
      "    G = nx.DiGraph()\n" +
      "    \n" +
      "    # 1. Add extracted nodes with metadata\n" +
      "    for ent in entity_list:\n" +
      "        G.add_node(ent['text'], label=ent['label'], score=ent['score'])\n" +
      "        \n" +
      "    # 2. Establish semantic links (relational rules)\n" +
      "    nodes = list(G.nodes())\n" +
      "    for i in range(len(nodes)):\n" +
      "        for j in range(i + 1, len(nodes)):\n" +
      "            n1, n2 = nodes[i], nodes[j]\n" +
      "            l1 = G.nodes[n1]['label']\n" +
      "            l2 = G.nodes[n2]['label']\n" +
      "            \n" +
      "            # Link Service to Database\n" +
      "            if l1 == 'SERVICE' and l2 == 'DATABASE':\n" +
      "                G.add_edge(n1, n2, relation='CONNECTS_TO')\n" +
      "            elif l1 == 'SERVICE' and l2 == 'CONFIG':\n" +
      "                G.add_edge(n1, n2, relation='USES_CONFIG')\n" +
      "            elif l1 == 'OUTAGE' and l2 == 'SERVICE':\n" +
      "                G.add_edge(n1, n2, relation='IMPACTS')\n" +
      "                \n" +
      "    return G\n";

    // 3. schema_cypher / rdf / graphml
    if (format === 'neo4j') {
      compiledCode.schema_cypher = "// Graph Database Node Uniqueness Schema Constraints\n" +
        "CREATE CONSTRAINT unique_entity_name IF NOT EXISTS\n" +
        "FOR (e:Entity) REQUIRE e.name IS UNIQUE;\n\n" +
        "// Cypher query to import constructed relationships\n" +
        "UNWIND $relations AS rel\n" +
        "MERGE (source:Entity {name: rel.source})\n" +
        "SET source.label = rel.source_label\n" +
        "MERGE (target:Entity {name: rel.target})\n" +
        "SET target.label = rel.target_label\n" +
        "MERGE (source)-[r:RELATES_TO {type: rel.relation}]->(target);\n";
    } else if (format === 'rdf') {
      compiledCode.schema_cypher = "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n" +
        "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n" +
        "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n" +
        "@prefix kg: <http://talaripradeep.info/schema/kg#> .\n\n" +
        "// Define classes\n" +
        "kg:Entity rdf:type rdfs:Class .\n" +
        "kg:Relation rdf:type rdfs:Property .\n\n" +
        "// Assert dynamic triples\n" +
        "kg:ServiceNode rdf:type kg:Entity ;\n" +
        "               rdfs:label \"ServiceNode\" ;\n" +
        "               kg:connectsTo kg:DatabaseNode .\n";
    } else {
      compiledCode.schema_cypher = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\">\n" +
        "  <key id=\"d0\" for=\"node\" attr.name=\"label\" attr.type=\"string\"/>\n" +
        "  <graph id=\"G\" edgedefault=\"directed\">\n" +
        "    <node id=\"ServiceNode\">\n" +
        "      <data key=\"d0\">SERVICE</data>\n" +
        "    </node>\n" +
        "    <node id=\"DatabaseNode\">\n" +
        "      <data key=\"d0\">DATABASE</data>\n" +
        "    </node>\n" +
        "    <edge source=\"ServiceNode\" target=\"DatabaseNode\"/>\n" +
        "  </graph>\n" +
        "</graphml>\n";
    }

    // 4. github_actions_yml
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
      "      - name: Spin up graph database service\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          sleep 10\n\n" +
      "      - name: Run validation checks\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'entity_extractor.py';
    let tab3_name = 'schema_import.cypher';
    
    if (format === 'rdf') tab3_name = 'schema_import.ttl';
    if (format === 'graphml') tab3_name = 'schema_import.graphml';

    const tab3Btn = document.getElementById('tab-schema_cypher');
    if (tab3Btn) tab3Btn.innerHTML = `📊 ${tab3_name}`;

    if (activeTab === 'graph_construction_py') filename = 'graph_construction.py';
    if (activeTab === 'schema_cypher') filename = tab3_name;
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    
    if (document.getElementById('download-name-input')) {
      document.getElementById('download-name-input').value = filename;
    }
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    elements.outputBox.classList.remove('hidden');
    if (elements.mermaidContainer) elements.mermaidContainer.classList.add('hidden');
    elements.outputBox.textContent = compiledCode[activeTab] || '';
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select');
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
    ['entity_extractor_py', 'graph_construction_py', 'schema_cypher', 'github_actions_yml', 'terminal'],
    'entity_extractor_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('knowledge-graph', 'Knowledge Graph Construction & GraphRAG');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
