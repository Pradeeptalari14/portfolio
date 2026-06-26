// Snowflake Data Warehouse Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'snowflake_ddl_sql';
  let compiledCode = {};

  function compileConfigs() {
    
    const size = document.getElementById('wh_size').value;
    const suspend = document.getElementById('wh_suspend').value;
    const storage = document.getElementById('storage_provider').value;
    const model = document.getElementById('cortex_model').value;

    let isRAG = model === 'cortex-search';

    compiledCode.snowflake_ddl_sql = "-- Snowflake Data Warehouse & Cortex AI Scaffolding DDL\n" +
      "CREATE WAREHOUSE IF NOT EXISTS APPS_WH\n" +
      "  WAREHOUSE_SIZE = '" + size + "'\n" +
      "  AUTO_SUSPEND = " + (suspend * 60) + "\n" +
      "  AUTO_RESUME = TRUE\n" +
      "  INITIALLY_SUSPENDED = TRUE;\n\n" +
      "CREATE DATABASE IF NOT EXISTS CORTEX_AI_DB;\n" +
      "CREATE SCHEMA IF NOT EXISTS CORTEX_AI_DB.PUBLIC;\n\n" +
      "-- Storage Integration for external data ingestion\n" +
      "CREATE STORAGE INTEGRATION IF NOT EXISTS s3_lake_integration\n" +
      "  TYPE = EXTERNAL_STAGE\n" +
      "  STORAGE_PROVIDER = '" + (storage.startsWith('s3') ? 'S3' : (storage.startsWith('azure') ? 'AZURE' : 'GCS')) + "'\n" +
      "  ENABLED = TRUE\n" +
      "  STORAGE_ALLOWED_LOCATIONS = ('" + storage + "/');\n\n";

    if (isRAG) {
      compiledCode.snowflake_ddl_sql += "-- Cortex Search Service definition for RAG retrieval\n" +
        "CREATE OR REPLACE CORTEX SEARCH SERVICE docs_search_service\n" +
        "  ON document_chunk\n" +
        "  ATTRIBUTES (category, product)\n" +
        "  WAREHOUSE = APPS_WH\n" +
        "  TARGET_PATH = '@cortex_stage/docs_search_index'\n" +
        "  AS SELECT document_chunk, chunk_id, category, product FROM CORTEX_AI_DB.PUBLIC.manual_chunks;\n\n" +
        "-- Query Cortex Search index inside SQL\n" +
        "SELECT SNOWFLAKE.CORTEX.SEARCH_PREVIEW(\n" +
        "  'docs_search_service',\n" +
        "  '{\"query\": \"how to handle memory leaks\", \"limit\": 3}'\n" +
        ");\n";
    } else {
      compiledCode.snowflake_ddl_sql += "-- Execute native Cortex COMPLETE function\n" +
        "SELECT SNOWFLAKE.CORTEX.COMPLETE(\n" +
        "  '" + model + "',\n" +
        "  'Summarize the following incident report: ' || incident_text\n" +
        ") FROM CORTEX_AI_DB.PUBLIC.incident_logs\n" +
        "LIMIT 10;\n";
    }

    compiledCode.dbt_profile_yml = "cortex_analytics:\n" +
      "  target: dev\n" +
      "  outputs:\n" +
      "    dev:\n" +
      "      type: snowflake\n" +
      "      account: xy12345.west-us-2\n" +
      "      user: dbt_operator\n" +
      "      password: \"{{ env_var('DBT_PASSWORD') }}\"\n" +
      "      role: ANALYST_ROLE\n" +
      "      database: CORTEX_AI_DB\n" +
      "      schema: PUBLIC\n" +
      "      warehouse: APPS_WH\n" +
      "      threads: 4\n" +
      "      client_session_keep_alive: False\n";

    compiledCode.terraform_snowflake_tf = "resource \"snowflake_warehouse\" \"apps_wh\" {\n" +
      "  name           = \"APPS_WH\"\n" +
      "  warehouse_size = \"" + size + "\"\n" +
      "  auto_suspend   = " + (suspend * 60) + "\n" +
      "  auto_resume    = true\n" +
      "}\n\n" +
      "resource \"snowflake_database\" \"db\" {\n" +
      "  name = \"CORTEX_AI_DB\"\n" +
      "}\n\n" +
      "resource \"snowflake_storage_integration\" \"integration\" {\n" +
      "  name    = \"S3_LAKE_INTEGRATION\"\n" +
      "  type    = \"EXTERNAL_STAGE\"\n" +
      "  enabled = true\n" +
      "  storage_allowed_locations = [\"" + storage + "/\"]\n" +
      "  storage_provider = \"" + (storage.startsWith('s3') ? 'S3' : (storage.startsWith('azure') ? 'AZURE' : 'GCS')) + "\"\n" +
      "}\n";

    let filename = 'snowflake_ddl.sql';
    if (activeTab === 'dbt_profile_yml') filename = 'dbt_project.yml';
    if (activeTab === 'terraform_snowflake_tf') filename = 'terraform_snowflake.tf';
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
    ['snowflake_ddl_sql', 'dbt_profile_yml', 'terraform_snowflake_tf'],
    'snowflake_ddl_sql',
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
