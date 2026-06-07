// GitHub Org Governance & CodeOwners Studio compiler logic

const SCRIPT_VERSION = "1.0.0";

function initGithubGovStudio() {
  const elements = {
    org: document.getElementById('gov_org'),
    branch: document.getElementById('gov_branch_pattern'),
    srcReviewers: document.getElementById('gov_codeowners_src'),
    infraReviewers: document.getElementById('gov_codeowners_infra'),
    statusChecks: document.getElementById('gov_status_checks'),
    signedCommits: document.getElementById('gov_signed_commits'),
    codeownerReviews: document.getElementById('gov_codeowner_reviews'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy-gov'),
    btnDownload: document.getElementById('btn-download-gov'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'gov_codeowners';
  let compiledCode = {
    gov_codeowners: '',
    gov_yaml: '',
    gov_json: '',
    gov_flow: ''
  };

  function compileConfigs() {
    const scope = elements.org ? elements.org.value : 'talari-enterprise';
    const brPattern = elements.branch ? elements.branch.value : 'main';
    const lead = elements.srcReviewers ? elements.srcReviewers.value : '@talari-enterprise/sre-core';
    const infra = elements.infraReviewers ? elements.infraReviewers.value : '@talari-enterprise/infra-admins';
    const reqStatus = elements.statusChecks ? elements.statusChecks.checked : true;
    const reqSign = elements.signedCommits ? elements.signedCommits.checked : true;
    const reqOwner = elements.codeownerReviews ? elements.codeownerReviews.checked : true;

    // 1. Compile CODEOWNERS
    let co = `# Global CODEOWNERS definition for ${scope}\n`;
    co += `# Set default reviewers for repository scope\n`;
    co += `*       ${lead}\n\n`;
    co += `# Infrastructure module reviews\n`;
    co += `/infra/  ${infra}\n`;
    co += `/terraform/ ${infra}\n\n`;
    co += `# Source code module reviews\n`;
    co += `/src/    ${lead}\n`;
    compiledCode.gov_codeowners = co;

    // 2. Compile compliance-gates.yml
    let workflow = `name: Repository Compliance Gates\n`;
    workflow += `on:\n`;
    workflow += `  pull_request:\n`;
    workflow += `    branches: [ ${brPattern} ]\n\n`;
    workflow += `jobs:\n`;
    workflow += `  compliance-check:\n`;
    workflow += `    runs-on: ubuntu-latest\n`;
    workflow += `    steps:\n`;
    workflow += `      - name: Checkout Code\n`;
    workflow += `        uses: actions/checkout@v4\n\n`;
    if (reqSign) {
      workflow += `      - name: Verify Signed Commits\n`;
      workflow += `        run: |\n`;
      workflow += `          echo "Verifying git commit GPG keys..."\n`;
      workflow += `          git log --show-signature -1\n\n`;
    }
    if (reqStatus) {
      workflow += `      - name: Code Quality Status Check\n`;
      workflow += `        run: |\n`;
      workflow += `          echo "Running mandatory code standards check..."\n`;
      workflow += `          npm run test && npm run build\n\n`;
    }
    workflow += `      - name: Verify Codeowner Approvals\n`;
    workflow += `        run: |\n`;
    workflow += `          echo "Enforcing compliance validation check for ${lead}..."\n`;
    compiledCode.gov_yaml = workflow;

    // 3. Compile branch-rules.json
    const ruleObj = {
      enforce_admins: true,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: reqOwner,
        required_approving_review_count: 2
      },
      restrictions: null,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
      required_signatures: reqSign
    };

    if (reqStatus) {
      ruleObj.required_status_checks = {
        strict: true,
        contexts: [
          "compliance-check",
          "security-audit"
        ]
      };
    } else {
      ruleObj.required_status_checks = null;
    }

    compiledCode.gov_json = JSON.stringify(ruleObj, null, 2);

    // 4. Compile Flow
    let flow = 'graph TD\n';
    flow += '  PR[📝 PR Created] --> Trigger[⚡ Trigger compliance-gates.yml]\n';
    flow += '  Trigger --> Checks{⚖️ Gates Evaluation}\n';
    
    if (reqStatus) {
      flow += '  Checks -- Status Checks Fail --> Block[❌ PR Blocked]\n';
    }
    if (reqSign) {
      flow += '  Checks -- Commit Not Signed --> Block\n';
    }
    
    flow += '  Checks -- All Gates Pass --> CodeOwners[🛡️ CODEOWNERS Review]\n';
    flow += `  CodeOwners -->|Reviewer Assigned| Review{✍️ Review Approved}\n`;
    
    if (reqOwner) {
      flow += `  Review -- Approved by 2 Lead Reviewers --> Merge[🟢 PR Merged to ${brPattern}]\n`;
    } else {
      flow += `  Review -- Approved by Admins --> Merge[🟢 PR Merged to ${brPattern}]\n`;
    }
    
    flow += '  Review -- Rejected --> Block\n';
    compiledCode.gov_flow = flow;

    updateViewportContent();
  }

  function updateViewportContent() {
    if (!elements.outputBox) return;

    if (activeTab === 'gov_flow') {
      elements.outputBox.classList.add('hidden');
      elements.mermaidContainer.classList.remove('hidden');

      elements.mermaidContainer.innerHTML = '<div class="mermaid text-center">' + compiledCode.gov_flow + '</div>';
      
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
      let filename = 'CODEOWNERS';
      if (activeTab === 'gov_yaml') filename = 'compliance-gates.yml';
      if (activeTab === 'gov_json') filename = 'branch-rules.json';
      if (elements.downloadInput) elements.downloadInput.value = filename;
    }
  }

  // Bind controls listeners
  const controls = [
    elements.org, elements.branch, elements.srcReviewers, elements.infraReviewers,
    elements.statusChecks, elements.signedCommits, elements.codeownerReviews
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
    ['gov_codeowners', 'gov_yaml', 'gov_json', 'gov_flow'],
    'gov_codeowners',
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
  if (document.getElementById('gov_org')) {
    initGithubGovStudio();
  }
});

window.initGithubGovStudio = initGithubGovStudio;
