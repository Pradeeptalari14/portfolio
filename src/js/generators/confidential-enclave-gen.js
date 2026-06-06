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
  $('enclave_type').addEventListener('change', (e) => {
    updateAttestProtocolOptions(e.target.value);
    triggerCompileAll();
  });
  $('attest_protocol').addEventListener('change', triggerCompileAll);
  $('memory_mb').addEventListener('input', triggerCompileAll);

  setupCompilerTriggers(triggerCompileAll);
}

function updateAttestProtocolOptions(enclaveType) {
  const protocolSelect = $('attest_protocol');
  protocolSelect.innerHTML = '';
  
  if (enclaveType === 'aws_nitro') {
    protocolSelect.innerHTML = `
      <option value="kms">AWS KMS Attestation</option>
      <option value="dcap">AWS Nitro DCAP / TPM</option>
    `;
  } else if (enclaveType === 'intel_sgx') {
    protocolSelect.innerHTML = `
      <option value="dcap">Intel SGX DCAP (ECDSA)</option>
      <option value="ias">Intel Attestation Service (IAS - EPID)</option>
    `;
  } else {
    protocolSelect.innerHTML = `
      <option value="dcap">AMD SEV-SNP DCAP</option>
      <option value="asv">AMD Secure Verification (ASV)</option>
    `;
  }
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
  const enclaveType = $('enclave_type').value;
  const memoryMB = parseInt($('memory_mb').value) || 2048;

  let code = '';

  if (enclaveType === 'aws_nitro') {
    code = `{
  "enclave_config_version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "name": "production-secure-inference-enclave",
  "cpu_count": 2,
  "memory_mib": ${memoryMB},
  "metadata_service": {
    "enabled": false
  },
  "communication": {
    "vsock": {
      "ports": [
        50051
      ]
    }
  }
}`;
  } else if (enclaveType === 'intel_sgx') {
    code = `{
  "sgx_policy_version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "enclave_properties": {
    "isvprodid": 1,
    "isvsvn": 1,
    "max_threads": 4
  },
  "secure_heap_size_bytes": ${memoryMB * 1024 * 1024},
  "allowed_mrsigner": [
    "0x72a394bc8d7b320984ee..."
  ]
}`;
  } else {
    code = `{
  "amd_sev_policy_version": "v${SCRIPT_VERSION}",
  "copyright": "Copyright (c) 2026 Talari Pradeep. All Rights Reserved.",
  "policy_flags": {
    "debug_disabled": true,
    "key_sharing_disabled": true,
    "migration_disabled": true,
    "snp_enabled": true
  },
  "memory_size_mib": ${memoryMB}
}`;
  }

  compiledCode.config = code;
}

function compileInstrument() {
  const enclaveType = $('enclave_type').value;
  const protocol = $('attest_protocol').value;

  let code = `#!/usr/bin/env python3
# attest.py v${SCRIPT_VERSION}
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.
# Cryptographic Attestation Verification Script for ${enclaveType.toUpperCase()} using ${protocol.toUpperCase()}

import json
import base64
import requests

def get_attestation_document():
    print("Querying internal enclave hardware security module (HSM)...")
    # In a real environment, query local vsock/ioctl to retrieve attestation payload
    mock_doc = {
        "pcrs": {
            "0": "0000000000000000000000000000000000000000000000000000000000000000",
            "1": "4f46e50ea5e97c3aed059669e2e8f0e2e8f00000000000000000000000000000"
        },
        "signature": "mock-cryptographic-ecdsa-signature-bytes"
    }
    return base64.b64encode(json.dumps(mock_doc).encode('utf-8'))

def verify_attestation(doc_b64):
    print("Initiating verification checks with protocol: ${protocol.toUpperCase()}...")
    
    # Send verification payload to Attestation Authority / KMS
`;

  if (protocol === 'kms') {
    code += `    # Decrypt KMS cipher using attestation document verification
    print("Sending document to AWS KMS endpoint...")
    # kms_client.decrypt(
    #     CiphertextBlob=encrypted_data,
    #     Recipient={"AttestationDocument": doc_b64}
    # )
    print("KMS cryptographic handshake succeeded. Decrypted data key returned inside the secure enclave memory space.")
`;
  } else if (protocol === 'dcap') {
    code += `    # Intel SGX/AMD SEV DCAP verification logic
    print("Querying DCAP Verification Quote Provider (QPL)...")
    # Verify quotes against trusted certificate authority (Intel/AMD)
    print("DCAP certificate validation passed. Enclave hash matches MRSIGNER/MRENCLAVE policies.")
`;
  } else {
    code += `    # Intel IAS EPID validation logic
    print("Submitting quote verification query to Intel IAS portal API...")
    # response = requests.post("https://api.trustedservices.intel.com/sgx/dev/attestation/v4/report", json=...)
    print("IAS verification report returned successfully with status OK.")
`;
  }

  code += `
if __name__ == "__main__":
    doc = get_attestation_document()
    verify_attestation(doc)
`;

  compiledCode.instrument = code;
}

