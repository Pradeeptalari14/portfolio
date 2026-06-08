// Azure Monitor & Log Analytics Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'monitor_tf';
  let compiledCode = {};

  function compileConfigs() {
    
    const wsName = document.getElementById('mon_workspace').value;
    const retention = document.getElementById('mon_retention').value;
    const cond = document.getElementById('mon_alert').value;
    const sev = document.getElementById('mon_severity').value;

    compiledCode.monitor_tf = "resource \"azurerm_log_analytics_workspace\" \"law\" {\n" + 
      "  name                = \"" + wsName + "\"\n" + 
      "  location            = \"westeurope\"\n" + 
      "  resource_group_name = \"rg-ops\"\n" + 
      "  retention_in_days   = " + retention + "\n" + 
      "}\n\n" + 
      "resource \"azurerm_monitor_metric_alert\" \"alert\" {\n" + 
      "  name                = \"SRE-Metric-Alert\"\n" + 
      "  resource_group_name = \"rg-ops\"\n" + 
      "  scopes              = [azurerm_log_analytics_workspace.law.id]\n" + 
      "  severity            = " + sev + "\n\n" + 
      "  criteria {\n" + 
      "    metric_namespace = \"Microsoft.OperationalInsights/workspaces\"\n" + 
      "    metric_name      = \"" + cond + "\"\n" + 
      "    operator         = \"GreaterThan\"\n" + 
      "    threshold        = 85\n" + 
      "    aggregation      = \"Average\"\n" + 
      "  }\n" + 
      "}\n";

    compiledCode.kql_rules = "// Kusto Query Language (KQL) diagnostic rules\n" + 
      "AzureDiagnostics\n" + 
      "| where ResourceProvider == \"MICROSOFT.CONTAINERSERVICE\"\n" + 
      "| where Category == \"kube-audit\"\n" + 
      "| where ResultSignature != \"200\"\n" + 
      "| summarize count() by bin(TimeGenerated, 5m), OperationName\n" + 
      "| where count_ > 50\n";

    compiledCode.mon_flow = "graph TD\n  AKS[AKS Cluster Resources] -->|Diagnostic Logs logs| LAW[Log Analytics Workspace: " + wsName + "]\n  LAW -->|KQL query scanning| Alert[Metric Alert check: " + cond + "]\n  Alert -->|Trigger webhook Sev: " + sev + "| PagerDuty[SRE Escalation Page]\n";
    
    let filename = 'monitor_rules.tf';
    if (activeTab === 'kql_rules') filename = 'alert_rules.kql';
    if (document.getElementById('download-name-input')) document.getElementById('download-name-input').value = filename;
    
    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab.includes('flow')) {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      const flowVal = compiledCode[activeTab];
      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + flowVal + '</div>';
      
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
    }
  }

  // Bind controls listeners
  const inputs = document.querySelectorAll('.form-input, .form-select, .custom-checkbox');
  inputs.forEach(input => {
    input.addEventListener('input', compileConfigs);
    input.addEventListener('change', compileConfigs);
  });

  // Bind actions
  if (elements.btnCopy) {
    elements.btnCopy.onclick = () => {
      navigator.clipboard.writeText(elements.outputBox.textContent).then(() => {
        const originalText = elements.btnCopy.innerHTML;
        elements.btnCopy.innerHTML = '<span>✅ Copied!</span>';
        setTimeout(() => {
          elements.btnCopy.innerHTML = originalText;
        }, 1500);
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
    ['monitor_tf', 'kql_rules', 'mon_flow'],
    'monitor_tf',
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
  initStudio();
});

window.initStudio = initStudio;
