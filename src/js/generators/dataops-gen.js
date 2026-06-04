import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'config';

let compiledCode = {
  config: '',
  instrument: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('protocol_type').addEventListener('change', triggerCompileAll);
  $('db_source').addEventListener('change', triggerCompileAll);
  $('quality_suite').addEventListener('change', triggerCompileAll);

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileConfig();
  compileInstrument();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileConfig() {
  const protocol = $('protocol_type').value;
  const db = $('db_source').value;

  let code = '';
  if (protocol === 'airflow') {
    code = `# airflow_dag.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Apache Airflow DAG orchestrating automated data sweeps and validation checks

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.common.sql.operators.sql import SQLExecuteQueryOperator

default_args = {
    'owner': 'DataOps_Team',
    'depends_on_past': False,
    'start_date': datetime(2026, 6, 1),
    'email': ['talaripradeep45@gmail.com'],
    'email_on_failure': True,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def validate_data_quality(**kwargs):
    print("Initiating data validation via Great Expectations...")
    # Trigger Great Expectations checkpoint
    # return_code = run_data_validation(db="${db}")
    print("Data validation check completed successfully.")

with DAG(
    'dataops_reliability_pipeline',
    default_args=default_args,
    description='Automated DataOps pipeline with reliability checkpoints',
    schedule_interval='@hourly',
    catchup=False,
) as dag:

    extract_and_load = SQLExecuteQueryOperator(
        task_id='extract_and_load_source',
        sql='SELECT * FROM staging.events_raw;',
        conn_id='${db}_conn_id',
    )

    quality_check = PythonOperator(
        task_id='run_data_quality_checks',
        python_callable=validate_data_quality,
    )

    extract_and_load >> quality_check
`;
  } else {
    code = `# prefect_flow.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Prefect Flow orchestrating automated data ingestion and validation

from prefect import flow, task
import time

@task(retries=3, retry_delay_seconds=60)
def extract_and_load_events():
    print("Connecting to ${db.toUpperCase()} and loading events...")
    # Simulate DB load
    time.sleep(2)
    return "staging_table"

@task
def run_dataops_validation(table_name):
    print(f"Auditing data quality on table {table_name}...")
    # Run quality assertions
    # raise Exception("Data format anomaly detected!")
    return True

@flow(name="DataOps Reliability Flow")
def dataops_pipeline():
    staging = extract_and_load_events()
    run_dataops_validation(staging)

if __name__ == "__main__":
    dataops_pipeline()
`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const suite = $('quality_suite').value;
  const db = $('db_source').value;

  let code = '';
  if (suite === 'great_expectations') {
    code = `{
  "data_quality_suite_name": "dataops.reliability.${db}",
  "meta": {
    "great_expectations_version": "0.18.0",
    "version": "v${SCRIPT_VERSION}",
    "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved."
  },
  "expectations": [
    {
      "expectation_type": "expect_column_values_to_not_be_null",
      "kwargs": {
        "column": "id"
      }
    },
    {
      "expectation_type": "expect_table_row_count_to_be_between",
      "kwargs": {
        "min_value": 1
      }
    },
    {
      "expectation_type": "expect_column_values_to_be_of_type",
      "kwargs": {
        "column": "created_at",
        "type_": "TIMESTAMP"
      }
    }
  ]
}`;
  } else {
    code = `#!/usr/bin/env python3
# custom_validator.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Custom SRE Data Quality Validation Script for ${db.toUpperCase()}

import sys
import psycopg2 # or equivalent db connectors

def check_db_integrity():
    print("Initiating row counts and null values validation...")
    
    # Query sample schema
    # cursor.execute("SELECT COUNT(*) FROM staging.events WHERE id IS NULL;")
    null_count = 0 
    
    if null_count > 0:
        print(f"🚨 Data Quality violation: {null_count} null primary keys identified!")
        sys.exit(1)
        
    print("✅ Schema integrity check succeeded.")

if __name__ == "__main__":
    check_db_integrity()
`;
  }

  compiledCode.instrument = code;
}

function compileReadme() {
  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  let md = `# DataOps & Data Reliability Engineering Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Automate your data pipeline validations. This studio configures execution DAGs/Flows and formats schema/data validation test suites to prevent database corruptions and reporting pipeline regressions.

## File Package Contents
- \`airflow_dag.py\` / \`prefect_flow.py\`: Ingestion orchestrator.
- \`validation_suite.json\` / \`custom_validator.py\`: Data quality rules.
- \`sre_runbook.md\`: Alert resolution protocols.

## Quick Start
1. Place pipeline file in your DAG directory:
   \`\`\`bash
   # For Airflow
   cp airflow_dag.py ~/airflow/dags/
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   pip install great_expectations prefect apache-airflow
   \`\`\`
3. Run the validation checks locally:
   \`\`\`bash
   # For custom validator
   python custom_validator.py
   \`\`\`
`;

  compiledCode.readme = md;
}

function compileRunbook() {
  const db = $('db_source').value;

  let md = `# SRE Runbook: Data Pipeline Execution and Quality Failures
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Ingestion flow fails or validation rules breach on ${db.toUpperCase()}

When pipeline alerts trigger:

### Step 1: Pinpoint the Failure
1. View Airflow Task Instance logs or Prefect Run history:
   \`\`\`bash
   airflow tasks logs dataops_reliability_pipeline run_data_quality_checks <execution_date>
   \`\`\`
2. Check if the failure is:
   - **Infrastructure**: Connection timeout to database.
   - **Data Quality**: Null primary keys or mismatched data types in input events.

### Step 2: Validate Database Connection
Verify socket connectivity from execution runners to the target database:
\`\`\`bash
nc -zv ${db}-db-hostname 5432
\`\`\`

### Step 3: Run Validation Manually
If data sync needs manual reconciliation:
1. Trigger a validation run manually:
   \`\`\`bash
   python custom_validator.py
   \`\`\`
2. Rollback corrupt tables using the latest snapshot if null values breach safety margins.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  let chart = 'graph TD\n';
  chart += `  Src[Source Events] -->|Ingestion| Ingest[${protocol.toUpperCase()} Ingest Task]\n`;
  chart += `  Ingest -->|Load Staging| DB[(Database Staging)]\n`;
  chart += `  DB -->|Audit| Validate[${suite.toUpperCase()} Checks]\n`;
  chart += `  Validate -->|Pass| Target[(Production Data Warehouse)]\n`;
  chart += `  Validate -->|Fail| Alert[Trigger SRE Data Quality Alert]\n`;

  compiledCode.flow = chart;
}

function compileManual() {
  const accordion = $('sre-manual-accordion');
  if (!accordion) return;

  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  accordion.innerHTML = `
    <div class="border-b border-slate-100 pb-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(0)">
        <span>⚙️ Workflow Engine: ${protocol.toUpperCase()}</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2" id="manual-body-0">
        Controls how data sweeps are scheduled. Airflow compiles traditional hourly tasks, whereas Prefect compiles event-driven flow runners.
      </p>
    </div>
    <div class="border-b border-slate-100 pb-2 pt-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(1)">
        <span>🗄️ Database Source</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2 hidden" id="manual-body-1">
        Target database storage engine. SREs configure connection pools and network transit limits to prevent query timeouts during ingestion.
      </p>
    </div>
    <div class="pb-2 pt-2">
      <h4 class="font-bold text-gray-800 cursor-pointer flex justify-between items-center" onclick="toggleManualItem(2)">
        <span>🔍 Data Quality Check: ${suite.toUpperCase()}</span>
        <span class="text-[10px]">▼</span>
      </h4>
      <p class="text-gray-500 mt-1 pl-2 hidden" id="manual-body-2">
        Data verification methodology. Great Expectations generates declarative schemas, while custom Python checks run SQL validations directly on the data tables.
      </p>
    </div>
  `;
}

function toggleManualItem(index) {
  const bodies = [$('manual-body-0'), $('manual-body-1'), $('manual-body-2')];
  bodies.forEach((el, i) => {
    if (i === index) {
      el.classList.toggle('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  if (tabId === 'config') {
    nameBox.value = protocol === 'airflow' ? 'airflow_dag' : 'prefect_flow';
    extTag.textContent = '.py';
  } else if (tabId === 'instrument') {
    nameBox.value = suite === 'great_expectations' ? 'validation_suite' : 'custom_validator';
    extTag.textContent = suite === 'great_expectations' ? '.json' : '.py';
  } else if (tabId === 'readme') {
    nameBox.value = 'README';
    extTag.textContent = '.md';
  } else if (tabId === 'runbook') {
    nameBox.value = 'sre_runbook';
    extTag.textContent = '.md';
  } else if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  }
  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    try {
      mermaid.run({
        nodes: [container.querySelector('.mermaid')]
      });
    } catch (e) {
      console.error("Mermaid render error:", e);
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: \${e.message}\n\nCode:\n\${compiledCode.flow}</pre>`;
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

function copyActiveTabContent() {
  const content = compiledCode[activeTab];
  navigator.clipboard.writeText(content).then(() => {
    showToast('✅ Copied tab config to clipboard!');
  });
}

function downloadScriptZip() {
  const zip = new JSZip();

  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  zip.file(protocol === 'airflow' ? 'airflow_dag.py' : 'prefect_flow.py', compiledCode.config);
  zip.file(suite === 'great_expectations' ? 'validation_suite.json' : 'custom_validator.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dataops-reliability-package.zip`;
    a.click();
    showToast('⬇️ DataOps SRE package downloaded!');
  });
}

function clearAllFields() {
  $('protocol_type').value = 'airflow';
  $('db_source').value = 'postgres';
  $('quality_suite').value = 'great_expectations';

  switchTab('config');
  triggerCompileAll();
  showToast('🗑️ Defaults configurations successfully restored!');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function explainActiveTabCode() {
  let explanation = null;

  const protocol = $('protocol_type').value;
  const suite = $('quality_suite').value;

  if (activeTab === 'config') {
    explanation = {
      'title': protocol === 'airflow' ? 'Airflow Ingestion DAG' : 'Prefect Workflow Flow',
      'filename': protocol === 'airflow' ? 'airflow_dag.py' : 'prefect_flow.py',
      'why': 'Orchestrates hourly raw staging data extractions and loads, followed by validation checks.',
      'when': 'Deploy to automate staging data synchronization workflows.',
      'where': 'Upload to centralized scheduler DAGs folders.',
      'command': protocol === 'airflow' ? 'airflow dags trigger dataops_reliability_pipeline' : 'prefect deployment run dataops_pipeline',
      'practices': ['Pin task retry limits and delays to survive transient network timeouts.', 'Set alerting webhooks.'],
      'ai_mlops': 'Maintains raw clean dataset structures for model training downstream.',
      'flow': '[Staging DB Ingestion] ➔ [Trigger Data Verification]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': suite === 'great_expectations' ? 'Great Expectations Declarative Schema' : 'Custom SQL Python Checker',
      'filename': suite === 'great_expectations' ? 'validation_suite.json' : 'custom_validator.py',
      'why': 'Enforces data quality constraints like primary key null rules, minimum rows, and column types.',
      'when': 'Run as a gateway step before data is loaded to analytics/production tables.',
      'where': 'Deploy as a test stage in your CI or containerized pipeline task runner.',
      'command': suite === 'great_expectations' ? 'great_expectations checkpoint run checkpoint_name' : 'python custom_validator.py',
      'practices': ['Track rule breaches in metrics databases to map data quality trends.', 'Enforce schema boundaries.'],
      'ai_mlops': 'Validates dynamic prompt or features formats inputs before ingestion.',
      'flow': '[Verify primary keys] ➔ [Verify row count] ➔ [Confirm timestamp formats]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Setup Documentation',
      'filename': 'README.md',
      'why': 'Guides data reliability engineers on running and configuring data validation tools.',
      'when': 'Read during workspace initialization.',
      'where': 'Project repository root folder.',
      'command': '# View guide',
      'practices': ['Document all environment variables and database credentials schemas.'],
      'ai_mlops': 'Documentation reference.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Pipeline Failure Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Provides step-by-step triage actions when data validation rules fail.',
      'when': 'Active on target validation breach alerts.',
      'where': 'Reference in operational runbooks catalog.',
      'command': '# View playbook',
      'practices': ['Include automated table rollback commands.', 'Enforce SLA alerts routing.'],
      'ai_mlops': 'Protects AI inference models from training on corrupt data inputs.',
      'flow': '[Quality Breach] ➔ [Fetch DAG logs] ➔ [Reconcile tables]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Mermaid Data flow',
      'filename': 'flow.mermaid',
      'why': 'Visualizes data pipeline transitions and verification checkpoints.',
      'when': 'Review during data architecture sessions.',
      'where': 'Flowchart canvas view.',
      'command': '# View flow',
      'practices': ['Map all critical validation gates clearly.'],
      'ai_mlops': 'Data lifecycle blueprint.',
      'flow': '[Mermaid Canvas Diagram]'
    };
  }

  if (!explanation) {
    showToast("⚠️ No explanation available for this tab.");
    return;
  }

  $('drawer-title').textContent = explanation.title;
  $('drawer-filename').textContent = explanation.filename;
  $('explain-why').innerHTML = explanation.why;
  $('explain-when').innerHTML = explanation.when;
  $('explain-where').innerHTML = explanation.where;
  $('explain-command').textContent = explanation.command;

  const practicesBox = $('explain-practices');
  practicesBox.innerHTML = '';
  explanation.practices.forEach(practice => {
    const li = document.createElement('li');
    li.innerHTML = practice;
    practicesBox.appendChild(li);
  });

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops;
  $('explain-flow').textContent = explanation.flow;

  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-full');
  drawer.classList.add('translate-x-0');
}

function closeExplanationDrawer() {
  const drawer = $('explanation-drawer');
  drawer.classList.remove('translate-x-0');
  drawer.classList.add('translate-x-full');
}

window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
