import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  retention: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('backup_provider').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileRetention();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const provider = $('backup_provider').value;
  const target = $('backup_target').value;
  const retention = $('backup_retention').value;
  const schedule = $('backup_schedule').value;

  let code = '';

  if (provider === 'velero') {
    code = `# velero_backup.yaml v${SCRIPT_VERSION} - Kubernetes Backup Configuration
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: k8s-backup-schedule
  namespace: velero
spec:
  schedule: "${schedule === 'hourly' ? '0 * * * *' : (schedule === 'daily' ? '0 1 * * *' : '0 1 * * 0')}"
  template:
    ttl: ${retention === '30' ? '720h0m0s' : (retention === '90' ? '2160h0m0s' : '8760h0m0s')}
    includedNamespaces:
      - '*'
    storageLocation: default
    volumeSnapshotLocations:
      - default
`;
  } else if (provider === 'pg_dump') {
    code = `#!/usr/bin/env bash
# pg_backup.sh v${SCRIPT_VERSION} - Database backup & replication routine
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

set -eo pipefail

BACKUP_DIR="/var/backups/postgres"
TIMESTAMP=$(date +%F_%T)
BACKUP_FILE="\${BACKUP_DIR}/db_backup_\${TIMESTAMP}.sql.gz"
RETENTION_DAYS=${retention}

echo "💾 Starting Postgres Database Backup..."
mkdir -p "\${BACKUP_DIR}"

# Run pg_dump
pg_dumpall -U postgres | gzip > "\${BACKUP_FILE}"

echo "📤 Uploading backup to SRE repository: ${target}..."
if [ "${target}" = "s3" ]; then
  aws s3 cp "\${BACKUP_FILE}" "s3://company-db-backups/\$(basename "\${BACKUP_FILE}")"
elif [ "${target}" = "gcs" ]; then
  gsutil cp "\${BACKUP_FILE}" "gs://company-db-backups/\$(basename "\${BACKUP_FILE}")"
fi

# Clean up older backups
echo "🧹 Purging local backups older than \${RETENTION_DAYS} days..."
find "\${BACKUP_DIR}" -type f -name "db_backup_*" -mtime +\${RETENTION_DAYS} -delete

echo "✅ Database backup complete!"
`;
  } else {
    // AWS Backup (Terraform config snippet)
    code = `# aws_backup.tf v${SCRIPT_VERSION} - AWS Backup Terraform Configuration
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

resource "aws_backup_vault" "sre_vault" {
  name        = "sre_production_backup_vault"
  kms_key_arn = "arn:aws:kms:us-east-1:123456789012:key/backup-key"
}

resource "aws_backup_plan" "sre_plan" {
  name = "sre_backup_plan"

  rule {
    rule_name         = "sre_backup_rule"
    target_vault_name = aws_backup_vault.sre_vault.name
    schedule          = "${schedule === 'hourly' ? 'cron(0 * ? * * *)' : (schedule === 'daily' ? 'cron(0 12 ? * * *)' : 'cron(0 12 ? * SUN *)')}"

    lifecycle {
      delete_after = ${retention}
    }
  }
}
`;
  }

  compiledCode.script = code;
}

function compileRetention() {
  const target = $('backup_target').value;
  const retention = $('backup_retention').value;

  let code = '';

  if (target === 's3') {
    code = `{
  "Rules": [
    {
      "ID": "SREBackupLifecyclePolicy",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "backups/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": ${retention}
      }
    }
  ]
}
`;
  } else if (target === 'gcs') {
    code = `{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": ${retention}
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "COLDLINE"
        },
        "condition": {
          "age": 30
        }
      }
    ]
  }
}
`;
  } else {
    code = `# local_cleanup.sh v${SCRIPT_VERSION} - Clean up local storage cron
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Run weekly to purge files older than ${retention} days
find /var/backups/ -type f -mtime +${retention} -exec rm -f {} \\;
`;
  }

  compiledCode.retention = code;
}

