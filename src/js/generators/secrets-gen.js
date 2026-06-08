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
  let chart = 'graph TD\n  App[🚀 Application container] -->|Dynamic request| Fetch[⚙️ fetch_secrets.py]\n  Fetch -->|Authenticate| Vault[🔐 HashiCorp Vault / AWS Secrets Manager]\n  Vault -->|Decrypt keys| Decrypted[(🔑 Decrypted Database Creds)]\n  Decrypted -->|Inject| Process[⚙️ Running App memory]';
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
  } else if (tabId === 'scanner') {
    nameBox.value = 'secret_scanner_audit';
    extTag.textContent = '.log';
  }
  updateViewportContent();
}

function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');
    $('scanner-viewport').classList.add('hidden');
    
    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';
    
    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
    }
  } else if (activeTab === 'scanner') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.add('hidden');
    $('scanner-viewport').classList.remove('hidden');
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('scanner-viewport').classList.add('hidden');
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
  } else if (activeTab === 'scanner') {
    explanation = {
      'title': 'Secret Scanner Audit Report',
      'filename': 'secret_scanner_audit.log',
      'why': 'Scans input configs and code client-side to detect plaintext credential leaks before commit.',
      'when': 'Run before checking in configuration manifests to git repositories.',
      'where': 'Deploy as git pre-commit hooks or local SRE check scripts.',
      'command': 'trivy fs --security-checks secret .',
      'practices': ['Enforce scanning in all pre-commit hooks.', 'Rotate leaked credentials immediately.'],
      'ai_mlops': 'Automated SRE agent scans source directories for API access token anomalies.',
      'flow': '[Input Code] ➔ [Regex Signature Check] ➔ [Flag Violations] ➔ [Block Commit]'
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

const SCAN_RULES = [
  {
    name: 'AWS Access Key ID',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    description: 'AWS access key identifiers expose cloud resources to unauthorized orchestration.',
    remediation: 'Use AWS Secrets Manager JSON policies or HashiCorp Vault dynamic database roles.'
  },
  {
    name: 'AWS Secret Access Key',
    regex: /(?:secret|access|key|token)[a-zA-Z0-9_\-]*?\s*=\s*['"]([A-Za-z0-9/+=]{40})['"]/gi,
    severity: 'CRITICAL',
    description: 'AWS secret access keys are high-privilege credentials that should never be in plain-text code.',
    remediation: 'Inject via environment variables or mount dynamically with K8s SecretProviderClass.'
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'CRITICAL',
    description: 'GitHub Personal Access Tokens grant repository read/write capabilities.',
    remediation: 'Switch to temporary GitHub Actions repository tokens or retrieve via Vault GitHub engine.'
  },
  {
    name: 'Private Encryption Key',
    regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    description: 'Private RSA/ECC cryptographic keys permit identity decryption and TLS interception.',
    remediation: 'Use Kubernetes SealedSecrets to encrypt keys, decrypting them only inside pod RAM memory.'
  },
  {
    name: 'Database Connection String',
    regex: /(?:postgresql|mongodb(?:\+srv)?|mysql|redis):\/\/[a-zA-Z0-9_]+:[^@\s]+@[a-zA-Z0-9_\-\.]+(?::\d+)?\/[a-zA-Z0-9_\-]+/gi,
    severity: 'CRITICAL',
    description: 'Plain-text database connection URLs expose usernames, passwords, hostnames, and tables.',
    remediation: 'Store credentials dynamically in Vault paths and fetch them using Python/Go SDK clients.'
  },
  {
    name: 'Slack Incoming Webhook',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9_]{7,12}\/B[A-Z0-9_]{7,12}\/[A-Za-z0-9_]{15,36}/g,
    severity: 'HIGH',
    description: 'Slack incoming webhook URLs allow unauthorized message broadcasting and alert spoofing.',
    remediation: 'Externalize slack notifications URL parameter into environment configurations.'
  },
  {
    name: 'Plain-text Password Configuration',
    regex: /(?:password|passwd|pass|admin_pass)\s*:\s*['"]?([^'"]{4,})['"]?/gi,
    severity: 'HIGH',
    description: 'Cleartext hardcoded passwords detected in YAML/JSON configs.',
    remediation: 'Encrypt credentials using Sealed Secrets or use Kubernetes CSI Secrets Store.'
  }
];

const SAMPLES = {
  aws: `# AWS config.py\nAWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"\nAWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"\nBUCKET_NAME = "prod-data-lake"\n`,
  k8s: `apiVersion: v1\nkind: Secret\nmetadata:\n  name: database-credentials\ntype: Opaque\ndata:\n  password: supersecretpassword123\n  api_token: "ghp_1234567890abcdefghijklmnopqrstuvwxyz"\n`,
  slack: `const config = {\n  databaseUrl: "postgresql://postgres:admin123@db.prod.talaripradeep.info:5432/main",\n  slackWebhook: "https://hooks.slack.com/services/T_MOCK_ID/B_MOCK_BOT/MOCK_SECRET_TOKEN",\n  privateKey: "-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA0Y3...\\n-----END RSA PRIVATE KEY-----"\n};\n`
};

function loadScannerSample(type) {
  const input = $('scanner-input');
  if (type === 'clear') {
    input.value = '';
    showToast('🗑️ Input cleared!');
  } else if (SAMPLES[type]) {
    input.value = SAMPLES[type];
    showToast(`📝 Loaded ${type.toUpperCase()} credentials template!`);
  }
}

function runSecretScan() {
  const codeText = $('scanner-input').value.trim();
  if (!codeText) {
    showToast('⚠️ Input container is empty! Please paste code or configurations.');
    return;
  }

  const progressContainer = $('scan-progress-container');
  const progressBar = $('scan-progress-bar');
  const progressLabel = $('scan-progress-label');
  const resultsContainer = $('scan-results-container');

  progressContainer.classList.remove('hidden');
  resultsContainer.classList.add('hidden');
  progressBar.style.width = '0%';
  progressLabel.textContent = 'Parsing input buffers...';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 25;
    progressBar.style.width = progress + '%';
    
    if (progress === 25) {
      progressLabel.textContent = 'Running pattern regex signature scans...';
    } else if (progress === 75) {
      progressLabel.textContent = 'Analyzing credential risk vectors...';
    } else if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressContainer.classList.add('hidden');
        displayScanResults(codeText);
      }, 200);
    }
  }, 150);
}

