import { setupCompilerTriggers } from '../utils/events.js';

const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

let activeTab = 'script';

let compiledCode = {
  script: '',
  scaffolder: '',
  readme: '',
  runbook: '',
  flow: ''
};

window.addEventListener('DOMContentLoaded', () => {
  setupInteractiveListeners();
  triggerCompileAll();
});

function setupInteractiveListeners() {
  $('idp_kind').addEventListener('change', function() {
    triggerCompileAll();
  });

  setupCompilerTriggers(triggerCompileAll);
}

function triggerCompileAll() {
  compileScript();
  compileScaffolder();
  compileReadme();
  compileRunbook();
  compileMermaidFlow();
  compileManual();
  updateViewportContent();
}

function compileScript() {
  const kind = $('idp_kind').value;
  const lang = $('idp_lang').value;
  const lifecycle = $('idp_lifecycle').value;
  const owner = $('idp_owner').value || 'sre-team';

  let code = `# catalog-info.yaml v${SCRIPT_VERSION} - Backstage Service Metadata
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: template-${lang}-${kind}
  description: "Automated template for ${lang} ${kind} application"
  annotations:
    backstage.io/techdocs-ref: dir:.
    prometheus.io/scrape: "true"
spec:
  type: ${kind}
  lifecycle: ${lifecycle}
  owner: ${owner}
  system: core-platform
`;

  compiledCode.script = code;
}

function compileScaffolder() {
  const kind = $('idp_kind').value;
  const lang = $('idp_lang').value;
  const owner = $('idp_owner').value || 'sre-team';

  let code = `# template.yaml v${SCRIPT_VERSION} - Backstage Software Scaffolder Template
# Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: scaffold-${lang}-${kind}
  title: Create a new ${lang.toUpperCase()} ${kind.toUpperCase()}
  description: Automatically provisions code repository, registers CI/CD pipelines, and deploys monitoring.
spec:
  owner: ${owner}
  type: service

  parameters:
    - title: Provide Service Details
      required:
        - name
        - owner
      properties:
        name:
          title: Service Name
          type: string
          description: Unique name of the new component.
        owner:
          title: Owner Group
          type: string
          default: ${owner}

  steps:
    - id: fetch-base
      name: Fetch Template Skeleton
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: \${{ parameters.name }}
          owner: \${{ parameters.owner }}
          lang: ${lang}

    - id: publish
      name: Publish to Github
      action: publish:github
      input:
        allowedHosts: ['github.com']
        description: \${{ parameters.name }} microservice
        repoUrl: github.com?repo=\${{ parameters.name }}&owner=company-devs

    - id: register
      name: Register in Developer Catalog
      action: catalog:register
      input:
        repoContentsUrl: \${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'
`;

  compiledCode.scaffolder = code;
}

function compileReadme() {
  const kind = $('idp_kind').value;
  const lang = $('idp_lang').value;

  let md = `# IDP Software Template Package v${SCRIPT_VERSION}
*Designed by Talari Pradeep*

This package provides standard Backstage catalog and software template scaffolding assets.

## Settings

- **Component Type**: ${kind.toUpperCase()}
- **Language Stack**: ${lang.toUpperCase()}
- **Owner Group**: ${$('idp_owner').value || 'sre-team'}

## Configuration Steps

1. Place \`catalog-info.yaml\` in the root of your code repository.
2. Register \`template.yaml\` inside your Backstage portal database instances.
3. Verify that the Backstage template steps execute properly during developer self-service runs.
`;
  compiledCode.readme = md;
}

function compileRunbook() {
  const owner = $('idp_owner').value || 'sre-team';

  let md = `# SRE Runbook: Backstage Catalog Sync Failures & Metadata Repairs
**Version**: \`v${SCRIPT_VERSION}\`

---

## 🚨 Incident Triage: Component fails to register or update in IDP portal

Follow this check playbook:

### Step 1: Verify Metadata Schema
Check \`catalog-info.yaml\` syntax validity:
- Ensure \`apiVersion\` matches backstage schema specs.
- Check that the \`owner\` field targets a valid backstage group (e.g. \`${owner}\`).
- Verify there are no duplicate component metadata names.

### Step 2: Validate Git Integration
Verify if Backstage catalog processors can read the target Git repository:
- Check that the Backstage GitHub App token has read permissions on `/catalog-info.yaml`.
- Run curl checks to target the raw file path:
  \`\`\`bash
  curl -s -H "Authorization: token $GITHUB_TOKEN" https://raw.githubusercontent.com/company-devs/service-repo/main/catalog-info.yaml
  \`\`\`

### Step 3: Trigger Force Registration
If automatic sync is stuck:
1. Access the Backstage Developer Portal admin dashboard.
2. Select "Register an existing component".
3. Paste the URL of `/catalog-info.yaml`.
4. Check the Backstage logs for validation errors:
   \`\`\`bash
   kubectl logs -f deployment/backstage-portal -n developer-portal
   \`\`\`
`;

  compiledCode.runbook = md;
}

