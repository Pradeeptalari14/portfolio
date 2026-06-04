import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'migration';

let compiledCode = {
  migration: '',
  rollback: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('migration_engine').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileMigration();
  compileRollback();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileMigration() {
  const engine = $('migration_engine').value;
  const db = $('migration_db').value;
  const op = $('migration_op').value;
  const table = $('migration_table').value || 'users';

  let code = '';

  if (engine === 'liquibase') {
    if (op === 'create_table') {
      code = `databaseChangeLog:
  - changeSet:
      id: 1
      author: Talari Pradeep
      comment: Create table ${table} v${SCRIPT_VERSION}
      changes:
        - createTable:
            tableName: ${table}
            columns:
              - column:
                  name: id
                  type: bigint
                  constraints:
                    primaryKey: true
                    nullable: false
              - column:
                  name: created_at
                  type: timestamp
                  defaultValueComputed: now()
`;
    } else if (op === 'add_column') {
      code = `databaseChangeLog:
  - changeSet:
      id: 2
      author: Talari Pradeep
      comment: Add status column to ${table} v${SCRIPT_VERSION}
      changes:
        - addColumn:
            tableName: ${table}
            columns:
              - column:
                  name: status
                  type: varchar(50)
                  defaultValue: 'PENDING'
`;
    } else {
      code = `databaseChangeLog:
  - changeSet:
      id: 3
      author: Talari Pradeep
      comment: Create index on ${table} v${SCRIPT_VERSION}
      changes:
        - createIndex:
            indexName: idx_${table}_status
            tableName: ${table}
            columns:
              - column:
                  name: status
`;
    }
  } else {
    // Flyway (SQL)
    if (op === 'create_table') {
      code = `-- V1__create_${table}_table.sql v${SCRIPT_VERSION}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

CREATE TABLE ${table} (
    id ${db === 'postgres' ? 'BIGSERIAL PRIMARY KEY' : 'BIGINT AUTO_INCREMENT PRIMARY KEY'},
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
    } else if (op === 'add_column') {
      code = `-- V2__add_status_column_to_${table}.sql v${SCRIPT_VERSION}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

ALTER TABLE ${table} ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
`;
    } else {
      code = `-- V3__create_index_on_${table}_status.sql v${SCRIPT_VERSION}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

CREATE INDEX idx_${table}_status ON ${table} (status);
`;
    }
  }

  compiledCode.migration = code;
}

function compileRollback() {
  const db = $('migration_db').value;
  const op = $('migration_op').value;
  const table = $('migration_table').value || 'users';

  let code = '';

  if (op === 'create_table') {
    code = `-- Rollback SQL v${SCRIPT_VERSION}
-- Reverts table creation for: ${table}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

DROP TABLE IF EXISTS ${table};
`;
  } else if (op === 'add_column') {
    code = `-- Rollback SQL v${SCRIPT_VERSION}
-- Reverts column addition on: ${table}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

ALTER TABLE ${table} DROP COLUMN IF EXISTS status;
`;
  } else {
    code = `-- Rollback SQL v${SCRIPT_VERSION}
-- Reverts index creation on: ${table}
-- Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
-- Database target: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}

DROP INDEX IF EXISTS idx_${table}_status;
`;
  }

  compiledCode.rollback = code;
}

function compileReadme() {
  const engine = $('migration_engine').value;
  const db = $('migration_db').value;
  const op = $('migration_op').value;
  const table = $('migration_table').value || 'users';

  let md = `# Database Schema Migration Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package contains schema migration configurations and rollback SQL mappings.

## Configuration Details

- **Migration Engine**: ${engine === 'liquibase' ? 'Liquibase (YAML Changelogs)' : 'Flyway (Versioned SQL)'}
- **Target Database**: ${db === 'postgres' ? 'PostgreSQL' : 'MySQL'}
- **Operation**: ${op.replace('_', ' ').toUpperCase()} on table \`${table}\`

## How to Apply

### ${engine === 'liquibase' ? 'Liquibase Usage' : 'Flyway Usage'}
1. Verify database credentials in pipeline properties.
2. Run database migration engine:
   \`\`\`bash
   ${engine === 'liquibase' ? 'liquibase update' : 'flyway migrate'}
   \`\`\`
3. If failure triggers SRE alerts, apply the \`rollback.sql\` script.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  let md = `# SRE Runbook: Database Migration & Schema Lock Recovery
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Database Migration Lock / Pipeline Blocked

Follow these recovery steps if migrations fail due to locked change logs (e.g. Liquibase databasechangeloglock table):

### Step 1: Detect Active Lock
Identify if the migration engine has locked the database table:
- Liquibase: Check the \`DATABASECHANGELOGLOCK\` table.
- Flyway: Check the \`flyway_schema_history\` table for pending/failed runs.

### Step 2: Clear Database Change Log Lock
Run the following SQL to release the lock in the event of an abrupt CI pipeline cancellation:
\`\`\`sql
UPDATE DATABASECHANGELOGLOCK SET LOCKED = FALSE, LOCKGRANTED = NULL, LOCKEDBY = NULL WHERE ID = 1;
\`\`\`

### Step 3: Rollback Failed Deployment
If a partially applied DDL statement corrupted the target schema:
1. Verify rollback.sql matches the broken target state.
2. Execute the rollback.sql queries manually or via pipeline.
3. Commit correct DDL to Git and trigger the rerun.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n';

  chart += `  CI[CI/CD Pipeline] -->|1. Run database migration| Migrate[Migration Runner (Liquibase/Flyway)]\n`;
  chart += `  Migrate -->|2. Check Schema Lock| LockCheck{Is Database Locked?}\n`;
  chart += `  LockCheck -->|Yes| Fail[Abort deployment & alert SRE]\n`;
  chart += `  LockCheck -->|No| LockDB[3. Set database lock]\n`;
  chart += `  LockDB -->|4. Apply DDL migration| DB[(Target Database: Postgres/MySQL)]\n`;
  chart += `  DB -->|5. Record in schema history| DBHistory[Save changelog state]\n`;
  chart += `  DBHistory -->|6. Release lock| Finish[Deployment Completed Successfully]\n`;

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'migration') {
    nameBox.value = 'migration';
    const engine = $('migration_engine').value;
    extTag.textContent = engine === 'liquibase' ? '.yaml' : '.sql';
  } else if (tabId === 'rollback') {
    nameBox.value = 'rollback';
    extTag.textContent = '.sql';
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
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
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
  const engine = $('migration_engine').value;
  const zip = new JSZip();
  
  zip.file('migration' + (engine === 'liquibase' ? '.yaml' : '.sql'), compiledCode.migration);
  zip.file('rollback.sql', compiledCode.rollback);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `db-migration-sre-${engine}.zip`;
    a.click();
    showToast('⬇️ Database Migration SRE package downloaded!');
  });
}

function clearAllFields() {
  $('migration_engine').value = 'liquibase';
  $('migration_db').value = 'postgres';
  $('migration_op').value = 'create_table';
  $('migration_table').value = 'users';

  switchTab('migration');
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

function toggleManualItem(idx) {
  const el = $('manual-item-' + idx);
  if (el) {
    el.classList.toggle('hidden');
  }
}

function compileManual() {
  const engine = $('migration_engine').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'liquibase': [
      {
        title: 'Liquibase Declarative Schema Migrations',
        why: 'Safeguards migrations across various engines using a declarative markup changelog.',
        whyNot: 'Requires writing raw SQL migrations for different database engines individually.',
        runtime: 'Maintains migration states inside target databases using databasechangelog table logs.'
      }
    ],
    'flyway': [
      {
        title: 'Flyway SQL Versioned Migrations',
        why: 'Applies native raw DDL queries directly to the target schema with minimal overhead.',
        whyNot: 'Restricts portability of schema change configurations if switching DB engine vendors.',
        runtime: 'Checks migration filenames and tracks hashes in flyway_schema_history tables.'
      }
    ]
  };

  const activeData = manualData[engine] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ ${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> ${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> ${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> ${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;

  if (activeTab === 'migration') {
    explanation = {
      'title': 'Database Migration Config',
      'filename': 'migration.yaml',
      'why': 'Declares migration changesets to execute table creation, column insertion, or index definition.',
      'when': 'Apply during build/release pipeline or server initialization hooks.',
      'where': 'Store in migrations or db/changelog package directories.',
      'command': 'liquibase update',
      'practices': ['Keep changesets atomic.', 'Write explicit rollbacks for non-automatic changes.'],
      'ai_mlops': 'Used by SRE deployment agents to verify database state integrity.',
      'flow': '[Database Change Log Definition]'
    };
  } else if (activeTab === 'rollback') {
    explanation = {
      'title': 'Schema Rollback SQL Query',
      'filename': 'rollback.sql',
      'why': 'Defines exact DDL rollback queries to revert migration actions safely.',
      'when': 'Execute in the event of a bad release version deployment or failed migration check.',
      'where': 'Store in migrations or rollback directories.',
      'command': 'liquibase rollbackCount 1',
      'practices': ['Always test rollbacks in staging environments.', 'Guard against data-destructive rollback actions.'],
      'ai_mlops': 'Used by self-healing recovery controllers to repair database status.',
      'flow': '[DDL Rollback Script]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Migration Setup README',
      'filename': 'README.md',
      'why': 'Step-by-step guidelines to configure migration pipelines and properties.',
      'when': 'Consult when onboarding new developers or setting up new databases.',
      'where': 'Save in migration root folder.',
      'command': '# Open in viewer',
      'practices': ['Document target schema username privileges requirement.'],
      'ai_mlops': 'Context inputs for database deployment automation scripts.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Lock Recovery Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Explains diagnostic commands and recovery procedures for schema locks.',
      'when': 'Triggered if migrations freeze due to network drops or pipeline cancellations.',
      'where': 'Store in SRE Runbook library.',
      'command': '# Open in viewer',
      'practices': ['Verify lock owner matches aborted runs before manually unlocking.'],
      'ai_mlops': 'Self-contained context to guide automated incident response steps.',
      'flow': '[Locked Pipeline] ➔ [Detect Owner] ➔ [Release Lock SQL] ➔ [Re-run Pipeline]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Schema Migration Lifecycle Flow',
      'filename': 'flow.mermaid',
      'why': 'Diagram detailing step-by-step lock checking and execution.',
      'when': 'Review during design audits or pipeline architecture workshops.',
      'where': 'Rendered visual pane.',
      'command': '# Render in browser',
      'practices': ['Ensure lock timeout constraints are configured.'],
      'ai_mlops': 'Inference guide for pipeline health checks.',
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

  $('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';
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
