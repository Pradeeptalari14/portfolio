// GCP Cloud Operations Monitoring Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'ops_json';
  let compiledCode = {};

  function compileConfigs() {
    
    const dash = document.getElementById('ops_dashboard').value;
    const threshold = document.getElementById('ops_threshold').value;
    const metric = document.getElementById('ops_metric').value;

    compiledCode.ops_json = JSON.stringify({
      "displayName": dash,
      "gridLayout": {
        "columns": "2",
        "widgets": [
          {
            "title": "CPU Usage chart",
            "xyChart": {
              "dataSets": [
                {
                  "timeSeriesQuery": {
                    "timeSeriesFilter": {
                      "filter": "metric.type=\"" + metric + "\""
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }, null, 2);

    compiledCode.ops_yaml = "displayName: Critical SRE Threshold Alert\n" + 
      "combiner: OR\n" + 
      "conditions:\n" + 
      "  - displayName: Metric value exceeds threshold\n" + 
      "    conditionThreshold:\n" + 
      "      filter: metric.type=\"" + metric + "\"\n" + 
      "      comparison: COMPARISON_GT\n" + 
      "      thresholdValue: " + (threshold / 100) + "\n" + 
      "      duration: 60s\n" + 
      "      trigger:\n" + 
      "        count: 1\n";

    compiledCode.ops_flow = "graph TD\n  GCP[GCP Resources] -->|Diagnostic Telemetry| Stackdriver[GCP Cloud Operations Suite]\n  Stackdriver -->|Render| Dash[Dashboard: " + dash + "]\n  Stackdriver -->|Match alert_policy.yaml| Alert[Trigger alert threshold: " + threshold + "%]\n  Alert -->|Webhook| Teams[Chatops Alert Teams]\n";
    
    let filename = 'metrics_dashboard.json';
    if (activeTab === 'ops_yaml') filename = 'alert_policy.yaml';
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
    ['ops_json', 'ops_yaml', 'ops_flow'],
    'ops_json',
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