function compileMermaidFlow() {
  let chart = 'graph TD\n  Catalog[📦 Backstage Software Catalog] -->|Scaffold template| IDP[⚙️ Developer Portal]\n  IDP -->|Trigger Repository| Git[🐱 Generate GitHub Repo]\n  Git -->|Configure Pipeline| CI[🏭 Bootstrap CI/CD Actions]\n  CI -->|Deploy Starter| Cluster[☸️ Kubernetes Deployment]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
  activeTab = tabId;
  $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
  $('tab-' + tabId).classList.add('active');

  const nameBox = $('download-name-input');
  const extTag = $('file-extension-tag');

  if (tabId === 'script') {
    nameBox.value = 'catalog-info';
    extTag.textContent = '.yaml';
  } else if (tabId === 'scaffolder') {
    nameBox.value = 'template';
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
  const zip = new JSZip();
  
  zip.file('catalog-info.yaml', compiledCode.script);
  zip.file('template.yaml', compiledCode.scaffolder);
  zip.file('README.md', compiledCode.readme);
  zip.file('sre_runbook.md', compiledCode.runbook);

  zip.generateAsync({ type: 'blob' }).then(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `idp-template-sre.zip`;
    a.click();
    showToast('⬇️ IDP Template SRE package downloaded!');
  });
}

function clearAllFields() {
  $('idp_kind').value = 'microservice';
  $('idp_lang').value = 'python';
  $('idp_lifecycle').value = 'experimental';
  $('idp_owner').value = 'sre-team';

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
  const kind = $('idp_kind').value;
  const container = $('sre-manual-accordion');
  if (!container) return;

  let html = '';

  const manualData = {
    'microservice': [
      {
        title: 'Microservices Metadata Scaffolding',
        why: 'Enables automatic code catalog indexing, and binds operational ownership records.',
        whyNot: 'Creates orphan components, making it impossible to identify which team to page during incidents.',
        runtime: 'Registers metadata inside Backstage catalog database.'
      }
    ],
    'frontend': [
      {
        title: 'Frontend Components Metadata Tracking',
        why: 'Binds public interfaces specs and monitors consumer bundle sizes.',
        whyNot: 'Hinders product security audits and lacks clear service owner paths.',
        runtime: 'Defines frontend portal entities.'
      }
    ],
    'library': [
      {
        title: 'Shared Library Versions Registry',
        why: 'Registers shared dependencies assets to notify downstream applications on critical CVE updates.',
        whyNot: 'Creates security gaps where developers run outdated dependencies with known exploits.',
        runtime: 'Scaffolds package schema profiles.'
      }
    ]
  };

  const activeData = manualData[kind] || [];
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

  if (activeTab === 'script') {
    explanation = {
      'title': 'Catalog Metadata Info',
      'filename': 'catalog-info.yaml',
      'why': 'Defines backstage component settings, ownership groups, system classifications, and alert mappings.',
      'when': 'Prior to deploying code repositories.',
      'where': 'Deploy at the root of microservice code folder.',
      'command': '# Discovered automatically by Backstage Git plugins',
      'practices': ['Pin exact owner names.', 'Classify system fields to map architecture topologies.'],
      'ai_mlops': 'Enables AI agents to discover api endpoints owned by specific squads.',
      'flow': '[Catalog metadata discovery]'
    };
  } else if (activeTab === 'scaffolder') {
    explanation = {
      'title': 'Scaffolder Template Specifications',
      'filename': 'template.yaml',
      'why': 'Defines the UI parameters inputs and sequential steps required to build a code repository.',
      'when': 'Prior to onboard/bootstrapping new code bases.',
      'where': 'Upload directly to Backstage catalog database.',
      'command': '# Rendered inside Developer portal templates hub',
      'practices': ['Make service name unique checks.', 'Include automated SonarQube scan triggers.'],
      'ai_mlops': 'Triggers automatic training code repository bootstrapping.',
      'flow': '[Template parameters input] ➔ [Fetch skeleton] ➔ [Publish Git] ➔ [Register Catalog]'
    };
  } else if (activeTab === 'readme') {
    explanation = {
      'title': 'Onboarding Instructions Manual',
      'filename': 'README.md',
      'why': 'Installation details and Backstage portal dependencies instructions.',
      'when': 'Prior to setting up portal entities.',
      'where': 'Save in component folder.',
      'command': '# Open in viewer',
      'practices': ['Ensure links to developer group channels are included.'],
      'ai_mlops': 'Context manuals.',
      'flow': '[README.md Guide]'
    };
  } else if (activeTab === 'runbook') {
    explanation = {
      'title': 'Registration Triage Runbook',
      'filename': 'sre_runbook.md',
      'why': 'Playbook to resolve backstage catalog sync failures and metadata invalid schema issues.',
      'when': 'On backstage index sync exception alerts.',
      'where': 'Save in SRE handbook.',
      'command': '# Review validation instructions inside runbook',
      'practices': ['Validate backstage server logs for parsing errors.', 'Verify repo access tokens.'],
      'ai_mlops': 'Auto-repair rules.',
      'flow': '[Catalog Sync Failure] ➔ [Validate schema backstage] ➔ [Force trigger registration]'
    };
  } else if (activeTab === 'flow') {
    explanation = {
      'title': 'Self-Service Scaffolding Flow',
      'filename': 'flow.mermaid',
      'why': 'Visual diagram details self-service scaffolding execution steps.',
      'when': 'During design audits.',
      'where': 'Interactive render view.',
      'command': '# Render in browser',
      'practices': ['Map all CI pipeline integrations.'],
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

window.closeExplanationDrawer = closeExplanationDrawer;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
window.copyActiveTabContent = copyActiveTabContent;
window.explainActiveTabCode = explainActiveTabCode;
window.clearAllFields = clearAllFields;
window.downloadScriptZip = downloadScriptZip;
window.toggleManualItem = toggleManualItem;