function compileReadme() {
  const provider = $('backup_provider').value;
  const target = $('backup_target').value;
  const retention = $('backup_retention').value;

  let md = `# Backup & Disaster Recovery Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Automated SRE backup triggers, retention lifecycle policies, and disaster recovery recovery plans.

## Configuration Details

- **Backup Client**: ${provider.toUpperCase()}
- **Storage Target**: ${target.toUpperCase()}
- **Retention Period**: ${retention} Days

## Configuration Instructions

1. Configure storage credentials and permissions.
2. Schedule the backup runner template in system scheduler (cron / Kubernetes Schedule / AWS Backup).
3. Set up the lifecycle configuration rules on your storage buckets (${target.toUpperCase()}) to enforce automatic retention limits.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const provider = $('backup_provider').value;
  const target = $('backup_target').value;

  let md = `# SRE Runbook: Disaster Recovery & Restore Process
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Scenario: Database corruption / Cluster failure recovery

Follow these steps to restore production data from the storage bucket:

### Step 1: Locate the Backup Asset
Identify the latest healthy backup in ${target.toUpperCase()} bucket:
\`\`\`bash
${target === 's3' ? 'aws s3 ls s3://company-db-backups/ --recursive' : (target === 'gcs' ? 'gsutil ls gs://company-db-backups/' : 'ls -la /var/backups/')}
\`\`\`

### Step 2: Restore Process
Depending on the client selected, trigger the restore sequence:

`;

  if (provider === 'velero') {
    md += `1. Verify Velero client connectivity:
   \`\`\`bash
   velero backup get
   \`\`\`
2. Trigger the restore from snapshot:
   \`\`\`bash
   velero restore create --from-backup <BACKUP_NAME>
   \`\`\`
3. Verify pod recoveries:
   \`\`\`bash
   kubectl get pods -n production -w
   \`\`\`
`;
  } else if (provider === 'pg_dump') {
    md += `1. Download database snapshot file locally:
   \`\`\`bash
   ${target === 's3' ? 'aws s3 cp s3://company-db-backups/<BACKUP_FILE> db_restore.sql.gz' : (target === 'gcs' ? 'gsutil cp gs://company-db-backups/<BACKUP_FILE> db_restore.sql.gz' : 'cp /var/backups/<BACKUP_FILE> db_restore.sql.gz')}
   \`\`\`
2. Decompress and apply SQL:
   \`\`\`bash
   gunzip -c db_restore.sql.gz | psql -U postgres -d production
   \`\`\`
3. Verify DB records and execute SRE smoke tests.
`;
  } else {
    md += `1. Access AWS Backup Console ➔ Protected resources.
2. Select Recovery Point ID corresponding to target instance.
3. Click "Restore" and specify VPC and Subnet configurations.
4. Verify server connectivity after target EC2/RDS is provisioned.
`;
  }

  md += `
### Step 3: Verify & Sign-Off
1. Validate system health logs for ERRORS.
2. Check database transaction sanity metrics.
3. Report restore success in the incident ticket.
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Cluster[☸️ Active Cluster] -->|Scheduled Job| Velero[💾 Velero / Snapshot Backup]\n  Velero -->|Export| Storage[(🗄️ S3 / Cloud Bucket)]\n  Storage -->|Lifecycle Policy| Expiry[🕒 Retain 30 Days & Expire]\n  Storage -->|Disaster Recovery| Restore[🛠️ Restore Cluster Namespace]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  const provider = $('backup_provider').value;
  const target = $('backup_target').value;

  if (tabId === 'script') {
    if (provider === 'velero') {
      nameBox.value = 'velero_backup';
      extTag.textContent = '.yaml';
    } else if (provider === 'pg_dump') {
      nameBox.value = 'pg_backup';
      extTag.textContent = '.sh';
    } else {
      nameBox.value = 'aws_backup';
      extTag.textContent = '.tf';
    }
  } else if (tabId === 'retention') {
    if (target === 's3' || target === 'gcs') {
      nameBox.value = 'lifecycle_policy';
      extTag.textContent = '.json';
    } else {
      nameBox.value = 'local_cleanup';
      extTag.textContent = '.sh';
    }
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
  const provider = $('backup_provider').value;
  const target = $('backup_target').value;
  const zip = new JSZip();

  const scriptName = provider === 'velero' ? 'velero_backup.yaml' : (provider === 'pg_dump' ? 'pg_backup.sh' : 'aws_backup.tf');
  const policyName = (target === 's3' || target === 'gcs') ? 'lifecycle_policy.json' : 'local_cleanup.sh';
  
  zip.file(scriptName, compiledCode.script);
  zip.file(policyName, compiledCode.retention);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-dr-sre-${provider}.zip`;
    a.click();
    showToast('⬇️ Backup & DR SRE package downloaded!');
  });
}

