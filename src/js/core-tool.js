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

    if (tabName === 'simulator') {
      if (outputBox) outputBox.classList.add('hidden');
      if (simViewport) simViewport.classList.remove('hidden');
    } else {
      if (simViewport) simViewport.classList.add('hidden');
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

window.SreCore = {
  setupStudioTabs,
  createLogger,
  copyToClipboard
};
