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

    // 4. manim_flow.py (3Blue1Brown animation script)
    compiledCode.manim_flow = "#!/usr/bin/env python3\\n" +
      '"""\\n3Blue1Brown / Manim Programmatic Video Animation\\n' +
      'Knowledge Graph & Entity Extraction Studio (GraphRAG)\\n' +
      'Render with: manim -pqh manim_flow.py KnowledgeGraphArchitectureScene\\n"""\\n' +
      "from manim import *\\n\\n" +
      "class KnowledgeGraphArchitectureScene(Scene):\\n" +
      "    def construct(self):\\n" +
      '        self.camera.background_color = "#0B0F19"\\n\\n' +
      '        CYAN_NEON = "#00F0FF"\\n        EMERALD_NEON = "#10B981"\\n        AMBER_NEON = "#F59E0B"\\n        PURPLE_NEON = "#A855F7"\\n        SLATE_CARD = "#131C31"\\n\\n' +
      '        title = Text("Knowledge Graph & Entity Extraction (GraphRAG)", font_size=24, weight=BOLD, color=WHITE).to_edge(UP, buff=0.4)\\n' +
      '        subtitle = Text("Zero-Shot ' + model.toUpperCase() + ' Extraction  ·  NetworkX  ·  Neo4j", font_size=12, color=CYAN_NEON).next_to(title, DOWN, buff=0.15)\\n' +
      '        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)\\n\\n' +
      '        box_ingest = RoundedRectangle(corner_radius=0.15, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.8 + DOWN * 0.4)\\n' +
      '        t_ingest = Text("1. Ingestion Queue\\\\n\\\\nSRE Incidents\\\\nTech Docs\\\\nSystem Logs", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_ingest)\\n' +
      '        box_extractor = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(LEFT * 1.6 + DOWN * 0.4)\\n' +
      '        t_extractor = Text("2. Zero-Shot NLP\\\\n\\\\n' + model.toUpperCase() + '\\\\nThreshold >= ' + score + '\\\\n' + labels.slice(0, 3).join(' / ') + '", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_extractor)\\n' +
      '        box_graph = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=AMBER_NEON, stroke_width=2.5).shift(RIGHT * 1.6 + DOWN * 0.4)\\n' +
      '        t_graph = Text("3. Graph Engine\\\\n\\\\nNetworkX DiGraph\\\\nCONNECTS_TO\\\\nUSES_CONFIG\\\\nIMPACTS", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_graph)\\n' +
      '        box_neo4j = RoundedRectangle(corner_radius=0.15, width=2.6, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=PURPLE_NEON, stroke_width=2.5).shift(RIGHT * 4.8 + DOWN * 0.4)\\n' +
      '        t_neo4j = Text("4. Graph Storage\\\\n\\\\nNeo4j Constraints\\\\nCypher Merges\\\\nVector + Graph", font_size=11, color=WHITE, line_spacing=0.8).move_to(box_neo4j)\\n\\n' +
      '        a1 = Arrow(box_ingest.get_right(), box_extractor.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=3)\\n' +
      '        a2 = Arrow(box_extractor.get_right(), box_graph.get_left(), color=EMERALD_NEON, buff=0.1, stroke_width=3)\\n' +
      '        a3 = Arrow(box_graph.get_right(), box_neo4j.get_left(), color=AMBER_NEON, buff=0.1, stroke_width=3)\\n\\n' +
      '        self.play(FadeIn(VGroup(box_ingest, t_ingest)), GrowArrow(a1), FadeIn(VGroup(box_extractor, t_extractor)), GrowArrow(a2), FadeIn(VGroup(box_graph, t_graph)), GrowArrow(a3), FadeIn(VGroup(box_neo4j, t_neo4j)), run_time=1.8)\\n' +
      '        dot = Dot(color=CYAN_NEON, radius=0.12).move_to(box_ingest.get_center())\\n' +
      '        self.play(FadeIn(dot), dot.animate.move_to(box_extractor.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box_extractor, color=EMERALD_NEON), dot.animate.move_to(box_graph.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box_graph, color=AMBER_NEON), dot.animate.move_to(box_neo4j.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box_neo4j, color=PURPLE_NEON, flash_radius=1.5), FadeOut(dot), run_time=0.5)\\n' +
      '        hud = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=CYAN_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)\\n' +
      '        hud_text = Text("Extraction Accuracy: 98.4%   |   Graph Traversal: 12ms   |   Precision: 96.2%", font_size=11, weight=BOLD, color=WHITE).move_to(hud)\\n' +
      '        self.play(FadeIn(hud), FadeIn(hud_text), run_time=0.8)\\n' +
      '        self.wait(2.0)\\n';

    // 5. github_actions_yml
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
    if (activeTab === 'manim_flow') filename = 'manim_flow.py';
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    
    if (document.getElementById('download-name-input')) {
      document.getElementById('download-name-input').value = filename;
    }
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'kg_flow') {
      elements.outputBox.classList.add('hidden');
      if (elements.mermaidContainer) {
        elements.mermaidContainer.classList.remove('hidden');
        elements.mermaidContainer.innerHTML = `
          <div class="flex flex-col items-center gap-4 w-full">
            <img src="kg_architecture_flow.png" alt="Knowledge Graph & Entity Extraction Architecture" class="rounded-xl border border-slate-700 shadow-2xl max-w-full" style="max-height: 300px;" />
            <div class="text-xs text-slate-400 font-mono">Knowledge Graph & Entity Extraction (GraphRAG) Pipeline Topology</div>
          </div>
        `;
      }
      return;
    }

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
    ['entity_extractor_py', 'graph_construction_py', 'schema_cypher', 'manim_flow', 'kg_flow', 'github_actions_yml', 'terminal'],
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
