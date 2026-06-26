// Shared SRE & DevOps UI Core Library

function setupStudioTabs(tabNames, defaultTab, elements, switchCallback) {
  window.switchTab = function(tabName) {
    tabNames.forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) {
        if (tab === tabName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    const outputBox = elements.outputBox;
    const simViewport = document.getElementById('simulator-viewport');
    const terminalViewport = document.getElementById('terminal-viewport');
    const mermaidContainer = document.getElementById('mermaid-container');

    if (tabName === 'simulator') {
      if (outputBox) outputBox.classList.add('hidden');
      if (terminalViewport) terminalViewport.classList.add('hidden');
      if (mermaidContainer) mermaidContainer.classList.add('hidden');
      if (simViewport) simViewport.classList.remove('hidden');
    } else if (tabName === 'terminal') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.add('hidden');
      if (mermaidContainer) mermaidContainer.classList.add('hidden');
      if (terminalViewport) terminalViewport.classList.remove('hidden');
      if (window.initTerminalSession) window.initTerminalSession();
    } else if (tabName === 'mermaid') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.add('hidden');
      if (terminalViewport) terminalViewport.classList.add('hidden');
      if (mermaidContainer) mermaidContainer.classList.remove('hidden');
    } else {
      if (simViewport) simViewport.classList.add('hidden');
      if (terminalViewport) terminalViewport.classList.add('hidden');
      if (mermaidContainer) mermaidContainer.classList.add('hidden');
      if (outputBox) outputBox.classList.remove('hidden');
    }

    if (switchCallback) {
      switchCallback(tabName);
    }
  };
}

function createLogger(logsElement) {
  return {
    clear() {
      if (logsElement) logsElement.innerHTML = '';
    },
    log(msg, type = 'info') {
      if (!logsElement) return;
      const el = document.createElement('div');
      el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      logsElement.appendChild(el);
      logsElement.scrollTop = logsElement.scrollHeight;
    },
    info(msg) { this.log(msg, 'info'); },
    warn(msg) { this.log(msg, 'warn'); },
    error(msg) { this.log(msg, 'error'); }
  };
}

function copyToClipboard(text, btnElement) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text).then(() => {
    if (!btnElement) return;
    const originalText = btnElement.innerHTML;
    btnElement.innerHTML = '<span>✅ Copied!</span>';
    setTimeout(() => {
      btnElement.innerHTML = originalText;
    }, 1500);
  });
}

// Interactive Terminal Setup helper
function initTerminalSupport(slug, title) {
  const terminalInput = document.getElementById('terminal-input');
  const terminalLogs = document.getElementById('terminal-logs');
  
  if (!terminalInput || !terminalLogs) return;

  function appendLog(line, type = 'info') {
    const div = document.createElement('div');
    if (type === 'error') div.className = 'text-rose-500 font-bold';
    else if (type === 'warn') div.className = 'text-amber-400 font-bold';
    else if (type === 'success') div.className = 'text-emerald-400';
    else if (type === 'input') div.className = 'text-teal-300 font-bold';
    else div.className = 'text-slate-300';
    div.innerHTML = line;
    terminalLogs.appendChild(div);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  window.runTerminalCommand = function(cmd) {
    if (!cmd) return;
    cmd = cmd.trim();
    appendLog(`visitor@sre-studio:~$ ${cmd}`, 'input');
    
    setTimeout(() => {
      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd === 'clear') {
        terminalLogs.innerHTML = '';
        return;
      }
      if (lowerCmd === 'help') {
        appendLog('Available commands:<br>- <b>help</b>: Show available commands<br>- <b>docker compose up -d</b>: Start local infrastructure containers<br>- <b>bash scripts/validate.sh</b>: Run SRE environment validation tests<br>- <b>gh repo view</b>: Inspect current GitHub repository metadata<br>- <b>clear</b>: Clear the console screen');
        return;
      }
      if (lowerCmd.includes('docker compose up')) {
        appendLog('Creating network "tp-' + slug + '_default" with driver "bridge"...');
        setTimeout(() => appendLog('Pulling DB engine image... done'), 400);
        setTimeout(() => appendLog('Creating container tp-' + slug + '-db-1 ... done'), 800);
        setTimeout(() => appendLog('Creating container tp-' + slug + '-app-1 ... done'), 1200);
        setTimeout(() => appendLog('Container tp-' + slug + '-db-1 is running (healthy)', 'success'), 1600);
        return;
      }
      if (lowerCmd.includes('gh repo view')) {
        appendLog(`<b>Repository:</b> Pradeeptalari14/tp-${slug}`);
        appendLog(`<b>Title:</b> ${title}`);
        appendLog(`<b>Description:</b> SRE Developer Studio for dynamic template configuration.`);
        appendLog(`<b>Status:</b> Live and verified.`, 'success');
        return;
      }
      if (lowerCmd.includes('validate.sh')) {
        appendLog('🚀 Running scripts/validate.sh checks...');
        
        // Dynamic check of input elements in parent DOM
        setTimeout(() => {
          const apocEl = document.getElementById('apoc_enabled');
          const apocVal = apocEl ? apocEl.value : 'true';
          const providersEl = document.getElementById('embedding_model') || document.getElementById('vector_provider') || document.getElementById('kafka_provider');
          const providerVal = providersEl ? providersEl.value : 'default';

          if (apocVal === 'false') {
            appendLog('[FAIL] APOC plugins are disabled. Neo4j GraphRAG index queries require APOC functions.', 'error');
            appendLog('[FAIL] SRE compliance check failed.', 'error');
          } else if (slug === 'pinecone-serverless' && providerVal === 'default') {
            appendLog('[WARN] No custom vector dimensions set, defaulting index to 1536 (OpenAI).', 'warn');
            appendLog('✅ Operational validation check complete.', 'success');
          } else {
            appendLog('✅ Database node response: 200 OK', 'success');
            appendLog('✅ Configuration syntax validation: PASSED', 'success');
            appendLog(`✅ SRE compliance validation complete for ${slug}.`, 'success');
          }
        }, 1000);
        return;
      }
      
      appendLog(`bash: command not found: ${cmd}`, 'error');
    }, 200);
  };

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      window.runTerminalCommand(val);
    }
  });

  window.initTerminalSession = function() {
    if (terminalLogs.children.length <= 2) {
      appendLog(`SRE Validation CLI session initialized. Target workspace: ${slug}`);
      appendLog('Type <b>help</b> or click action buttons below to verify deployment configs.');
    }
  };
}

window.SreCore = {
  setupStudioTabs,
  createLogger,
  copyToClipboard,
  initTerminalSupport
};
