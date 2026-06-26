// Databricks Lakehouse Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'databricks_yml';
  let compiledCode = {};

  function compileConfigs() {
    
    const nodes = document.getElementById('db_nodes').value;
    const scale = document.getElementById('db_scale').value;
    const role = document.getElementById('unity_permission').value;
    const mosaic = document.getElementById('mosaic_search').value;

    const workers = scale.split('-');

    compiledCode.databricks_yml = "# Databricks Asset Bundle (DAB) Configuration\n" +
      "bundle:\n" +
      "  name: mosaic-ai-pipelines\n\n" +
      "targets:\n" +
      "  dev:\n" +
      "    workspace:\n" +
      "      host: https://adb-12345678.azuredatabricks.net\n\n" +
      "resources:\n" +
      "  jobs:\n" +
      "    sync_mosaic_index_job:\n" +
      "      name: Sync Delta Lake Table to Vector Search\n" +
      "      tasks:\n" +
      "        - task_key: run_pyspark_ingest\n" +
      "          existing_cluster_id: dev-shared-cluster\n" +
      "          notebook_task:\n" +
      "            notebook_path: ./src/pyspark_job.py\n";

    compiledCode.cluster_config_json = JSON.stringify({
      cluster_name: "dev-shared-cluster",
      spark_version: "14.3.x-scala2.12",
      node_type_id: nodes,
      autoscale: {
        min_workers: parseInt(workers[0]),
        max_workers: parseInt(workers[1])
      },
      spark_env_vars: {
        DATABRICKS_UNITY_CATALOG: "enabled",
        DEFAULT_PRIVILEGES_ROLE: role
      },
      custom_tags: {
        Environment: "DevOps-MLOps-Shared"
      }
    }, null, 2);

    compiledCode.pyspark_job_py = "# PySpark Delta Table to Mosaic AI Vector Search Synchronization\n" +
      "from pyspark.sql import SparkSession\n" +
      "from databricks.vector_search.client import VectorSearchClient\n\n" +
      "spark = SparkSession.builder.getOrCreate()\n\n" +
      "# Read from Delta Table catalog\n" +
      "df = spark.read.table(\"main.default.incident_manuals\")\n\n";

    if (mosaic === 'enabled') {
      compiledCode.pyspark_job_py += "# Sync delta table chunks to vector index\n" +
        "client = VectorSearchClient()\n" +
        "index_name = \"main.default.incident_manuals_index\"\n\n" +
        "print(f\"Syncing Delta Table to Vector Search Index: {index_name}...\")\n" +
        "client.create_delta_sync_index(\n" +
        "  endpoint_name=\"shared-vector-search-endpoint\",\n" +
        "  source_table_name=\"main.default.incident_manuals\",\n" +
        "  index_name=index_name,\n" +
        "  pipeline_type=\"TRIGGERED\",\n" +
        "  primary_key=\"chunk_id\",\n" +
        "  embedding_source_column=\"manual_text\",\n" +
        "  embedding_model_endpoint_name=\"databricks-bge-large-en\"\n" +
        ")\n" +
        "print(\"✅ Vector Search synchronization successfully triggered.\")\n";
    } else {
      compiledCode.pyspark_job_py += "# Process dataset with Spark transformations\n" +
        "df_filtered = df.filter(df[\"category\"] == \"SRE\")\n" +
        "df_filtered.write.format(\"delta\").mode(\"overwrite\").saveAsTable(\"main.default.sre_filtered_manuals\")\n" +
        "print(\"✅ Normal Delta Lake write complete.\")\n";
    }

    let filename = 'databricks.yml';
    if (activeTab === 'cluster_config_json') filename = 'cluster_config.json';
    if (activeTab === 'pyspark_job_py') filename = 'pyspark_job.py';
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
    ['databricks_yml', 'cluster_config_json', 'pyspark_job_py'],
    'databricks_yml',
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
