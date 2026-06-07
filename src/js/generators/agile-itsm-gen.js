// Agile & ITSM Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initAgileItsmStudio() {
  const elements = {
    priority: document.getElementById('itsm_priority'),
    system: document.getElementById('itsm_system'),
    changeDesc: document.getElementById('itsm_change_desc'),
    assignee: document.getElementById('itsm_assignee'),
    jiraProject: document.getElementById('itsm_jira_project'),
    pagerdutyKey: document.getElementById('itsm_pagerduty_key'),
    cabReview: document.getElementById('itsm_cab_review'),
    autoRollback: document.getElementById('itsm_auto_rollback'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-itsm'),
    btnDownload: document.getElementById('btn-download-itsm'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'itsm_jira';
  let compiledCode = {
    itsm_jira: '',
    itsm_snow: '',
    itsm_python: '',
    itsm_flow: ''
  };

  function compileConfigs() {
    const pri = elements.priority ? elements.priority.value : 'P3';
    const sys = elements.system ? elements.system.value : 'payment-gateway-service';
    const desc = elements.changeDesc ? elements.changeDesc.value : 'Deploy version 2.4.1 to Production environment';
    const lead = elements.assignee ? elements.assignee.value : 'Pradeep Talari';
    const jiraProj = elements.jiraProject ? elements.jiraProject.value : 'SRE-OPS';
    const pdKey = elements.pagerdutyKey ? elements.pagerdutyKey.value : 'pd-service-payment-gate';
    const cab = elements.cabReview ? elements.cabReview.checked : true;
    const rollback = elements.autoRollback ? elements.autoRollback.checked : true;

    // Map priority details
    let priorityName = 'Medium';
    let snowPriority = '3';
    let pdSeverity = 'warning';
    if (pri === 'P1') {
      priorityName = 'Highest';
      snowPriority = '1';
      pdSeverity = 'critical';
    } else if (pri === 'P2') {
      priorityName = 'High';
      snowPriority = '2';
      pdSeverity = 'error';
    } else if (pri === 'P4') {
      priorityName = 'Low';
      snowPriority = '4';
      pdSeverity = 'info';
    }

    // 1. Compile Jira Payload
    const jiraObj = {
      fields: {
        project: {
          key: jiraProj
        },
        summary: `Deployment Ticket: ${sys} (${pri})`,
        description: `Change Request Summary: ${desc}\nLead SRE: ${lead}`,
        issuetype: {
          name: "Task"
        },
        priority: {
          name: priorityName
        },
        customfield_10010: `CAB Review Required: ${cab ? 'true' : 'false'}`
      }
    };
    compiledCode.itsm_jira = JSON.stringify(jiraObj, null, 2);

    // 2. Compile ServiceNow Change
    const snowObj = {
      change_request: {
        short_description: `RFC - ${sys} deployment`,
        description: desc,
        priority: snowPriority,
        risk: pri === 'P1' || pri === 'P2' ? 'High' : 'Low',
        type: cab ? 'Normal' : 'Standard',
        assigned_to: lead,
        u_cab_approval: cab ? 'required' : 'not_required',
        u_auto_rollback: rollback ? 'enabled' : 'disabled'
      }
    };
    compiledCode.itsm_snow = JSON.stringify(snowObj, null, 2);

    // 3. Compile python script
    let python = `#!/usr/bin/env python3\n`;
    python += `# Standard PagerDuty SRE automated incident triggering script\n`;
    python += `import json\n`;
    python += `import urllib.request\n\n`;
    python += `routing_key = "${pdKey}"\n`;
    python += `payload = {\n`;
    python += `    "payload": {\n`;
    python += `        "summary": "CRITICAL SLO Alert: ${sys} (${pri})",\n`;
    python += `        "timestamp": "2026-06-07T10:38:15Z",\n`;
    python += `        "source": "${sys}",\n`;
    python += `        "severity": "${pdSeverity}",\n`;
    python += `        "component": "production-service",\n`;
    python += `        "group": "sre-operations",\n`;
    python += `        "class": "SLO breach"\n`;
    python += `    },\n`;
    python += `    "routing_key": routing_key,\n`;
    python += `    "event_action": "trigger"\n`;
    python += `}\n\n`;
    python += `req = urllib.request.Request(\n`;
    python += `    "https://events.pagerduty.com/v2/enqueue",\n`;
    python += `    data=json.dumps(payload).encode('utf-8'),\n`;
    python += `    headers={"Content-Type": "application/json"},\n`;
    python += `    method="POST"\n`;
    python += `)\n\n`;
    python += `try:\n`;
    python += `    with urllib.request.urlopen(req) as res:\n`;
    python += `        print("PagerDuty Incident triggered successfully: Status", res.status)\n`;
    python += `except Exception as e:\n`;
    python += `    print("Failed to trigger PagerDuty event:", e)\n`;
    compiledCode.itsm_python = python;

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += '  Incident[🚨 Incident Triggered] --> Alert[📢 PagerDuty Paging]\n';
    flow += `  Alert --> Engage[SRE Assigned: ${lead}]\n`;
    flow += '  Engage --> Diagnostic{🔍 Diagnostic Check}\n';
    
    if (rollback) {
      flow += '  Diagnostic -- Auto Rollback Active (Yes) --> Rollback[⏪ Auto-rollback initiated]\n';
      flow += '  Rollback --> Verify[🧪 Verify service metrics]\n';
    } else {
      flow += '  Diagnostic -- Auto Rollback Inactive (No) --> Manual[🛠️ Manual Intervention]\n';
      flow += '  Manual --> Verify[🧪 Verify service metrics]\n';
    }
    
    if (!rollback) {
      flow += '  Diagnostic --> Manual\n';
    }

    flow += '  Verify -- SLA Met --> Close[✅ Resolve Incident]\n';
    compiledCode.itsm_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'itsm_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.itsm_flow + '</div>';
      
      if (typeof mermaid !== 'undefined') {
        try {
          mermaid.run({
            nodes: [elements.mermaidContainer.querySelector('.mermaid')]
          });
        } catch (e) {
          console.error("Mermaid error:", e);
        }
      }
    } else {
      elements.outputBox.classList.remove('hidden');
      elements.mermaidContainer.classList.add('hidden');
      elements.outputBox.textContent = compiledCode[activeTab];
      
      // Update filename box
      let filename = 'jira-payload.json';
      if (activeTab === 'itsm_snow') filename = 'servicenow-change.json';
      if (activeTab === 'itsm_python') filename = 'trigger-incident.py';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.priority, elements.system, elements.changeDesc, elements.assignee,
    elements.jiraProject, elements.pagerdutyKey, elements.cabReview, elements.autoRollback
  ];
  controls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('change', compileConfigs);
      ctrl.addEventListener('input', compileConfigs);
    }
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        alert("✅ Copied to clipboard!");
      });
    };
  }

  if (elements.btnDownload) {
    elements.btnDownload.onclick = () => {
      const content = elements.outputBox.textContent;
      const filename = elements.downloadInput.value;
      const a = document.createElement('a');
      a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
      a.download = filename;
      a.click();
    };
  }

  // Setup tab routing
  window.SreCore.setupStudioTabs(
    ['itsm_jira', 'itsm_snow', 'itsm_python', 'itsm_flow'],
    'itsm_jira',
    { outputBox: elements.outputBox },
    (tabName) => {
      activeTab = tabName;
      updateViewportContent();
    }
  );

  // Initial Compile
  compileConfigs();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('itsm_priority')) {
    initAgileItsmStudio();
  }
});

window.initAgileItsmStudio = initAgileItsmStudio;