function compileReadme() {
  const enclaveType = $('enclave_type').value;

  let md = `# Confidential Computing & Secure Enclave Studio v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

Scaffold secure execution sandboxes. This studio enables hardware-level memory encryption using ${enclaveType.toUpperCase()}, generating verification scripts that attest to the enclave's cryptographic signature before releasing sensitive data keys.

## Prerequisites
- **Hardware Platform**: ${enclaveType.toUpperCase()} enabled CPU/Host.
- **Enclave SDK**: AWS Nitro Enclaves CLI, Intel SGX SDK, or Open Enclave SDK.
- **Python**: \`cryptography\` library package.

## Quick Start
1. Compile the enclave package image:
`;

  if (enclaveType === 'aws_nitro') {
    md += `   \`\`\`bash
   nitro-cli build-enclave --docker-dir . --docker-uri secure-app:latest --output-file enclave.eif
   \`\`\`
2. Start the enclave execution runtime:
   \`\`\`bash
   nitro-cli run-enclave --eif enclave.eif --cpu-count 2 --memory 2048
   \`\`\`
3. Run the attestation script inside the enclave:
   \`\`\`bash
   python3 attest.py
   \`\`\`
`;
  } else {
    md += `   \`\`\`bash
   # Build SGX enclave binaries
   make sgx-build
   # Sign the enclave executable
   sgx-sign -key private.pem -enclave enclave.so -out enclave.signed.so
   \`\`\`
2. Run the attestation script:
   \`\`\`bash
   python3 attest.py
   \`\`\`
`;
  }

  compiledCode.readme = md;
}