function clearAllFields() {
  $('backup_provider').value = 'velero';
  $('backup_target').value = 's3';
  $('backup_retention').value = '30';
  $('backup_schedule').value = 'daily';

  switchTab('script');
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
  const provider = $('backup_provider').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'velero': [
      {
        title: 'Kubernetes Cluster Velero Backups',
        why: 'Enables volume snapshot and resources state archiving directly to cloud object storage vaults.',
        whyNot: 'Requires custom node scripting, which fails to capture Kubernetes resource definitions (PVs, PVCs, ConfigMaps).',
        runtime: 'Installs CRD schedules running inside the cluster.'
      }
    ],
    'pg_dump': [
      {
        title: 'Postgres SQL Database Dump Routines',
        why: 'Executes transaction-safe logical database snapshots and replicates them to cloud backup storage.',
        whyNot: 'Risk of database files corruption and lack of disaster recovery restore capabilities.',
        runtime: 'Runs a secure cron runner shell script locally.'
      }
    ],
    'aws_backup': [
      {
        title: 'AWS Backup Plan Automation',
        why: 'Centralizes server volumes and RDS databases backup policies via native KMS-encrypted vault plans.',
        whyNot: 'Requires custom scripting that lacks multi-region backup replication options.',
        runtime: 'Uses AWS API schedules.'
      }
    ]
  };

  const activeData = manualData[provider] || [];
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
  const provider = $('backup_provider').value;
  const target = $('backup_target').value;

  if (activeTab === 'script') {
    explanation = {
      'title': 'Backup Schedule Script',
      'filename': provider === 'velero' ? 'velero_backup.yaml' : (provider === 'pg_dump' ? 'pg_backup.sh' : 'aws_backup.tf'),
      'why': 'Specifies configuration and scheduling to initiate automated system backups.',
      'when': 'Scheduled continuously via system scheduler.',
      'where': 'Deploy directly into cluster, cron system, or terraform stacks.',
      'command': provider === 'velero' ? 'kubectl apply -f velero_backup.yaml' : (provider === 'pg_dump' ? 'bash pg_backup.sh' : 'terraform apply'),
      'practices': ['Test restore procedures regularly.', 'Verify backup storage access policies.'],
      'ai_mlops': 'Saves weights and model states checkpoints.',
      'flow': '[Backup Trigger Sequence]'
    };
  } else if (activeTab === 'retention') {
    explanation = {
      'title': 'Storage Lifecycle Policies',
      'filename': (target === 's3' || target === 'gcs') ? 'lifecycle_policy.json' : 'local_cleanup.sh',
      'why': 'Defines rules to transition old backups to colder storage classes or purge expired records to save costs.',
      'when': 'On setup of target backup buckets.',
      'where': 'Apply to object storage lifecycle settings.',
      'command': target === 's3' ? 'aws s3api put-bucket-lifecycle-configuration --bucket <BUCKET> --lifecycle-configuration file://lifecycle_policy.json' : (target === 'gcs' ? 'gsutil lifecycle set lifecycle_policy.json gs://<BUCKET>' : 'bash local_cleanup.sh'),
      'practices': ['Enforce minimum retention laws requirements.', 'Monitor storage class change events.'],
      'ai_mlops': 'Purges old training checkpoints.',
      'flow': '[Apply lifecycle retention configurations]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Package Setup Guide',
      'filename': 'README.md',
      'why': 'Lists directory details, dependencies, and settings for backup client.',
      'when': 'Prior to setting up backup schedules.',
      'where': 'Save in SRE root folders.',
      'command': '# Open in markdown viewer',
      'practices': ['Include details of KMS encryption keys.'],
      'ai_mlops': 'Setup guide context.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Disaster Recovery Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Step-by-step restoration playbook to execute recovery under system outage conditions.',
      'when': 'Triggered on database corruption or system failures.',
      'where': 'Store in wiki page or operations room.',
      'command': '# Refer to restore commands within the document',
      'practices': ['Perform monthly dry-runs recovery simulations.', 'Track metrics of time to recover (MTTR).'],
      'ai_mlops': 'Used by self-healing agents to restore broken services.',
      'flow': '[System Failure] ➔ [Fetch Snapshots] ➔ [Apply Restore commands]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Replication & Recovery Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram of recovery and backup stages.',
      'when': 'During SRE design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all network endpoints dependencies.'],
      'ai_mlops': 'Validation blueprint.',
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