function displayScanResults(codeText) {
  const lines = codeText.split('\n');
  const findings = [];
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    SCAN_RULES.forEach(rule => {
      const regex = new RegExp(rule.regex.source, 'i');
      const match = regex.exec(line);
      if (match) {
        const matchedValue = match[0];
        const masked = matchedValue.length > 8 ? 
          matchedValue.substring(0, 4) + '...' + matchedValue.substring(matchedValue.length - 4) : 
          '********';
        const maskedLine = line.replace(matchedValue, masked);

        findings.push({
          line: lineNum,
          ruleName: rule.name,
          severity: rule.severity,
          description: rule.description,
          remediation: rule.remediation,
          lineContent: maskedLine
        });
      }
    });
  });

  const resultsContainer = $('scan-results-container');
  resultsContainer.classList.remove('hidden');

  const statusBadge = $('scanner-status-badge');
  const totalCount = $('scanner-stat-total');
  const critCount = $('scanner-stat-crit');
  const highCount = $('scanner-stat-high');
  const linesCount = $('scanner-stat-lines');
  const findingsList = $('scan-findings-list');

  linesCount.textContent = lines.length;
  totalCount.textContent = findings.length;

  const criticals = findings.filter(f => f.severity === 'CRITICAL').length;
  const highs = findings.filter(f => f.severity === 'HIGH').length;

  critCount.textContent = criticals;
  highCount.textContent = highs;

  if (findings.length > 0) {
    statusBadge.className = 'px-3 py-1 text-xs font-mono rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse';
    statusBadge.textContent = 'FAIL - DANGER DETECTED';
  } else {
    statusBadge.className = 'px-3 py-1 text-xs font-mono rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    statusBadge.textContent = 'PASS - SECURE SECRETS';
  }

  findingsList.innerHTML = '';
  if (findings.length === 0) {
    findingsList.innerHTML = `
      <div class="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
        🎉 No hardcoded credentials detected in the scanned text. Good job keeping configurations clean!
      </div>
    `;
    return;
  }

  findings.forEach(finding => {
    const card = document.createElement('div');
    card.className = 'bg-slate-900/60 border border-slate-800/80 p-3 rounded-lg flex flex-col gap-2 transition hover:border-slate-700/80';
    
    const severityBadge = finding.severity === 'CRITICAL' ? 
      `<span class="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded">CRITICAL</span>` :
      `<span class="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-800/50 rounded">HIGH</span>`;

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          ${severityBadge}
          <span class="text-xs font-bold text-white">${finding.ruleName}</span>
        </div>
        <span class="text-[10px] text-slate-500 font-mono">Line ${finding.line}</span>
      </div>
      <p class="text-[11px] text-slate-400 leading-normal">${finding.description}</p>
      <div class="bg-slate-950 p-2 rounded border border-slate-850 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre">
        <code>${finding.lineContent.trim()}</code>
      </div>
      <div class="text-[11px] text-indigo-400 flex items-start gap-1">
        <span class="mt-0.5">💡</span>
        <span><strong>Remediation:</strong> ${finding.remediation}</span>
      </div>
    `;
    findingsList.appendChild(card);
  });
}

window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
window.closeExplanationDrawer = closeExplanationDrawer;
window.loadScannerSample = loadScannerSample;
window.runSecretScan = runSecretScan;
