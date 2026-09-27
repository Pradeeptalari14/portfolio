// Vectorless RAG & Sparse Search Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'bm25_retriever_py';
  let compiledCode = {};

  function compileConfigs() {
    const engine = document.getElementById('retriever_engine').value;
    const stopwords = document.getElementById('stopwords_set').value;
    const k1 = document.getElementById('k1_param').value;
    const b = document.getElementById('b_param').value;

    // 1. bm25_retriever.py
    compiledCode.bm25_retriever_py = "#!/usr/bin/env python3\n" +
      "# Vectorless RAG Sparse Query Retrieval Engine\n" +
      "# Sparse Search Algorithm: " + engine.toUpperCase() + "\n" +
      "# Stopwords Filter Type: " + stopwords.toUpperCase() + "\n\n" +
      "import math\n" +
      "import re\n\n";

    if (stopwords === 'english') {
      compiledCode.bm25_retriever_py += "STOP_WORDS = set([\n" +
        "    'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', \n" +
        "    'to', 'for', 'in', 'on', 'at', 'by', 'from', 'with', 'of'\n" +
        "])\n\n";
    } else if (stopwords === 'nltk') {
      compiledCode.bm25_retriever_py += "STOP_WORDS = set([\n" +
        "    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', \n" +
        "    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him'\n" +
        "])\n\n";
    } else {
      compiledCode.bm25_retriever_py += "STOP_WORDS = set([])\n\n";
    }

    compiledCode.bm25_retriever_py += "def tokenize(text):\n" +
      "    # Basic regex tokenizer\n" +
      "    words = re.findall(r'\\w+', text.lower())\n" +
      "    return [w for w in words if w not in STOP_WORDS]\n\n" +
      "class BM25Retriever:\n" +
      "    def __init__(self, corpus):\n" +
      "        self.corpus = corpus\n" +
      "        self.k1 = " + k1 + "\n" +
      "        self.b = " + b + "\n" +
      "        self.doc_len = [len(tokenize(doc)) for doc in corpus]\n" +
      "        self.avg_doc_len = sum(self.doc_len) / len(corpus) if corpus else 0\n" +
      "        \n" +
      "    def score_query(self, query):\n" +
      "        q_tokens = tokenize(query)\n" +
      "        scores = []\n" +
      "        for idx, doc in enumerate(self.corpus):\n" +
      "            d_tokens = tokenize(doc)\n" +
      "            score = 0.0\n" +
      "            for term in q_tokens:\n" +
      "                tf = d_tokens.count(term)\n" +
      "                if tf > 0:\n" +
      "                    # Term Frequency Saturation calculation\n" +
      "                    numerator = tf * (self.k1 + 1)\n" +
      "                    denominator = tf + self.k1 * (1 - self.b + self.b * (self.doc_len[idx] / self.avg_doc_len))\n" +
      "                    score += (numerator / denominator)\n" +
      "            scores.append((doc, round(score, 4)))\n" +
      "        return sorted(scores, key=lambda x: x[1], reverse=True)\n";

    // 2. relational_search.sql
    compiledCode.relational_search_sql = "-- PostgreSQL Full-Text Search Schema & Index Configuration\n\n" +
      "CREATE TABLE IF NOT EXISTS documents (\n" +
      "    id SERIAL PRIMARY KEY,\n" +
      "    title VARCHAR(255) NOT NULL,\n" +
      "    body TEXT NOT NULL,\n" +
      "    tsv_body tsvector  -- Full-text representation vector\n" +
      ");\n\n" +
      "-- Create a GIN Index to index full-text words\n" +
      "CREATE INDEX IF NOT EXISTS doc_body_fts_idx ON documents USING GIN(tsv_body);\n\n" +
      "-- Trigger to automatically compile tsvector text tokens on insert/updates\n" +
      "CREATE OR REPLACE FUNCTION documents_tsv_trigger()\n" +
      "RETURNS TRIGGER AS $$\n" +
      "BEGIN\n" +
      "    NEW.tsv_body := to_tsvector('" + (stopwords === 'none' ? 'simple' : 'english') + "', NEW.body);\n" +
      "    RETURN NEW;\n" +
      "END;\n" +
      "$$ LANGUAGE plpgsql;\n\n" +
      "CREATE OR REPLACE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE\n" +
      "    ON documents FOR EACH ROW EXECUTE FUNCTION documents_tsv_trigger();\n\n" +
      "-- Vectorless query search matching tokens ranking\n" +
      "SELECT id, title, ts_rank(tsv_body, to_tsquery('english', $1)) AS rank\n" +
      "FROM documents\n" +
      "WHERE tsv_body @@ to_tsquery('english', $1)\n" +
      "ORDER BY rank DESC;\n";

    // 3. config.json
    compiledCode.config_json = JSON.stringify({
      retriever_engine: engine,
      hyperparameters: {
        k1: parseFloat(k1),
        b: parseFloat(b)
      },
      stopwords_filtered: stopwords !== 'none',
      indexing_pipeline: {
        method: engine === 'postgres_fts' ? 'relational_fts' : 'in_memory_sparse',
        threads: 4,
        index_directory: "var/lib/sparse_index"
      }
    }, null, 2);

    // 4. manim_flow.py (3Blue1Brown animation script)
    compiledCode.manim_flow = "#!/usr/bin/env python3\\n" +
      '"""\\n3Blue1Brown / Manim Programmatic Video Animation\\n' +
      'Vectorless RAG & Sparse Search Studio\\n' +
      'Render with: manim -pqh manim_flow.py VectorlessRagArchitectureScene\\n"""\\n' +
      "from manim import *\\n\\n" +
      "class VectorlessRagArchitectureScene(Scene):\\n" +
      "    def construct(self):\\n" +
      '        self.camera.background_color = "#0B0F19"\\n\\n' +
      '        CYAN_NEON = "#00F0FF"\\n        AMBER_NEON = "#F59E0B"\\n        EMERALD_NEON = "#10B981"\\n        BLUE_NEON = "#3B82F6"\\n        SLATE_CARD = "#131C31"\\n\\n' +
      '        title = Text("Vectorless RAG & Sparse Hybrid Search", font_size=24, weight=BOLD, color=WHITE).to_edge(UP, buff=0.4)\\n' +
      '        subtitle = Text("BM25 Tokenizer  ·  PostgreSQL GIN FTS  ·  RRF Ranker", font_size=12, color=CYAN_NEON).next_to(title, DOWN, buff=0.15)\\n' +
      '        self.play(FadeIn(title), FadeIn(subtitle), run_time=1.0)\\n\\n' +
      '        box1 = RoundedRectangle(corner_radius=0.15, width=2.4, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=CYAN_NEON, stroke_width=2.5).shift(LEFT * 4.8 + DOWN * 0.4)\\n' +
      '        t1 = Text("1. Multi-Source\\\\n\\\\nEnterprise Docs\\\\nSQL Records\\\\nKnowledge Wiki", font_size=11, color=WHITE, line_spacing=0.8).move_to(box1)\\n' +
      '        box2 = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=AMBER_NEON, stroke_width=2.5).shift(LEFT * 1.6 + DOWN * 0.4)\\n' +
      '        t2 = Text("2. Tokenizer & BM25\\\\n\\\\n' + engine.toUpperCase() + '\\\\nk1=' + k1 + ', b=' + b + '\\\\nStopwords: ' + stopwords + '", font_size=11, color=WHITE, line_spacing=0.8).move_to(box2)\\n' +
      '        box3 = RoundedRectangle(corner_radius=0.15, width=2.8, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=BLUE_NEON, stroke_width=2.5).shift(RIGHT * 1.6 + DOWN * 0.4)\\n' +
      '        t3 = Text("3. Relational FTS\\\\n\\\\nPostgres tsvector\\\\nGIN Indexing\\\\nts_rank scoring", font_size=11, color=WHITE, line_spacing=0.8).move_to(box3)\\n' +
      '        box4 = RoundedRectangle(corner_radius=0.15, width=2.6, height=3.0, fill_color=SLATE_CARD, fill_opacity=0.9, stroke_color=EMERALD_NEON, stroke_width=2.5).shift(RIGHT * 4.8 + DOWN * 0.4)\\n' +
      '        t4 = Text("4. RRF Ranker\\\\n\\\\nZero Embedding Cost\\\\n< 5ms Latency\\\\nExact Lexical Match", font_size=11, color=WHITE, line_spacing=0.8).move_to(box4)\\n\\n' +
      '        a1 = Arrow(box1.get_right(), box2.get_left(), color=CYAN_NEON, buff=0.1, stroke_width=3)\\n' +
      '        a2 = Arrow(box2.get_right(), box3.get_left(), color=AMBER_NEON, buff=0.1, stroke_width=3)\\n' +
      '        a3 = Arrow(box3.get_right(), box4.get_left(), color=BLUE_NEON, buff=0.1, stroke_width=3)\\n\\n' +
      '        self.play(FadeIn(VGroup(box1, t1)), GrowArrow(a1), FadeIn(VGroup(box2, t2)), GrowArrow(a2), FadeIn(VGroup(box3, t3)), GrowArrow(a3), FadeIn(VGroup(box4, t4)), run_time=1.8)\\n' +
      '        packet = Dot(color=CYAN_NEON, radius=0.12).move_to(box1.get_center())\\n' +
      '        self.play(FadeIn(packet), packet.animate.move_to(box2.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box2, color=AMBER_NEON), packet.animate.move_to(box3.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box3, color=BLUE_NEON), packet.animate.move_to(box4.get_center()), run_time=0.6)\\n' +
      '        self.play(Flash(box4, color=EMERALD_NEON, flash_radius=1.5), FadeOut(packet), run_time=0.5)\\n' +
      '        hud = RoundedRectangle(corner_radius=0.15, width=10.5, height=0.75, fill_color="#0F172A", fill_opacity=0.95, stroke_color=EMERALD_NEON, stroke_width=1.5).to_edge(DOWN, buff=0.25)\\n' +
      '        hud_text = Text("Keyword Recall: 99.1%   |   Search Latency: 4.8ms   |   Embedding Cost: $0.00", font_size=11, weight=BOLD, color=WHITE).move_to(hud)\\n' +
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
      "      - name: Spin up SQL database container\n" +
      "        run: |\n" +
      "          docker compose up -d\n" +
      "          sleep 10\n\n" +
      "      - name: Run sparse search checks\n" +
      "        run: |\n" +
      "          bash scripts/validate.sh\n";

    let filename = 'bm25_retriever.py';
    if (activeTab === 'relational_search_sql') filename = 'relational_search.sql';
    if (activeTab === 'config_json') filename = 'config.json';
    if (activeTab === 'manim_flow') filename = 'manim_flow.py';
    if (activeTab === 'github_actions_yml') filename = 'sre-validation.yml';
    
    if (document.getElementById('download-name-input')) {
      document.getElementById('download-name-input').value = filename;
    }
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'rag_flow') {
      elements.outputBox.classList.add('hidden');
      if (elements.mermaidContainer) {
        elements.mermaidContainer.classList.remove('hidden');
        elements.mermaidContainer.innerHTML = `
          <div class="flex flex-col items-center gap-4 w-full">
            <img src="vectorless_rag_flow.png" alt="Vectorless RAG and Sparse Hybrid Search Engine Architecture" class="rounded-xl border border-slate-700 shadow-2xl max-w-full" style="max-height: 300px;" />
            <div class="text-xs text-slate-400 font-mono">Vectorless RAG and Sparse Hybrid Search Topology</div>
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
    ['bm25_retriever_py', 'relational_search_sql', 'config_json', 'manim_flow', 'rag_flow', 'github_actions_yml', 'terminal'],
    'bm25_retriever_py',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('vectorless-rag', 'Vectorless RAG & Sparse Search');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
