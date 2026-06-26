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
    ['bm25_retriever_py', 'relational_search_sql', 'config_json', 'github_actions_yml', 'terminal'],
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
