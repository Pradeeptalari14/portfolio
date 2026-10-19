// Vault Secrets Studio logic

const SCRIPT_VERSION = "1.0.0";

function initVaultStudio() {
  const elements = {
    engineType: document.getElementById('secret_engine_type'),
    ttl: document.getElementById('default_ttl'),
    k8sRole: document.getElementById('kubernetes_role'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    btnIssue: document.getElementById('btn_issue_creds'),
    btnRevoke: document.getElementById('btn_revoke_creds'),
    leaseList: document.getElementById('lease-list-body'),
    simStatus: document.getElementById('sim-status-val'),
  };

  let activeTab = 'policy';
  let leases = [];
  let timerInterval = null;

  function generateVaultPolicyHcl() {
    const role = elements.k8sRole ? elements.k8sRole.value : 'app-role-binding';
    const engine = elements.engineType ? elements.engineType.value : 'db-dynamic';

    let hcl = `# Vault Access Policy - Compiled v${SCRIPT_VERSION}
# Permissions for authentication role: ${role}

path "auth/token/lookup" {
  capabilities = ["read"]
}
`;

    if (engine === 'db-dynamic') {
      hcl += `
# Allow reading dynamic db user credentials
path "database/creds/app-db-role" {
  capabilities = ["read"]
}
`;
    } else if (engine === 'pki-ca') {
      hcl += `
# Allow issuing certificates from PKI engine
path "pki/issue/app-cert-issuer" {
  capabilities = ["create", "update"]
}
`;
    } else if (engine === 'kv-v2') {
      hcl += `
# Read/write access to KV app config secret paths
path "secret/data/production/app-config" {
  capabilities = ["create", "read", "update", "patch"]
}
`;
    }

    return hcl;
  }

  function generateVaultEngineConfig() {
    const engine = elements.engineType ? elements.engineType.value : 'db-dynamic';
    const ttlVal = elements.ttl ? elements.ttl.value : '1h';

    if (engine === 'db-dynamic') {
      return JSON.stringify({
        plugin_name: "postgresql-database-plugin",
        allowed_roles: ["app-db-role"],
        connection_url: "postgresql://{{username}}:{{password}}@postgres.production:5432/appdb",
        default_ttl: ttlVal,
        max_ttl: "24h"
      }, null, 2);
    } else if (engine === 'pki-ca') {
      return JSON.stringify({
        common_name: "internal.cluster.local",
        ttl: ttlVal,
        key_type: "rsa",
        key_bits: 2048,
        exclude_cn_from_sans: true
      }, null, 2);
    } else {
      return JSON.stringify({
        options: {
          max_versions: 5,
          cas_required: false
        },
        default_ttl: ttlVal
      }, null, 2);
    }
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'policy') {
      elements.outputBox.textContent = generateVaultPolicyHcl();
      if (elements.downloadInput) elements.downloadInput.value = 'vault-policy.hcl';
    } else if (activeTab === 'config') {
      elements.outputBox.textContent = generateVaultEngineConfig();
      if (elements.downloadInput) elements.downloadInput.value = 'engine-config.json';
    }
  }

  function renderLeases() {
    if (!elements.leaseList) return;

    if (leases.length === 0) {
      elements.leaseList.innerHTML = `
        <div class="text-slate-500 text-[8px] text-center py-10">
          No active leases. Click 'Generate dynamic credential' to request ephemeral secrets tokens.
        </div>
      `;
      if (elements.simStatus) {
        elements.simStatus.textContent = 'IDLE';
        elements.simStatus.className = 'text-[9px] font-bold text-slate-500 font-mono';
      }
      return;
    }

    if (elements.simStatus) {
      elements.simStatus.textContent = `${leases.length} LEASES ACTIVE`;
      elements.simStatus.className = 'text-[9px] font-bold text-rose-500 font-mono';
    }

    elements.leaseList.innerHTML = '';
    leases.forEach(lease => {
      const pct = Math.max(0, (lease.remaining / lease.total) * 100);
      const row = document.createElement('div');
      row.className = 'bg-slate-950 border border-rose-500/20 p-2 rounded flex flex-col gap-1 text-[8px]';
      row.innerHTML = `
        <div class="flex justify-between font-bold text-slate-200">
          <span class="truncate w-2/3">${lease.name}</span>
          <span class="text-rose-400">${lease.remaining}s left</span>
        </div>
        <div class="text-[7px] text-slate-500 truncate">Lease ID: ${lease.id}</div>
        <div class="w-full bg-slate-800 h-1 rounded overflow-hidden mt-1">
          <div class="bg-rose-500 h-full transition-all duration-1000" style="width: ${pct}%"></div>
        </div>
      `;
      elements.leaseList.appendChild(row);
    });
  }

  function startLeaseTicker() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      let changed = false;
      leases.forEach(lease => {
        if (lease.remaining > 0) {
          lease.remaining--;
          changed = true;
        }
      });

      // Filter out expired leases
      const initialCount = leases.length;
      leases = leases.filter(l => l.remaining > 0);
      if (leases.length !== initialCount) changed = true;

      if (changed) {
        renderLeases();
      }
    }, 1000);
  }

  function generateDynamicCredential() {
    const engine = elements.engineType ? elements.engineType.value : 'db-dynamic';
    const ttlStr = elements.ttl ? elements.ttl.value : '5m';

    let totalSecs = 300; // default 5m
    if (ttlStr === '1h') totalSecs = 3600;
    if (ttlStr === '24h') totalSecs = 86400;

    const leaseId = `db/creds/app-db-role/lease-${Math.random().toString(36).substring(2, 10)}`;
    let name = "vault-token-client";

    if (engine === 'db-dynamic') {
      name = `db-user-${Math.random().toString(36).substring(2, 7)}`;
    } else if (engine === 'pki-ca') {
      name = `tls-cert-internal-${Math.random().toString(36).substring(2, 5)}.pem`;
    } else {
      name = `kv-secret-payload`;
    }

    leases.push({
      id: leaseId,
      name: name,
      remaining: totalSecs,
      total: totalSecs
    });

    renderLeases();
    startLeaseTicker();
  }

  function revokeAllLeases() {
    leases = [];
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    renderLeases();
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['policy', 'config', 'simulator'],
    'policy',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      if (tabName === 'simulator') {
        renderLeases();
      } else {
        updateOutput();
      }
    }
  );

  // Bind controls listeners
  [elements.engineType, elements.ttl, elements.k8sRole].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnIssue) elements.btnIssue.addEventListener('click', generateDynamicCredential);
  if (elements.btnRevoke) elements.btnRevoke.addEventListener('click', revokeAllLeases);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('secret_engine_type')) {
    initVaultStudio();
  }
});
window.initVaultStudio = initVaultStudio;
