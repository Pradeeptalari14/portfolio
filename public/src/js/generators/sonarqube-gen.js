// SonarQube Quality Gate Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initSonarQubeStudio() {
  const elements = {
    projectKey: document.getElementById('sq_project_key'),
    projectName: document.getElementById('sq_project_name'),
    sources: document.getElementById('sq_sources'),
    tests: document.getElementById('sq_tests'),
    exclusions: document.getElementById('sq_exclusions'),
    coverageGate: document.getElementById('sq_coverage_gate'),
    maintainabilityGate: document.getElementById('sq_maintainability_gate'),
    reliabilityGate: document.getElementById('sq_reliability_gate'),
    securityGate: document.getElementById('sq_security_gate'),
    branchAnalysis: document.getElementById('sq_branch_analysis'),
    prDecoration: document.getElementById('sq_pr_decoration'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-sq'),
    btnDownload: document.getElementById('btn-download-sq'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'sq_properties';
  let compiledCode = {
    sq_properties: '',
    sq_rules: '',
    sq_scan: '',
    sq_flow: ''
  };

  function compileConfigs() {
    const key = elements.projectKey ? elements.projectKey.value : 'payment-api';
    const name = elements.projectName ? elements.projectName.value : 'Payment API';
    const src = elements.sources ? elements.sources.value : 'src';
    const tst = elements.tests ? elements.tests.value : 'tests';
    const excl = elements.exclusions ? elements.exclusions.value : '**/node_modules/**, **/*.test.js';
    const cov = elements.coverageGate ? elements.coverageGate.value : '80';
    const maint = elements.maintainabilityGate ? elements.maintainabilityGate.value : 'A';
    const rel = elements.reliabilityGate ? elements.reliabilityGate.value : 'A';
    const sec = elements.securityGate ? elements.securityGate.value : 'A';
    const runBranch = elements.branchAnalysis ? elements.branchAnalysis.checked : true;
    const runPr = elements.prDecoration ? elements.prDecoration.checked : true;

    // 1. Compile sonar-project.properties
    let props = `# SonarQube Project Configuration File\n`;
    props += `sonar.projectKey=${key}\n`;
    props += `sonar.projectName=${name}\n`;
    props += `sonar.projectVersion=1.0.0\n\n`;
    props += `sonar.sources=${src}\n`;
    props += `sonar.tests=${tst}\n`;
    props += `sonar.exclusions=${excl}\n`;
    props += `sonar.sourceEncoding=UTF-8\n\n`;
    props += `# Quality Gate Enforcement Settings\n`;
    props += `sonar.qualitygate.wait=true\n`;
    compiledCode.sq_properties = props;

    // 2. Compile sonar-rules.json
    let rules = `{\n`;
    rules += `  "qualitygate": {\n`;
    rules += `    "name": "${name} Gate Configuration",\n`;
    rules += `    "conditions": [\n`;
    rules += `      {\n`;
    rules += `        "metric": "new_coverage",\n`;
    rules += `        "op": "LT",\n`;
    rules += `        "error": "${cov}"\n`;
    rules += `      },\n`;
    rules += `      {\n`;
    rules += `        "metric": "new_maintainability_rating",\n`;
    rules += `        "op": "GT",\n`;
    rules += `        "error": "${maint}"\n`;
    rules += `      },\n`;
    rules += `      {\n`;
    rules += `        "metric": "new_reliability_rating",\n`;
    rules += `        "op": "GT",\n`;
    rules += `        "error": "${rel}"\n`;
    rules += `      },\n`;
    rules += `      {\n`;
    rules += `        "metric": "new_security_rating",\n`;
    rules += `        "op": "GT",\n`;
    rules += `        "error": "${sec}"\n`;
    rules += `      }\n`;
    rules += `    ]\n`;
    rules += `  }\n`;
    rules += `}\n`;
    compiledCode.sq_rules = rules;

    // 3. Compile scan.sh
    let scan = `#!/usr/bin/env bash\n`;
    scan += `# SonarScanner pipeline automated execution wrapper\n`;
    scan += `set -euo pipefail\n\n`;
    scan += `echo "========================================="\n`;
    scan += `echo "Initializing SonarQube Scanner for ${key}"\n`;
    scan += `echo "========================================="\n\n`;
    scan += `sonar-scanner \\\n`;
    scan += `  -Dsonar.projectKey=${key} \\\n`;
    scan += `  -Dsonar.sources=${src} \\\n`;
    scan += `  -Dsonar.host.url="\${SONAR_HOST_URL:-https://sonar.secure-internal.net}" \\\n`;
    scan += `  -Dsonar.token="\${SONAR_TOKEN}"`;

    if (runBranch) {
      scan += ` \\\n  -Dsonar.branch.name="\${GITHUB_REF_NAME:-main}"`;
    }

    if (runPr) {
      scan += ` \\\n  -Dsonar.pullrequest.key="\${CHANGE_ID:-}" \\\n`;
      scan += `  -Dsonar.pullrequest.branch="\${CHANGE_BRANCH:-}" \\\n`;
      scan += `  -Dsonar.pullrequest.base="\${CHANGE_TARGET:-}"`;
    }
    scan += `\n`;
    compiledCode.sq_scan = scan;

    // 4. Compile flowchart
    let flow = 'graph TD\n';
    flow += '  CodeCommit[📝 Code Commit / PR] --> RunScanner[🔍 Execute SonarScanner]\n';
    flow += '  RunScanner --> AnalyzeRules[⚙️ Analyze quality rulesets]\n';
    flow += '  AnalyzeRules --> GateEval{⚖️ Quality Gate check}\n';
    flow += `  GateEval -- Coverage < ${cov}% --> Fail[❌ Gate Failed]\n`;
    flow += `  GateEval -- Rating worse than ${maint}/${rel}/${sec} --> Fail\n`;
    flow += '  GateEval -- All gates satisfy limits --> Pass[✅ Gate Passed]\n';
    flow += '  Fail --> FailAction[🚫 Block Deployment]\n';
    flow += '  Pass --> PassAction[🟢 Allow Pipeline Deploy]\n';
    compiledCode.sq_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'sq_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.sq_flow + '</div>';
      
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
      let filename = 'sonar-project.properties';
      if (activeTab === 'sq_rules') filename = 'sonar-rules.json';
      if (activeTab === 'sq_scan') filename = 'scan.sh';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.projectKey, elements.projectName, elements.sources, elements.tests,
    elements.exclusions, elements.coverageGate, elements.maintainabilityGate,
    elements.reliabilityGate, elements.securityGate, elements.branchAnalysis,
    elements.prDecoration
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
    ['sq_properties', 'sq_rules', 'sq_scan', 'sq_flow'],
    'sq_properties',
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
  if (document.getElementById('sq_project_key')) {
    initSonarQubeStudio();
  }
});

window.initSonarQubeStudio = initSonarQubeStudio;
