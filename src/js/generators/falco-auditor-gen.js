// Falco Security Auditor Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initFalcoAuditor() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const ruleTemplate = $('rule_template');
  const severitySelect = $('severity');
  const matchProdOnly = $('match_prod_only');
  const matchContainerOnly = $('match_container_only');

  const alertSlack = $('alert_slack');
  const alertPagerduty = $('alert_pagerduty');
  const alertSyslog = $('alert_syslog');
  const alertGrpc = $('alert_grpc');

  const ruleExceptions = $('rule_exceptions');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Inputs & Outputs
  const simAttackVector = $('sim_attack_vector');
  const triggerSimBtn = $('trigger_sim_btn');
  const terminalLogs = $('terminal-logs');

  function compileRules() {
    if (!ruleTemplate) return;
    const template = ruleTemplate.value;
    const severity = severitySelect.value;
    const prodOnly = matchProdOnly.checked;
    const containerOnly = matchContainerOnly.checked;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    const exceptionsText = ruleExceptions.value.trim() 
      ? `  exceptions:\n    - name: excluded_processes\n      fields: [proc.name]\n      comps: [in]\n      values: [${ruleExceptions.value.trim().split('\n').filter(l => l && !l.startsWith('#')).map(v => `'${v.trim()}'`).join(', ')}]`
      : '';

    if (activeTab === 'tab-config') {
      downloadNameInput.value = 'falco_rules.yaml';
      outputBox.textContent = generateRulesYaml(template, severity, prodOnly, containerOnly, exceptionsText);
    } else if (activeTab === 'tab-system') {
      downloadNameInput.value = 'falco.yaml';
      outputBox.textContent = generateFalcoYaml();
    }
  }

  function generateRulesYaml(template, severity, prodOnly, containerOnly, exceptions) {
    let ruleName = '';
    let desc = '';
    let condition = '';
    let output = '';

    if (template === 'terminal_shell') {
      ruleName = 'Terminal Shell Spawned in Container';
      desc = 'Detect user running shells (bash/sh/zsh) inside active container pods.';
      condition = 'spawned_process';
      if (containerOnly) condition += ' and container.id != host';
      if (prodOnly) condition += ' and k8s.ns.name = "production"';
      condition += ' and proc.name in (bash, sh, zsh, csh)';
      output = 'Shell spawned in container (user=%user.name pod=%k8s.pod.name ns=%k8s.ns.name container=%container.id command=%proc.cmdline parent=%proc.pname)';
    } else if (template === 'bin_dir_write') {
      ruleName = 'Write Below Bin Directory';
      desc = 'Detect suspicious file write operations beneath standard system binaries paths.';
      condition = 'open_write';
      if (containerOnly) condition += ' and container.id != host';
      if (prodOnly) condition += ' and k8s.ns.name = "production"';
      condition += ' and (fd.name startswith /usr/bin/ or fd.name startswith /bin/ or fd.name startswith /sbin/)';
      output = 'File write below bin directory (user=%user.name command=%proc.cmdline file=%fd.name parent=%proc.pname pod=%k8s.pod.name)';
    } else {
      ruleName = 'Read Sensitive Credentials Config';
      desc = 'Detect reading sensitive user credentials configs (/etc/shadow).';
      condition = 'open_read';
      if (containerOnly) condition += ' and container.id != host';
      if (prodOnly) condition += ' and k8s.ns.name = "production"';
      condition += ' and fd.name = "/etc/shadow"';
      output = 'Sensitive credential configuration read (user=%user.name command=%proc.cmdline file=%fd.name parent=%proc.pname pod=%k8s.pod.name)';
    }

    return `- rule: ${ruleName}
  desc: ${desc}
  condition: ${condition}
  output: ${output}
  priority: ${severity}
  tags: [security, container, syscall]
${exceptions}
`;
  }

  function generateFalcoYaml() {
    return `# Falco Config Core Schema
# Path: /etc/falco/falco.yaml

rules_file:
  - /etc/falco/falco_rules.yaml
  - /etc/falco/falco_rules.local.yaml

watch_config_files: true

stdout_output:
  enabled: ${alertSyslog.checked}

grpc:
  enabled: ${alertGrpc.checked}
  bind_address: "unix:///var/run/falco.sock"

web_notifier:
  # Notifiers webhook endpoints
  slack:
    enabled: ${alertSlack.checked}
    webhook_url: "https://hooks.slack.com/services/T00/B00/X00"
  pagerduty:
    enabled: ${alertPagerduty.checked}
    routing_key: "pd-service-routing-key"
`;
  }

  function executeSimulator() {
    if (!terminalLogs) return;
    const vector = simAttackVector.value;
    const severity = severitySelect.value;

    let logMessage = '';
    const now = new Date().toISOString();

    let colorClass = 'text-yellow-400';
    if (severity === 'CRITICAL') colorClass = 'text-red-500';
    else if (severity === 'WARNING') colorClass = 'text-orange-400';
    else if (severity === 'NOTICE') colorClass = 'text-cyan-400';

    if (vector === 'shell') {
      logMessage = `<span class="text-slate-500">${now}</span>: <span class="font-bold ${colorClass}">[${severity}]</span> Terminal Shell Spawned in Container (user=root pod=frontend-pod-6f29 ns=production container=a3f910d command=sh -i parent=nginx)`;
    } else if (vector === 'write') {
      logMessage = `<span class="text-slate-500">${now}</span>: <span class="font-bold ${colorClass}">[${severity}]</span> Write Below Bin Directory (user=app-user command=touch /usr/bin/malware file=/usr/bin/malware parent=bash pod=backend-pod-d812)`;
    } else {
      logMessage = `<span class="text-slate-500">${now}</span>: <span class="font-bold ${colorClass}">[${severity}]</span> Sensitive credential configuration read (user=root command=cat /etc/shadow file=/etc/shadow parent=sh pod=auth-service-2a1e)`;
    }

    const logEl = document.createElement('div');
    logEl.className = 'border-b border-slate-900 pb-1.5 font-mono';
    logEl.innerHTML = logMessage;
    terminalLogs.appendChild(logEl);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // Event Listeners
  [ruleTemplate, severitySelect, matchProdOnly, matchContainerOnly,
   alertSlack, alertPagerduty, alertSyslog, alertGrpc].forEach(el => {
    if (el) {
      el.addEventListener('change', compileRules);
      el.addEventListener('input', compileRules);
    }
  });

  if (ruleExceptions) {
    ruleExceptions.addEventListener('input', compileRules);
  }

  if (triggerSimBtn) {
    triggerSimBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeSimulator();
    });
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'system') {
      const tab = $('tab-system');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileRules();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Rules copied to clipboard!');
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

  // Trigger initial compile
  compileRules();
}

if (document.readyState !== 'loading') {
  initFalcoAuditor();
} else {
  document.addEventListener('DOMContentLoaded', initFalcoAuditor);
}
