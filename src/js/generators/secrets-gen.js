import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'policy';

let compiledCode = {
  policy: '',
  fetch: '',
  manifest: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('secrets_platform').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compilePolicy();
  compileFetch();
  compileManifest();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compilePolicy() {
  const platform = $('secrets_platform').value;
  const type = $('secrets_type').value;
  let code = '';

  if (platform === 'vault') {
    code = `# vault_policy.hcl v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# HashiCorp Vault access policy definition for SRE workloads

# Read-only access to application credentials
path "secret/data/production/app/*" {
  capabilities = ["read"]
}

# Write access to database configurations
path "secret/data/production/database/*" {
  capabilities = ["create", "read", "update"]
}

# Manage leasing policies and dynamic credentials
path "sys/leases/lookup" {
  capabilities = ["create", "update"]
}
`;
  } else if (platform === 'aws') {
    code = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SRESecretsAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:123456789012:secret:production/app/*"
    }
  ]
}`;
  } else {
    code = `# sealed_policy.yaml v${SCRIPT_VERSION}
# Sealed Secrets does not enforce server-side policies directly,
# it leverages standard Kubernetes RBAC controls.
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secrets-reader
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
`;
  }

  compiledCode.policy = code;
}

function compileFetch() {
  const platform = $('secrets_platform').value;
  const tokenExpiry = $('secrets_token_expiry').checked;
  const ipRestrict = $('secrets_ip_restriction').checked;

  let code = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# fetch_secrets.py v${SCRIPT_VERSION} - Secure Secret Retrieval Service
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("SecretFetcher")
`;

  if (platform === 'vault') {
    code += `import hvac

def fetch_runtime_secrets():
    vault_url = os.getenv("VAULT_ADDR", "https://vault.internal.net:8200")
    vault_token = os.getenv("VAULT_TOKEN")
    
    if not vault_token:
        logger.error("Missing VAULT_TOKEN environment variable!")
        sys.exit(1)
        
    client = hvac.Client(url=vault_url, token=vault_token)
    
    # Verify authentication state
    if not client.is_authenticated():
        logger.error("Vault authentication failed!")
        sys.exit(1)
        
    logger.info("Successfully authenticated with HashiCorp Vault")
    
    try:
        response = client.secrets.kv.v2.read_secret_version(
            path="production/app/database",
            mount_point="secret"
        )
        secrets = response['data']['data']
        logger.info("Successfully retrieved database secrets")
        return secrets
    except Exception as e:
        logger.error(f"Failed to fetch secrets: {e}")
        return None
`;
  } else if (platform === 'aws') {
    code += `import boto3
from botocore.exceptions import ClientError

def fetch_runtime_secrets():
    secret_name = "production/app/database"
    region_name = "us-east-1"
    
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        logger.info(f"Querying AWS Secrets Manager for: {secret_name}")
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        if 'SecretString' in get_secret_value_response:
            return get_secret_value_response['SecretString']
    except ClientError as e:
        logger.error(f"AWS Secret Value fetch failed: {e}")
        return None
`;
  } else {
    code += `def fetch_runtime_secrets():
    # Read secrets mounted from SealedSecret Kubernetes volumes
    secret_path = "/etc/secrets/database"
    if not os.path.exists(secret_path):
        logger.error(f"Secrets mount folder not found: {secret_path}")
        return None
        
    logger.info(f"Reading decapsulated secret bytes from: {secret_path}")
    try:
        with open(secret_path, 'r') as f:
            secrets = f.read()
        return secrets
    except Exception as e:
        logger.error(f"Read secrets file exception: {e}")
        return None
`;
  }

  code += `
if __name__ == "__main__":
    secrets = fetch_runtime_secrets()
    if secrets:
        print("✅ Secrets securely loaded in RAM memory!")
    else:
        print("❌ Secrets loading failed!")
`;

  compiledCode.fetch = code;
}

function compileManifest() {
  const platform = $('secrets_platform').value;
  let code = '';

  if (platform === 'sealed') {
    code = `apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: my-app-database-secret
  namespace: production
spec:
  encryptedData:
    database_password: AgA1234567890BCDEF... (sealed RSA payload)
`;
  } else if (platform === 'vault') {
    code = `apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: vault-db-credentials
  namespace: production
spec:
  provider: vault
  parameters:
    roleName: app-read-only
    vaultAddress: "https://vault.internal.net:8200"
    objects: |
      - objectName: "database_password"
        secretPath: "secret/data/production/app/database"
        secretKey: "password"
`;
  } else {
    code = `apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-db-credentials
  namespace: production
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "production/app/database"
        objectType: "secretsmanager"
        jmesPath:
          - path: "password"
            objectAlias: "database_password"
`;
  }

  compiledCode.manifest = code;
}

function compileReadme() {
  const platform = $('secrets_platform').value;
  let md = `# Secrets Management Integration v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This SRE package provides local policies, code SDKs, and Kubernetes manifests to deploy secure credentials.

## Setup Instructions

### Platform: ${platform.toUpperCase()}
1. Ensure credentials are authenticated with your provider server.
2. For local testing, configure environment variables:
   \`\`\`bash
   # For Vault
   export VAULT_ADDR="https://localhost:8200"
   # For AWS
   aws configure
   \`\`\`
3. Run the verification script:
   \`\`\`bash
   python fetch_secrets.py
   \`\`\`
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const platform = $('secrets_platform').value;
  const rotation = $('secrets_rotation').value;

  let md = `# SRE Runbook: Secret Leak and Rotation Procedures
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Secret / Credential Leakage Detected

Follow these remediation steps immediately if credentials appear in public logs or repositories:

### Step 1: Revoke Compromised Tokens
- For Vault:
  \`\`\`bash
  vault token revoke -mode=path secret/data/production/app/*
  \`\`\`
- For AWS:
  \`\`\`bash
  aws iam deactivate-mfa-device --user-name sre-app-user
  \`\`\`

### Step 2: Rotate Credentials
Trigger rotation process. Set up replacement keys within the configured schedule (**${rotation} days**).

### Step 3: Redistribute Credentials
Relaunch K8s deployments to pull updated Sealed Secrets / Secret Provider mappings.
`;
  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  const platform = $('secrets_platform').value;
  let chart = 'graph TD\n';

  if (platform === 'vault') {
    chart += `  App[App Pod] -->|1. Authenticate| Vault[Vault Server]\n`;
    chart += `  Vault -->|2. Check Policy| PolicyCheck{Capabilities Allowed?}\n`;
    chart += `  PolicyCheck -->|No| Fail[Return 403 Forbidden]\n`;
    chart += `  PolicyCheck -->|Yes| ReadSecret[3. Retrieve Encrypted KV Data]\n`;
    chart += `  ReadSecret --> Decrypt[4. Decrypt in Memory]\n`;
    chart += `  Decrypt --> App\n`;
  } else if (platform === 'aws') {
    chart += `  App[App Pod] -->|1. Assume IAM Role| AWSSTS[AWS Security Token Service]\n`;
    chart += `  AWSSTS -->|2. Retrieve Temp Credentials| App\n`;
    chart += `  App -->|3. GetSecretValue| ASM[AWS Secrets Manager]\n`;
    chart += `  ASM -->|4. Decrypt KMS Key| App\n`;
  } else {
    chart += `  Kubectl[Cluster Operator] -->|1. Seal Secret| Kubeseal[kubeseal CLI]\n`;
    chart += `  Kubeseal -->|2. Encrypt with PubKey| SealedManifest[SealedSecret Manifest]\n`;
    chart += `  SealedManifest -->|3. Deploy| K8s[K8s API Server]\n`;
    chart += `  K8s -->|4. Decrypt with PrivKey| Controller[SealedSecret Controller]\n`;
    chart += `  Controller -->|5. Populate Standard Secret| Pod[App Container]\n`;
  }

  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'policy') {
    nameBox.value = 'policy';
    const plat = $('secrets_platform').value;
    extTag.textContent = plat === 'vault' ? '.hcl' : (plat === 'aws' ? '.json' : '.yaml');
  } else if (tabId === 'fetch') {
    nameBox.value = 'fetch_secrets';
    extTag.textContent = '.py';
  } else if (tabId === 'manifest') {
    nameBox.value = 'secret_provider';
    extTag.textContent = '.yaml';
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
  const plat = $('secrets_platform').value;
  const zip = new JSZip();
  
  zip.file('policy' + (plat === 'vault' ? '.hcl' : (plat === 'aws' ? '.json' : '.yaml')), compiledCode.policy);
  zip.file('fetch_secrets.py', compiledCode.fetch);
  zip.file('secret_provider.yaml', compiledCode.manifest);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `secrets-sre-${plat}.zip`;
    a.click();
    showToast('⬇️ Secrets package downloaded!');
  });
}

function clearAllFields() {
  $('secrets_platform').value = 'vault';
  $('secrets_type').value = 'api_key';
  $('secrets_algo').value = 'aes';
  $('secrets_rotation').value = '30';
  $('secrets_token_expiry').checked = true;
  $('secrets_ip_restriction').checked = true;

  switchTab('policy');
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
  const platform = $('secrets_platform').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'vault': [
      {
        title: 'App Auth Token Policy Restriction',
        why: 'Limits application access to read-only paths inside Vault.',
        whyNot: 'Compromised apps could overwrite or delete configurations.',
        runtime: 'Enforced dynamically by Vault token capabilities check.'
      }
    ],
    'aws': [
      {
        title: 'SecretsManager IAM policy constraints',
        why: 'Enforces least-privilege IAM policies restricting decryption resources.',
        whyNot: 'Compromised instances could fetch secrets across the entire AWS account.',
        runtime: 'Validates policy attachments during AWS STS handshake.'
      }
    ],
    'sealed': [
      {
        title: 'Sealed Secret Custom Controller Resource',
        why: 'Allows checking in encrypted credentials to public Git repositories safely.',
        whyNot: 'Credentials in cleartext YAML files will leak into source control.',
        runtime: 'Controller decapsulates SealedSecret resource inside K8s cluster.'
      }
    ]
  };

  const activeData = manualData[platform] || [];
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

  if (activeTab === 'policy') {
    explanation = {
      'title': 'Secrets Credentials Access Policy',
      'filename': 'policy.hcl',
      'why': 'Limits application authorization scopes to least privilege pathways.',
      'when': 'Apply to Vault instances or AWS IAM roles during resource bootstrapping.',
      'where': 'Deploy in Vault UI or attach as IAM policies.',
      'command': 'vault policy write app-read policy.hcl',
      'practices': ['Pin paths down to app boundaries.', 'Avoid using wildcard capabilities.'],
      'ai_mlops': 'Used by SRE AI checkers to confirm RBAC security scopes.',
      'flow': '[Credential Access Policy Definition]'
    };
  } else if (activeTab === 'fetch') {
    explanation = {
      'title': 'Secure Secret Fetcher (Python)',
      'filename': 'fetch_secrets.py',
      'why': 'Fetches credential values dynamically from secure Vault or AWS backends directly into RAM memory.',
      'when': 'Execute at application start to populate runtime environment configs.',
      'where': 'Run as wrapper service process.',
      'command': 'python fetch_secrets.py',
      'practices': ['Do not persist secrets to disk.', 'Clean memory space post variables usage.'],
      'ai_mlops': 'Allows secure pipelines execution without static credential file leaks.',
      'flow': '[Fetch Request] ➔ [STS Auth Verification] ➔ [Fetch payload] ➔ [Load to RAM]'
    };
  } else if (activeTab === 'manifest') {
    explanation = {
      'title': 'Kubernetes Secret Provider Manifest',
      'filename': 'secret_provider.yaml',
      'why': 'Maps external vault/secrets managers volumes dynamically to pod namespaces.',
      'when': 'Deploy alongside application deployments manifest files.',
      'where': 'Deploy into K8s cluster namespace.',
      'command': 'kubectl apply -f secret_provider.yaml',
      'practices': ['Use dynamic mounting paths.', 'Restrict filesystem access to pod owners.'],
      'ai_mlops': 'Synchronizes secure external tokens into container pod spaces.',
      'flow': '[SecretProvider Manifest Configuration]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'ReadMe Integration Manual',
      'filename': 'README.md',
      'why': 'Installation checklists and commands to configure variables.',
      'when': 'Reference during staging setup tasks.',
      'where': 'Save in repository.',
      'command': '# Open in viewer',
      'practices': ['Maintain clear environmental check guidelines.'],
      'ai_mlops': 'Guides automation scripts through runtime configuration checklists.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Secret Leak Incident Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Operator playbook detailing key rotation procedures and revocation methods.',
      'when': 'Trigger when credentials compromise warnings pop up.',
      'where': 'Store in wiki.',
      'command': '# Open in viewer',
      'practices': ['Maintain clear severity matrices.', 'Link to webhook triggers.'],
      'ai_mlops': 'Guides SRE agents through dynamic secret rotations.',
      'flow': '[Leak Alert] ➔ [Revoke token] ➔ [Rotate credential] ➔ [Rolling restart]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Authentication Flowchart',
      'filename': 'flow.mermaid',
      'why': 'Maps target secret handshake steps.',
      'when': 'Consult during design audits.',
      'where': 'Dynamic render view.',
      'command': '# Render in browser',
      'practices': ['Map all security trust borders.'],
      'ai_mlops': 'Visual check logic for SRE agent code validations.',
      'flow': '[Mermaid Chart Canvas Flowchart]'
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
