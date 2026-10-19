// Supabase & pgvector Developer Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'supabase_schema_sql';
  let compiledCode = {};

  function compileConfigs() {
    const port = document.getElementById('local_port').value;
    const metric = document.getElementById('similarity_metric').value;
    const dimensions = document.getElementById('vector_dimensions').value;
    const rls = document.getElementById('enable_rls').value;

    let op = metric === 'cosine' ? '<=>' : (metric === 'l2' ? '<->' : '<#>');

    compiledCode.supabase_schema_sql = "-- Enable pgvector extension inside PostgreSQL\n" +
      "CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;\n\n" +
      "-- Create target document embedding table\n" +
      "CREATE TABLE IF NOT EXISTS public.documents (\n" +
      "  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,\n" +
      "  title text NOT NULL,\n" +
      "  content text NOT NULL,\n" +
      "  embedding vector(" + dimensions + "),\n" +
      "  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL\n" +
      ");\n\n" +
      "-- Create an HNSW index on the vector embeddings\n" +
      "CREATE INDEX IF NOT EXISTS documents_hnsw_idx ON public.documents\n" +
      "USING hnsw (embedding vector_" + (metric === 'inner_product' ? 'ip' : (metric === 'l2' ? 'l1' : 'cosine')) + "_ops);\n\n";

    if (rls === 'enabled') {
      compiledCode.supabase_schema_sql += "-- Enable Row Level Security (RLS) on document store\n" +
        "ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;\n\n" +
        "-- Define default read-only policy for authenticated requests\n" +
        "CREATE POLICY \"Allow authenticated select access\"\n" +
        "  ON public.documents FOR SELECT\n" +
        "  TO authenticated\n" +
        "  USING (true);\n\n";
    }

    compiledCode.supabase_schema_sql += "-- Query pgvector embeddings with similarity match\n" +
      "CREATE OR REPLACE FUNCTION match_documents (\n" +
      "  query_embedding vector(" + dimensions + "),\n" +
      "  match_threshold float,\n" +
      "  match_count int\n" +
      ") RETURNS TABLE (\n" +
      "  id uuid,\n" +
      "  title text,\n" +
      "  content text,\n" +
      "  similarity float\n" +
      ") LANGUAGE plpgsql AS $$\n" +
      "BEGIN\n" +
      "  RETURN QUERY\n" +
      "  SELECT\n" +
      "    documents.id,\n" +
      "    documents.title,\n" +
      "    documents.content,\n" +
      "    1 - (documents.embedding " + op + " query_embedding) AS similarity\n" +
      "  FROM documents\n" +
      "  WHERE 1 - (documents.embedding " + op + " query_embedding) > match_threshold\n" +
      "  ORDER BY documents.embedding " + op + " query_embedding\n" +
      "  LIMIT match_count;\n" +
      "END;\n" +
      "$$;\n";

    compiledCode.seed_sql = "-- Database seed data for local testing\n" +
      "INSERT INTO public.documents (title, content, embedding)\n" +
      "VALUES\n" +
      "  ('Kubernetes OOM Outage Manual', 'If memory limits are exceeded, Kubernetes will send SIGKILL...', array_fill(0.123, ARRAY[" + dimensions + "])::vector),\n" +
      "  ('Database Cluster Failover Guide', 'Active-passive replication failovers are managed by Patroni...', array_fill(0.456, ARRAY[" + dimensions + "])::vector);\n";

    compiledCode.config_toml = "# Supabase Local CLI configuration parameters\n" +
      "[api]\n" +
      "port = " + port + "\n" +
      "schemas = [\"public\", \"graphql_public\"]\n" +
      "extra_search_path = [\"public\"]\n\n" +
      "[db]\n" +
      "port = 5432\n" +
      "shadow_port = 5433\n\n" +
      "[db.pooler]\n" +
      "enabled = true\n" +
      "port = 6543\n";

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

    let filename = 'supabase_schema.sql';
    if (activeTab === 'seed_sql') filename = 'seed.sql';
    if (activeTab === 'config_toml') filename = 'config.toml';
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
    ['supabase_schema_sql', 'seed_sql', 'config_toml', 'github_actions_yml', 'terminal'],
    'supabase_schema_sql',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initialize interactive SRE terminal console
  window.SreCore.initTerminalSupport('supabase-pgvector', 'Supabase & pgvector Developer Studio');

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  initStudio();
});

window.initStudio = initStudio;
