// Google BigQuery Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'bigquery_schema_sql';
  let compiledCode = {};

  function compileConfigs() {
    
    const region = document.getElementById('bq_region').value;
    const partition = document.getElementById('bq_partition').value;
    const model = document.getElementById('bqml_model').value;
    const rls = document.getElementById('bq_rls').value;

    compiledCode.bigquery_schema_sql = "-- GCP BigQuery & Vertex AI Inferences DDL\n" +
      "CREATE SCHEMA IF NOT EXISTS sre_data_platform\n" +
      "  OPTIONS (location = '" + region + "');\n\n" +
      "CREATE TABLE IF NOT EXISTS sre_data_platform.incident_events (\n" +
      "  event_id STRING,\n" +
      "  event_msg STRING,\n" +
      "  created_at TIMESTAMP,\n" +
      "  ingested_date DATE\n" +
      ")\n";

    if (partition !== 'none') {
      compiledCode.bigquery_schema_sql += "PARTITION BY " + (partition === 'created_at' ? 'TIMESTAMP_TRUNC(created_at, DAY)' : 'ingested_date') + "\n" +
        "CLUSTER BY event_id;\n\n";
    } else {
      compiledCode.bigquery_schema_sql += "CLUSTER BY event_id;\n\n";
    }

    if (rls === 'enabled') {
      compiledCode.bigquery_schema_sql += "-- Define row-level security policy on logs\n" +
        "CREATE ROW ACCESS POLICY sre_operator_filter\n" +
        "  ON sre_data_platform.incident_events\n" +
        "  GRANT TO ('domain:corp.internal')\n" +
        "  FILTER USING (SESSION_USER() = event_msg);\n\n";
    }

    compiledCode.bigquery_schema_sql += "-- Create Connection to Vertex AI\n" +
      "CREATE OR REPLACE CONNECTION sre_data_platform.us.vertex_conn\n" +
      "  REMOTE_TYPE = 'CONN_REGISTRY'\n" +
      "  OPTIONS (endpoint = 'us-central1-aiplatform.googleapis.com');\n\n" +
      "-- Register generative model inside BigQuery ML\n" +
      "CREATE OR REPLACE MODEL sre_data_platform.vertex_llm\n" +
      "  REMOTE WITH CONNECTION sre_data_platform.us.vertex_conn\n" +
      "  OPTIONS (endpoint = '" + model + "');\n\n" +
      "-- Execute model query with ML.GENERATE_TEXT\n" +
      "SELECT * FROM ML.GENERATE_TEXT(\n" +
      "  MODEL sre_data_platform.vertex_llm,\n" +
      "  (SELECT 'Summarize this incident: ' || event_msg AS prompt FROM sre_data_platform.incident_events),\n" +
      "  STRUCT(0.2 AS temperature, 256 AS max_output_tokens)\n" +
      ") LIMIT 5;\n";

    compiledCode.iam_policy_json = JSON.stringify({
      bindings: [
        {
          role: "roles/bigquery.connectionUser",
          members: [
            "serviceAccount:bq-vertex-conn-sa@prod-sre-gcp.iam.gserviceaccount.com"
          ]
        },
        {
          role: "roles/aiplatform.user",
          members: [
            "serviceAccount:bq-vertex-conn-sa@prod-sre-gcp.iam.gserviceaccount.com"
          ]
        }
      ]
    }, null, 2);

    compiledCode.dbt_profiles_yml = "google_bigquery:\n" +
      "  target: dev\n" +
      "  outputs:\n" +
      "    dev:\n" +
      "      type: bigquery\n" +
      "      method: service-account\n" +
      "      project: prod-sre-gcp\n" +
      "      dataset: sre_data_platform\n" +
      "      threads: 4\n" +
      "      keyfile: credentials.json\n" +
      "      timeout_seconds: 300\n" +
      "      priority: interactive\n" +
      "      location: " + region + "\n";

    let filename = 'bigquery_schema.sql';
    if (activeTab === 'iam_policy_json') filename = 'iam_policy.json';
    if (activeTab === 'dbt_profiles_yml') filename = 'dbt_profiles.yml';
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
    ['bigquery_schema_sql', 'iam_policy_json', 'dbt_profiles_yml'],
    'bigquery_schema_sql',
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
