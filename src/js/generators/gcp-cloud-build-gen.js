// GCP Cloud Build Studio SRE compiler logic

function initStudio() {
  const elements = {
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    btnCopy: document.getElementById('btn-copy'),
    btnDownload: document.getElementById('btn-download'),
    mermaidContainer: document.getElementById('mermaid-container'),
  };

  let activeTab = 'cb_yaml';
  let compiledCode = {};

  function compileConfigs() {
    
    const name = document.getElementById('cb_name').value;
    const reg = document.getElementById('cb_registry').value;
    const loc = document.getElementById('cb_location').value;
    const trig = document.getElementById('cb_trigger').value;

    compiledCode.cb_yaml = "steps:\n" + 
      "  - name: 'gcr.io/cloud-builders/docker'\n" + 
      "    args: ['build', '-t', '" + loc + "-docker.pkg.dev/$PROJECT_ID/" + reg + "/" + name + ":$COMMIT_SHA', '.']\n" + 
      "  - name: 'gcr.io/cloud-builders/docker'\n" + 
      "    args: ['push', '" + loc + "-docker.pkg.dev/$PROJECT_ID/" + reg + "/" + name + ":$COMMIT_SHA']\n" + 
      "images:\n" + 
      "  - '" + loc + "-docker.pkg.dev/$PROJECT_ID/" + reg + "/" + name + ":$COMMIT_SHA'\n";

    compiledCode.trigger_sh = "#!/usr/bin/env bash\n" + 
      "gcloud builds submit --config=cloudbuild.yaml --substitutions=COMMIT_SHA=$(git rev-parse HEAD)\n";

    compiledCode.cb_flow = "graph TD\n  Commit[Git Commit Trigger: " + trig + "] -->|Submit build| CloudBuild[Google Cloud Build Service]\n  CloudBuild -->|docker build| Worker[Build Runner VM]\n  Worker -->|docker push| ArtifactRegistry[GCP Artifact Registry: " + reg + "/" + name + "]\n";
    
    let filename = 'cloudbuild.yaml';
    if (activeTab === 'trigger_sh') filename = 'trigger.sh';
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
    ['cb_yaml', 'trigger_sh', 'cb_flow'],
    'cb_yaml',
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
