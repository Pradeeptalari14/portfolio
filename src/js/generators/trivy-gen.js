// Trivy Security Studio Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initTrivyStudio() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const targetTypeSelect = $('target_type');
  const targetPathInput = $('target_path');
  const formatSelect = $('format');
  const ignoreUnfixedCheckbox = $('ignore_unfixed');
  const ignoreFileTextarea = $('ignore_file');

  const checkVuln = $('check_vuln');
  const checkConfig = $('check_config');
  const checkSecret = $('check_secret');
  const checkLicense = $('check_license');

  const sevCritical = $('sev_critical');
  const sevHigh = $('sev_high');
  const sevMedium = $('sev_medium');
  const sevLow = $('sev_low');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Findings Database
  const mockFindings = [
    { id: 'CVE-2023-4911', pkg: 'glibc', severity: 'CRITICAL', installed: '2.35-0ubuntu3.1', fixed: '2.35-0ubuntu3.4', title: 'Looney Tunables: Glibc dynamic loader buffer overflow.' },
    { id: 'CVE-2023-38545', pkg: 'curl', severity: 'HIGH', installed: '8.2.1', fixed: '8.4.0', title: 'SOCKS5 proxy connection heap buffer overflow.' },
    { id: 'CVE-2024-22195', pkg: 'jinja2', severity: 'MEDIUM', installed: '3.1.2', fixed: '3.1.3', title: 'HTML attribute injection leading to cross-site scripting.' },
    { id: 'CVE-2022-40897', pkg: 'setuptools', severity: 'LOW', installed: '65.5.0', fixed: '65.5.1', title: 'Regular expression denial of service via HTML parser.' },
    { id: 'CVE-2024-99999', pkg: 'libssl', severity: 'HIGH', installed: '1.1.1t', fixed: '', title: 'Unfixed buffer boundary vulnerability in memory allocations.' }
  ];

  function compileTrivy() {
    if (!targetTypeSelect) return;
    const target = targetTypeSelect.value;
    const path = targetPathInput.value.trim() || '.';
    const format = formatSelect.value;
    const ignoreUnfixed = ignoreUnfixedCheckbox.checked;

    // Checks
    let checkTypes = [];
    if (checkVuln.checked) checkTypes.push('vuln');
    if (checkConfig.checked) checkTypes.push('config');
    if (checkSecret.checked) checkTypes.push('secret');
    if (checkLicense.checked) checkTypes.push('license');

    // Severities
    let sevs = [];
    if (sevCritical.checked) sevs.push('CRITICAL');
    if (sevHigh.checked) sevs.push('HIGH');
    if (sevMedium.checked) sevs.push('MEDIUM');
    if (sevLow.checked) sevs.push('LOW');

    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.id : 'tab-cli';

    if (activeTab === 'tab-cli') {
      downloadNameInput.value = 'trivy_scan.sh';
      outputBox.textContent = generateCliCommand(target, path, format, ignoreUnfixed, checkTypes, sevs);
    } else if (activeTab === 'tab-config') {
      downloadNameInput.value = 'trivy.yaml';
      outputBox.textContent = generateTrivyYaml(format, ignoreUnfixed, checkTypes, sevs);
    } else if (activeTab === 'tab-actions') {
      downloadNameInput.value = 'trivy-scan.yml';
      outputBox.textContent = generateGithubWorkflow(target, path, ignoreUnfixed, sevs);
    } else if (activeTab === 'tab-ignore') {
      downloadNameInput.value = '.trivyignore';
      outputBox.textContent = ignoreFileTextarea.value || '# Whitelisted vulnerability exception keys\nCVE-2023-4911';
    }

    renderSimulator(sevs, ignoreUnfixed);
    updateExplanation(target);
  }

  function generateCliCommand(target, path, format, ignoreUnfixed, checkTypes, sevs) {
    let cmd = `#!/bin/bash\n# Trivy CLI Security Scan Command\n\ntrivy ${target}`;
    if (sevs.length > 0) cmd += ` --severity ${sevs.join(',')}`;
    if (checkTypes.length > 0) cmd += ` --scanners ${checkTypes.join(',')}`;
    if (ignoreUnfixed) cmd += ` --ignore-unfixed`;
    if (format !== 'table') cmd += ` --format ${format}`;
    cmd += ` ${path}`;

    return cmd;
  }

  function generateTrivyYaml(format, ignoreUnfixed, checkTypes, sevs) {
    return `# Trivy Configuration Schema
# Place in repository root as trivy.yaml

scan:
  scanners:
    ${checkTypes.map(c => `- ${c}`).join('\n    ')}

report:
  format: ${format}
  dependency-tree: true

vuln:
  severity: ${sevs.join(',')}
  ignore-unfixed: ${ignoreUnfixed}
`;
  }

  function generateGithubWorkflow(target, path, ignoreUnfixed, sevs) {
    return `# GitHub Actions Trivy Security Pipeline Scan
name: Security Audit Scan

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  trivy-scan:
    name: Container Supply Chain Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Run Aquasecurity Trivy Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: '${target}'
          scan-ref: '${path}'
          format: 'table'
          exit-code: '1' # Fails pipeline on finding vulnerabilities
          severity: '${sevs.join(',')}'
          ignore-unfixed: ${ignoreUnfixed}
`;
  }

  function renderSimulator(sevs, ignoreUnfixed) {
    const findingsList = $('findings-list');
    const statusText = $('state-security');
    const totalCount = $('stat-total');
    const critCount = $('stat-crit');
    const highCount = $('stat-high');

    if (!findingsList) return;
    findingsList.innerHTML = '';

    // Filter findings
    const filtered = mockFindings.filter(f => {
      const matchSev = sevs.includes(f.severity);
      const matchFixed = !ignoreUnfixed || f.fixed !== '';
      return matchSev && matchFixed;
    });

    const criticals = filtered.filter(f => f.severity === 'CRITICAL').length;
    const highs = filtered.filter(f => f.severity === 'HIGH').length;

    totalCount.textContent = filtered.length;
    critCount.textContent = criticals;
    highCount.textContent = highs;

    if (criticals > 0 || highs > 0) {
      statusText.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-red-500/20 text-red-400 border border-red-500/30';
      statusText.textContent = 'FAIL (Vulnerabilities Found)';
    } else {
      statusText.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-green-500/20 text-green-400 border border-green-500/30';
      statusText.textContent = 'PASS (Secure Compliance)';
    }

    if (filtered.length === 0) {
      findingsList.innerHTML = '<div class="text-xs text-slate-500 text-center py-6">No matching vulnerabilities found. System secure.</div>';
      return;
    }

    filtered.forEach(f => {
      const item = document.createElement('div');
      item.className = 'bg-slate-950 border border-slate-800 rounded p-3 text-xs leading-normal flex flex-col gap-1';
      
      let badgeColor = 'bg-slate-800 text-slate-400';
      if (f.severity === 'CRITICAL') badgeColor = 'bg-red-500/20 text-red-400 border border-red-500/30';
      else if (f.severity === 'HIGH') badgeColor = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      else if (f.severity === 'MEDIUM') badgeColor = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      else if (f.severity === 'LOW') badgeColor = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';

      item.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <span class="font-bold text-slate-200">${f.id} (${f.pkg})</span>
          <span class="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold ${badgeColor}">${f.severity}</span>
        </div>
        <p class="text-slate-400 text-[10px] my-1">${f.title}</p>
        <div class="flex gap-4 text-[9px] text-slate-500 font-mono">
          <span>Installed: <strong class="text-slate-300">${f.installed}</strong></span>
          <span>Fixed in: <strong class="text-emerald-400">${f.fixed || 'None'}</strong></span>
        </div>
      `;
      findingsList.appendChild(item);
    });
  }

  function updateExplanation(target) {
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Compiles static code validation rules using standard <strong>${target}</strong> scanning specs to assert dependency vulnerabilities and check secret leaks.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Save the compiled configuration as a <code>trivy.yaml</code> file or run execution commands directly inside your build agent shells.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `trivy ${target} --format table .`;
    }

    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Run vulnerability sweeps as high-level CI quality gates to fail code pushes when Criticals are found.</li>
        <li>Leverage the <code>--ignore-unfixed</code> flag to skip dependencies without current resolution patches.</li>
        <li>Enable Secrets scanning to detect accidentally checked API keys and private certificates.</li>
      `;
    }

    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `For AI deployment containers, verify standard python base packages (e.g. PyTorch, numpy) before shipping model containers to high-performance staging nodes.`;
    }

    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `[Vulnerability Scan] ➔ [Secrets Leak Audits] ➔ [Config Misconfigurations] ➔ [Compliance Report]`;
    }
  }

  // Event Listeners
  [targetTypeSelect, targetPathInput, formatSelect, ignoreUnfixedCheckbox,
   checkVuln, checkConfig, checkSecret, checkLicense,
   sevCritical, sevHigh, sevMedium, sevLow].forEach(el => {
    if (el) {
      el.addEventListener('change', compileTrivy);
      el.addEventListener('input', compileTrivy);
    }
  });

  if (ignoreFileTextarea) {
    ignoreFileTextarea.addEventListener('input', compileTrivy);
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'cli') {
      const tab = $('tab-cli');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'actions') {
      const tab = $('tab-actions');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'ignore') {
      const tab = $('tab-ignore');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
    }

    compileTrivy();
    if (tabName !== 'simulator' && outputBox) {
      outputBox.classList.remove('hidden');
    }
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Trigger initial compile
  compileTrivy();
}

if (document.readyState !== 'loading') {
  initTrivyStudio();
} else {
  document.addEventListener('DOMContentLoaded', initTrivyStudio);
}
