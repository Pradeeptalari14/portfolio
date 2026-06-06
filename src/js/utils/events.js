/**
 * Unifies setting up DOM event listeners for script compilation triggers.
 * Automatically selects all input, select, and textarea elements on the page,
 * excludes any inputs specified (like download names), and binds 'input' and 'change'
 * events to run the compilation callback.
 * 
 * @param {Function} compileCallback - The callback function to run when an input changes.
 * @param {Array<string>} [excludeIds=['download-name-input']] - List of DOM element IDs to exclude from triggering compilation.
 */
export function setupCompilerTriggers(compileCallback, excludeIds = ['download-name-input']) {
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (!excludeIds.includes(input.id)) {
      input.addEventListener('input', compileCallback);
      input.addEventListener('change', compileCallback);
    }
  });
}

// ── Shared Mermaid Theme, Node Interaction, and Exporter Utilities ──
document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const container = $('mermaid-container');

  // 1. Initialize Mermaid with custom Slate/Indigo dark variables
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        fontFamily: 'JetBrains Mono, monospace',
        primaryColor: '#1e293b',       // slate-800
        primaryTextColor: '#f8fafc',   // slate-50
        primaryBorderColor: '#334155', // slate-700
        lineColor: '#6366f1',          // indigo-500
        secondaryColor: '#0f172a',     // slate-900
        tertiaryColor: '#312e81',      // indigo-900
        nodeBorder: '#475569',
        mainBkg: '#1e293b',
        textColor: '#f8fafc'
      }
    });
  }

  // Helper keyword map matching node labels to tab ids
  const tabKeywords = {
    'readme': ['readme', 'guide', 'doc', 'instructions'],
    'dockerfile': ['dockerfile', 'docker build', 'sign image', 'image', 'cosign'],
    'docker_compose': ['docker-compose', 'compose', 'docker run', 'minio'],
    'k8s': ['kubernetes', 'k8s', 'manifest', 'pvc', 'pv', 'crd'],
    'deployment': ['deployment', 'pod', 'replica', 'daemonset', 'statefulset', 'workload'],
    'service': ['service', 'dns', 'ip', 'ingress', 'route', 'ssl', 'cert', 'gateway'],
    'prometheus': ['prometheus', 'metrics', 'scrape', 'telemetry', 'grafana', 'dashboard'],
    'cicd': ['ci/cd', 'github actions', 'gitlab', 'jenkins', 'pipeline', 'workflow', 'runner', 'sast'],
    'runbook': ['runbook', 'triage', 'incident', 'playbook', 'rollback', 'manual'],
    'secrets': ['secrets', 'vault', 'sops', 'policy', 'hcl', 'token'],
    'script': ['script', 'bash', 'sh', 'python', 'py']
  };

  // 2. Interactive Click Handler on Flowchart Nodes
  if (container) {
    // Make container relative so the floating download button aligns perfectly
    container.style.position = 'relative';

    container.addEventListener('click', (e) => {
      const node = e.target.closest('.node');
      if (!node) return;

      const labelEl = node.querySelector('.nodeLabel') || node.querySelector('.label') || node;
      const text = labelEl.textContent.trim().toLowerCase();

      // Find best matching tab target key
      let matchedTab = null;
      for (const [tabKey, keywords] of Object.entries(tabKeywords)) {
        if (keywords.some(kw => text.includes(kw))) {
          matchedTab = tabKey;
          break;
        }
      }

      if (matchedTab && typeof window.switchTab === 'function') {
        const targetBtn = $(`tab-${matchedTab}`);
        if (targetBtn) {
          window.switchTab(matchedTab);
          showToast(`🎯 Opened ${matchedTab} tab`);
        } else {
          // Fallback: check if we can partial match any active tab button ID on the page
          const btns = Array.from(document.querySelectorAll('.tab-btn'));
          for (const btn of btns) {
            const btnTabId = btn.id.replace('tab-', '');
            if (btnTabId !== 'flow' && (btnTabId.includes(matchedTab) || matchedTab.includes(btnTabId))) {
              window.switchTab(btnTabId);
              showToast(`🎯 Opened ${btnTabId} tab`);
              break;
            }
          }
        }
      }
    });

    // 3. Dynamic Flowchart SVG Exporter (Appends a download button when container updates)
    const downloadBtnId = 'download-flowchart-btn';

    const observer = new MutationObserver(() => {
      const svg = container.querySelector('svg');
      if (svg && !document.getElementById(downloadBtnId)) {
        const btn = document.createElement('button');
        btn.id = downloadBtnId;
        btn.className = 'absolute bottom-4 right-4 bg-indigo-600/90 hover:bg-indigo-700 text-white text-[10px] font-mono px-3 py-2 rounded-lg transition-all duration-200 shadow-lg flex items-center gap-1.5 border border-indigo-500/30 cursor-pointer backdrop-blur-sm';
        btn.innerHTML = '📥 Export SVG';
        btn.onclick = (e) => {
          e.stopPropagation();
          const svgEl = container.querySelector('svg');
          if (svgEl) {
            // Get original SVG element markup
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgEl);
            
            // Add XML namespace declaration if missing
            if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
              source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
              source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }
            
            // Output downloadable blob file
            const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${document.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-flowchart.svg`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('💾 Flowchart exported successfully!');
          }
        };
        container.appendChild(btn);
      }
    });

    observer.observe(container, { childList: true });
  }

  // Toast utility helper (safely fallbacks to alert or browser log if showToast not exposed)
  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      const toastContent = $('toast-content');
      const toastWrapper = $('toast-wrapper');
      if (toastContent && toastWrapper) {
        toastContent.replaceChildren();
        const iconSpan = document.createElement('span');
        iconSpan.textContent = '⚡';
        toastContent.appendChild(iconSpan);
        toastContent.appendChild(document.createTextNode(' ' + msg));
        toastWrapper.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none');
        toastWrapper.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
          toastWrapper.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none');
          toastWrapper.classList.remove('opacity-100', 'translate-y-0');
        }, 2000);
      } else {
        console.log(`[Toast Notification] ${msg}`);
      }
    }
  }
});
