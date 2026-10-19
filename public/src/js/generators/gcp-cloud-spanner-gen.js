// GCP Cloud Spanner Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'spanner_sql';
  let compiledCode = {};

  function compileConfigs() {
    
    const id = document.getElementById('spanner_id').value;
    const nodes = document.getElementById('spanner_nodes').value;
    const ddl = document.getElementById('spanner_ddl').value;

    let sql = "";
    if (ddl === 'ecommerce') {
      sql = "CREATE TABLE Users (\n" + 
        "  UserId INT64 NOT NULL,\n" + 
        "  Email STRING(256) NOT NULL,\n" + 
        "  CreatedAt TIMESTAMP,\n" + 
        ") PRIMARY KEY (UserId);\n\n" + 
        "CREATE TABLE Orders (\n" + 
        "  OrderId INT64 NOT NULL,\n" + 
        "  UserId INT64 NOT NULL,\n" + 
        "  OrderAmount NUMERIC,\n" + 
        ") PRIMARY KEY (OrderId), INTERLEAVE IN PARENT Users ON DELETE CASCADE;\n";
    } else {
      sql = "CREATE TABLE DeviceMetrics (\n" + 
        "  DeviceId STRING(64) NOT NULL,\n" + 
        "  Timestamp TIMESTAMP NOT NULL,\n" + 
        "  Temperature FLOAT64,\n" + 
        ") PRIMARY KEY (DeviceId, Timestamp);\n";
    }
    compiledCode.spanner_sql = sql;

    compiledCode.spanner_tf = "resource \"google_spanner_instance\" \"spanner\" {\n" + 
      "  config       = \"regional-us-central1\"\n" + 
      "  display_name = \"" + id + "\"\n" + 
      "  num_nodes    = " + nodes + "\n" + 
      "}\n\n" + 
      "resource \"google_spanner_database\" \"db\" {\n" + 
      "  instance = google_spanner_instance.spanner.name\n" + 
      "  name     = \"app-db\"\n" + 
      "  ddl      = [\n" + 
      "    \"" + sql.replace(/\n/g, '\\n') + "\"\n" + 
      "  ]\n" + 
      "}\n";

    compiledCode.spanner_flow = "graph TD\n  Terraform -->|Provision nodes: " + nodes + "| Instance[Spanner Instance: " + id + "]\n  Instance -->|Apply spanner_ddl.sql| DB[Database Schema: app-db]\n  DB -->|Interleaved relationship| QueryClient[High throughput SRE client]\n";
    
    let filename = 'spanner_ddl.sql';
    if (activeTab === 'spanner_tf') filename = 'spanner.tf';
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
      elements.outputBox.textContent = compiledCode[activeTab];
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
    ['spanner_sql', 'spanner_tf', 'spanner_flow'],
    'spanner_sql',
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
  initStudio();
});

window.initStudio = initStudio;
