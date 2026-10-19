// Alertmanager Visualizer Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initAlertmanagerVisualizer() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const defaultReceiver = $('default_receiver');
  const groupWait = $('group_wait');
  const groupInterval = $('group_interval');
  const repeatInterval = $('repeat_interval');

  const matchSeverityCritical = $('match_severity_critical');
  const matchTeamDatabase = $('match_team_database');
  const matchTeamSecurity = $('match_team_security');
  const inhibitCriticalWarnings = $('inhibit_critical_warnings');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Selector
  const simAlertLabel = $('sim_alert_label');
  const svgContainer = $('visualizer-svg-container');

  function compileConfig() {
    if (!defaultReceiver) return;
    const fallback = defaultReceiver.value;
    const wait = groupWait.value;
    const interval = groupInterval.value.trim() || '5m';
    const repeat = repeatInterval.value.trim() || '12h';

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    if (activeTab === 'tab-config') {
      downloadNameInput.value = 'alertmanager.yaml';
      outputBox.textContent = generateAlertmanagerYaml(fallback, wait, interval, repeat);
    }

    renderSvgVisualizer();
  }

  function generateAlertmanagerYaml(fallback, wait, interval, repeat) {
    let routes = [];
    if (matchSeverityCritical.checked) {
      routes.push(`  - matchers:
      - severity = critical
    receiver: pagerduty-critical`);
    }
    if (matchTeamDatabase.checked) {
      routes.push(`  - matchers:
      - team = database
    receiver: slack-database`);
    }
    if (matchTeamSecurity.checked) {
      routes.push(`  - matchers:
      - team = security
    receiver: security-dual-channel`);
    }

    let inhibitRulesBlock = '';
    if (inhibitCriticalWarnings.checked) {
      inhibitRulesBlock = `inhibit_rules:
  - source_matchers: [ severity = critical ]
    target_matchers: [ severity = warning ]
    equal: [ alertname, dev, instance ]
`;
    }

    return `global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: ${wait}
  group_interval: ${interval}
  repeat_interval: ${repeat}
  receiver: ${fallback}
  routes:
${routes.length > 0 ? routes.join('\n') : '    []'}

receivers:
  - name: slack-all
    slack_configs:
      - channel: '#alerts-general'
        send_resolved: true
  - name: email-team
    email_configs:
      - to: 'devops@team.com'
  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: 'pd-crit-service-key'
  - name: slack-database
    slack_configs:
      - channel: '#db-alerts'
  - name: security-dual-channel
    slack_configs:
      - channel: '#soc-alerts'
    pagerduty_configs:
      - service_key: 'pd-sec-service-key'

${inhibitRulesBlock}`;
  }

  function renderSvgVisualizer() {
    if (!svgContainer || !simAlertLabel) return;
    const selected = simAlertLabel.value;

    const fallback = defaultReceiver.value;
    const activeRouteColor = '#ea580c'; // orange
    const inactiveRouteColor = '#334155'; // slate-700
    const activeNodeColor = '#ffedd5'; // light orange bg
    const inactiveNodeColor = '#1e293b'; // slate-800 bg
    const activeBorderColor = '#ea580c';
    const inactiveBorderColor = '#475569';

    // Decide active paths
    let pathDefault = inactiveRouteColor;
    let pathCrit = inactiveRouteColor;
    let pathDb = inactiveRouteColor;
    let pathSec = inactiveRouteColor;

    let targetSlack = false;
    let targetPD = false;
    let targetEmail = false;

    if (selected === 'crit' && matchSeverityCritical.checked) {
      pathCrit = activeRouteColor;
      targetPD = true;
    } else if (selected === 'db' && matchTeamDatabase.checked) {
      pathDb = activeRouteColor;
      targetSlack = true;
    } else if (selected === 'sec' && matchTeamSecurity.checked) {
      pathSec = activeRouteColor;
      targetSlack = true;
      targetPD = true;
    } else {
      pathDefault = activeRouteColor;
      if (fallback === 'slack-all') targetSlack = true;
      else if (fallback === 'email-team') targetEmail = true;
      else targetPD = true;
    }

    svgContainer.innerHTML = `
      <svg width="100%" height="260" viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg">
        <!-- Lines -->
        <line x1="50" y1="130" x2="160" y2="130" stroke="${activeRouteColor}" stroke-width="2.5" />
        
        <!-- Routes Path Lines -->
        <path d="M 160 130 L 180 60 L 260 60" stroke="${pathCrit}" stroke-width="${pathCrit === activeRouteColor ? '3' : '1.5'}" fill="none" />
        <path d="M 160 130 L 180 110 L 260 110" stroke="${pathDb}" stroke-width="${pathDb === activeRouteColor ? '3' : '1.5'}" fill="none" />
        <path d="M 160 130 L 180 160 L 260 160" stroke="${pathSec}" stroke-width="${pathSec === activeRouteColor ? '3' : '1.5'}" fill="none" />
        <path d="M 160 130 L 180 210 L 260 210" stroke="${pathDefault}" stroke-width="${pathDefault === activeRouteColor ? '3' : '1.5'}" fill="none" />
        
        <!-- Target receivers connection paths -->
        <path d="M 260 60 L 320 180" stroke="${pathCrit}" stroke-width="${pathCrit === activeRouteColor ? '2.5' : '1'}" fill="none" />
        <path d="M 260 110 L 320 80" stroke="${pathDb}" stroke-width="${pathDb === activeRouteColor ? '2.5' : '1'}" fill="none" />
        
        <!-- Node 1: Alert Ingress -->
        <rect x="10" y="110" width="80" height="40" rx="6" fill="${activeNodeColor}" stroke="${activeBorderColor}" stroke-width="2" />
        <text x="50" y="134" font-size="10" font-family="Inter, sans-serif" font-weight="bold" fill="#7c2d12" text-anchor="middle">Alert Ingress</text>

        <!-- Node 2: Route Matcher -->
        <rect x="120" y="110" width="80" height="40" rx="6" fill="${activeNodeColor}" stroke="${activeBorderColor}" stroke-width="2" />
        <text x="160" y="134" font-size="10" font-family="Inter, sans-serif" font-weight="bold" fill="#7c2d12" text-anchor="middle">Router Engine</text>

        <!-- Node 3a: Severity Critical Match -->
        <rect x="220" y="45" width="80" height="30" rx="4" fill="${pathCrit === activeRouteColor ? activeNodeColor : inactiveNodeColor}" stroke="${pathCrit === activeRouteColor ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="260" y="63" font-size="8" font-family="monospace" fill="${pathCrit === activeRouteColor ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">crit matcher</text>

        <!-- Node 3b: Database Match -->
        <rect x="220" y="95" width="80" height="30" rx="4" fill="${pathDb === activeRouteColor ? activeNodeColor : inactiveNodeColor}" stroke="${pathDb === activeRouteColor ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="260" y="113" font-size="8" font-family="monospace" fill="${pathDb === activeRouteColor ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">db matcher</text>

        <!-- Node 3c: Security Match -->
        <rect x="220" y="145" width="80" height="30" rx="4" fill="${pathSec === activeRouteColor ? activeNodeColor : inactiveNodeColor}" stroke="${pathSec === activeRouteColor ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="260" y="163" font-size="8" font-family="monospace" fill="${pathSec === activeRouteColor ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">sec matcher</text>

        <!-- Node 3d: Default Fallback -->
        <rect x="220" y="195" width="80" height="30" rx="4" fill="${pathDefault === activeRouteColor ? activeNodeColor : inactiveNodeColor}" stroke="${pathDefault === activeRouteColor ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="260" y="213" font-size="8" font-family="monospace" fill="${pathDefault === activeRouteColor ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">default fallback</text>

        <!-- Final Receivers -->
        <!-- Slack Receiver -->
        <rect x="310" y="60" width="80" height="35" rx="5" fill="${targetSlack ? activeNodeColor : inactiveNodeColor}" stroke="${targetSlack ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="350" y="81" font-size="9" font-family="Inter, sans-serif" font-weight="bold" fill="${targetSlack ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">💬 Slack</text>

        <!-- PagerDuty Receiver -->
        <rect x="310" y="165" width="80" height="35" rx="5" fill="${targetPD ? activeNodeColor : inactiveNodeColor}" stroke="${targetPD ? activeBorderColor : inactiveBorderColor}" stroke-width="1.5" />
        <text x="350" y="186" font-size="9" font-family="Inter, sans-serif" font-weight="bold" fill="${targetPD ? '#7c2d12' : '#94a3b8'}" text-anchor="middle">🚨 PagerDuty</text>
      </svg>
    `;
  }

  // Event Listeners
  [defaultReceiver, groupWait,
   matchSeverityCritical, matchTeamDatabase, matchTeamSecurity, inhibitCriticalWarnings].forEach(el => {
    if (el) {
      el.addEventListener('change', compileConfig);
      el.addEventListener('input', compileConfig);
    }
  });

  [groupInterval, repeatInterval].forEach(el => {
    if (el) el.addEventListener('input', compileConfig);
  });

  if (simAlertLabel) {
    simAlertLabel.addEventListener('change', renderSvgVisualizer);
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compileConfig();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Config copied to clipboard!');
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
  compileConfig();
}

if (document.readyState !== 'loading') {
  initAlertmanagerVisualizer();
} else {
  document.addEventListener('DOMContentLoaded', initAlertmanagerVisualizer);
}