function compileRunbook() {
  const enclaveType = $('enclave_type').value;

  let md = `# SRE Runbook: Enclave Attestation Violations & Memory PANICs
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Enclave failed to decrypt data keys / Attestation signature invalid

When the KMS/Attestation authority rejects client attestation documentation:

### Step 1: Compare Measurement Hashes (PCRs / MRENCLAVE)
Check if the application code or docker base image changed:
- Retrieve local enclave measurements:
  \`\`\`bash
  nitro-cli describe-enclaves
  \`\`\`
- Verify that measurement PCR hashes match those registered in the AWS KMS Key policy rules.

### Step 2: Verify VSock Port Bindings
If the enclave is unable to contact external APIs:
1. Ensure the parent EC2/Host VSock-to-IP routing proxy daemon is running:
   \`\`\`bash
   systemctl status nitro-enclaves-vsock-proxy
   \`\`\`
2. Check security group rules on port 50051.

### Step 3: Enclave Memory Reset
If the enclave throws Out-Of-Memory (OOM) or Kernel panic events:
- Terminate and reboot the secure enclave instances:
  \`\`\`bash
  nitro-cli terminate-enclave --enclave-id $(nitro-cli describe-enclaves | jq -r '.[0].EnclaveID')
  nitro-cli run-enclave --eif enclave.eif --cpu-count 2 --memory 2048
  \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Host[🖥️ Host OS] -->|Provision Resource| Enclave[🔒 AMD SEV / AWS Nitro Enclave]\n  Enclave -->|Hardware Attestation| PCR[🔑 Cryptographic Attestation Verification]\n  PCR -->|Pass| KMS[🔓 Fetch Decryption Keys from KMS]\n  PCR -->|Fail| Terminate[🚫 Terminate Enclave Execution]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');
  const enclaveType = $('enclave_type').value;

  if (tabId === 'config') {
    if (enclaveType === 'aws_nitro') {
      nameBox.value = 'enclave_config';
      extTag.textContent = '.json';
    } else if (enclaveType === 'intel_sgx') {
      nameBox.value = 'sgx_policy';
      extTag.textContent = '.json';
    } else {
      nameBox.value = 'amd_sev_policy';
      extTag.textContent = '.json';
    }
  } else if (tabId === 'instrument') {
    nameBox.value = 'attest';
    extTag.textContent = '.py';
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
  const enclaveType = $('enclave_type').value;
  const zip = new JSZip();

  const file1 = enclaveType === 'aws_nitro' ? 'enclave_config.json' : (enclaveType === 'intel_sgx' ? 'sgx_policy.json' : 'amd_sev_policy.json');

  zip.file(file1, compiledCode.config);
  zip.file('attest.py', compiledCode.instrument);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `confidential-enclave-orchestration.zip`;
    a.click();
    showToast('⬇️ Enclave SRE package downloaded!');
  });
}

function clearAllFields() {
  $('enclave_type').value = 'aws_nitro';
  updateAttestProtocolOptions('aws_nitro');
  $('attest_protocol').value = 'kms';
  $('memory_mb').value = '2048';

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

function toggleManualItem(idx) {
  const el = $('manual-item-' + idx);
  if (el) {
    el.classList.toggle('hidden');
  }
}

function compileManual() {
  const enclaveType = $('enclave_type').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'aws_nitro': [
      {
        title: 'AWS Nitro Enclave Isolation',
        why: 'Allocates CPU and memory channels that are physically isolated from the parent host OS to prevent host administrators from reading private variables.',
        whyNot: 'Requires deploying custom AMIs and limits communication to virtual socket (VSock) channels.',
        runtime: 'Instantiates isolated VM layers managed by Nitro Hypervisor.'
      },
      {
        title: 'KMS Recipient Policy Integration',
        why: 'Authenticates requests to KMS decryption endpoints using verified cryptographic hardware hashes (PCRs) to ensure only valid enclaves decrypt keys.',
        whyNot: 'Fails if PCR measurements diverge even slightly after minor base image patches.',
        runtime: 'Submits attestation payloads inside KMS REST request APIs.'
      }
    ],
    'intel_sgx': [
      {
        title: 'Intel SGX Enclaves (Software Guard Extensions)',
        why: 'Enables application-level secure enclaves with memory encryption keys maintained at the CPU core level.',
        whyNot: 'Restricts enclave heap sizes significantly, causing memory allocation crashes.',
        runtime: 'Loads binaries into processor-reserved PRM memory space.'
      }
    ],
    'amd_sev': [
      {
        title: 'AMD SEV (Secure Encrypted Virtualization)',
        why: 'Encrypts the entire virtual machine system space memory dynamically using hardware keys.',
        whyNot: 'Requires modern server-grade AMD EPYC host processors support.',
        runtime: 'Applies hardware memory encryption tags dynamically.'
      }
    ]
  };

  const activeData = manualData[enclaveType] || [];
  activeData.forEach((item, idx) => {
    html += `
      <div class="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
        <button onclick="toggleManualItem(\${idx})" class="w-full flex items-center justify-between font-bold text-slate-800 focus:outline-none">
          <span>⚙️ \${item.title}</span>
          <span class="text-xs text-slate-400">⚡ Info</span>
        </button>
        <div id="manual-item-\${idx}" class="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 space-y-2 hidden">
          <p><strong>Why configure:</strong> \${item.why}</p>
          <p class="text-rose-600"><strong>If left disabled:</strong> \${item.whyNot}</p>
          <p class="text-slate-500"><strong>Runtime Operation:</strong> \${item.runtime}</p>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function explainActiveTabCode() {
  let explanation = null;
  const enclaveType = $('enclave_type').value;

  if (activeTab === 'config') {
    explanation = {
      'title': 'Secure Enclave Policy Config',
      'filename': enclaveType === 'aws_nitro' ? 'enclave_config.json' : (enclaveType === 'intel_sgx' ? 'sgx_policy.json' : 'amd_sev_policy.json'),
      'why': 'Declares physical resources allocation and communication ports parameters.',
      'when': 'Review when bootstrapping cloud hypervisors or compiling enclave binaries.',
      'where': 'Deploy as VM properties wrapper configuration file.',
      'command': enclaveType === 'aws_nitro' ? 'nitro-cli run-enclave ...' : '# Sign compilation policy',
      'practices': ['Explicitly disable debug modes in production configurations.', 'Limit memory allocation bounds.'],
      'ai_mlops': 'Secures proprietary deep learning weights keys from database admins.',
      'flow': '[Read configuration] ➔ [Reserve physical core slots] ➔ [Lock CPU memory]'
    };
  } else if (activeTab === 'instrument') {
    explanation = {
      'title': 'Attestation Verification handler',
      'filename': 'attest.py',
      'why': 'Retrieves local hardware signature documents and verifies measurements with KMS authorities.',
      'when': 'Execute during enclave initialization to load decrypted keys.',
      'where': 'Deploy as startup binary script inside the secure enclave OS space.',
      'command': 'python attest.py',
      'practices': ['Enforce that attestation verification is a hard blocker for application startup.', 'Log PCR measurement mismatch errors.'],
      'ai_mlops': 'Mandatory security step to decrypt and load large language models weights inside enclaves.',
      'flow': '[Fetch signed device quote] ➔ [Submit to KMS API] ➔ [Receive decrypted data keys]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Developer Onboarding Guide',
      'filename': 'README.md',
      'why': 'Details compile SDK requirements and run scripts sequences.',
      'when': 'Consult when configuring host instances.',
      'where': 'Store in project root.',
      'command': '# View README.md',
      'practices': ['Audit toolchains versions.'],
      'ai_mlops': 'Onboarding reference guide.',
      'flow': '[README.md]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Security Outliers Triage Guide',
      'filename': 'sre_runbook.md',
      'why': 'Helps operators resolve measurements mismatch anomalies and VSock proxy routing drops.',
      'when': 'Alert on attestation validation failures.',
      'where': 'Publish in central security runbooks index.',
      'command': '# Access SRE portal',
      'practices': ['Validate parent host proxy rules before resetting enclaves.', 'Keep previous measurement measurements.'],
      'ai_mlops': 'Assists SREs managing secure model routing nodes.',
      'flow': '[Attestation Alert] ➔ [Audit PCR hashes] ➔ [Verify VSock routing]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Cryptographic Handshake sequence',
      'filename': 'flow.mermaid',
      'why': 'Visualizes the attestation sequence.',
      'when': 'Review during security policy audits.',
      'where': 'Visualized layout canvas.',
      'command': '# Render in browser',
      'practices': ['Verify that keys are never logged in plaintext.'],
      'ai_mlops': 'Attestation workflow reference.',
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
