/**
 * Shared SRE & DevOps Studio Helper Tools
 * Implements:
 * 1. Global LocalStorage state caching & auto-restoration
 * 2. Floating Online/Offline SRE metrics network status badge
 * 3. PagerDuty settings block and webhooks.json tab injection
 */

(function () {
  'use strict';

  const pathname = window.location.pathname;
  const storageKey = `tp-studio-${pathname}`;
  let isOutOfSync = false;

  // Utility helper
  const $ = (id) => document.getElementById(id);

  // 1. Inject PagerDuty Configuration Panel
  function injectPagerDutyUI() {
    if ($('pagerduty-config-block')) return;

    const pdBlock = document.createElement('div');
    pdBlock.id = 'pagerduty-config-block';
    pdBlock.className = 'border-t border-gray-100 pt-3 mt-4';
    pdBlock.innerHTML = `
      <h3 class="studio-title text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5" style="font-family: 'Space Grotesk', sans-serif;">
        <span>🚨</span> PagerDuty Alert Routing Settings
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="pd_integration_key" class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">PagerDuty Integration Key</label>
          <input type="text" id="pd_integration_key" class="form-input w-full p-2.5 text-xs" value="pd-service-key-prod-0129" />
        </div>
        <div>
          <label for="pd_webhook_url" class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Slack Webhook URL (Alert Channel)</label>
          <input type="text" id="pd_webhook_url" class="form-input w-full p-2.5 text-xs" value="https://hooks.slack.com/services/placeholder-slack-webhook-endpoint" />
        </div>
      </div>
      <div class="mt-2">
        <label for="pd_severity" class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Default Incident Severity</label>
        <select id="pd_severity" class="form-select w-full p-2.5 text-xs">
          <option value="critical">Critical (Immediate Page)</option>
          <option value="error">Error (High Severity)</option>
          <option value="warning">Warning (Low Severity/Ticket)</option>
          <option value="info">Info (Log Only)</option>
        </select>
      </div>
    `;

    // Attempt to locate optimal parent container (e.g. wizard step 4, 3, or first studio card)
    let target = $('step-panel-4') || $('step-panel-3') || $('step-panel-2') || $('step-panel-1');
    if (!target) {
      const cards = document.querySelectorAll('.studio-card');
      if (cards.length > 0) {
        target = cards[0];
      }
    }

    if (target) {
      const navFooter = target.querySelector('.pt-4, .pt-6, .flex-justify-end');
      if (navFooter) {
        target.insertBefore(pdBlock, navFooter);
      } else {
        target.appendChild(pdBlock);
      }
    }
  }

  // 2. Inject webhooks.json tab in the IDE file navbar
  function injectWebhookTab() {
    const tabContainer = document.querySelector('.tabs-scrollable') ||
                         (document.querySelector('.tab-btn') ? document.querySelector('.tab-btn').parentElement : null);
    if (!tabContainer) return;
    if ($('tab-webhooks')) return;

    const btn = document.createElement('button');
    btn.id = 'tab-webhooks';
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.innerHTML = '🚨 webhooks.json';

    btn.onclick = () => {
      // Deactivate all other tabs
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide custom visualization views if present
      const flowContainer = $('mermaid-container');
      if (flowContainer) flowContainer.classList.add('hidden');
      const sandboxContainer = $('sandbox-viewport');
      if (sandboxContainer) sandboxContainer.classList.add('hidden');

      // Load compiled webhook configuration payload into code view
      const outputBox = $('output-box');
      if (outputBox) {
        outputBox.classList.remove('hidden');

        const key = $('pd_integration_key')?.value || 'pd-service-key-prod-0129';
        const webhook = $('pd_webhook_url')?.value || 'https://hooks.slack.com/services/placeholder-slack-webhook-endpoint';
        const severity = $('pd_severity')?.value || 'critical';

        const payload = {
          "service": pathname.split('/').filter(Boolean).pop() || "devops-studio",
          "version": "1.0.0",
          "pagerduty": {
            "integration_key": key,
            "routing_key": key.substring(0, 10) + "-xxxx-xxxx",
            "severity_mapping": {
              "critical": severity === "critical" ? "trigger" : "acknowledge",
              "error": severity === "error" || severity === "critical" ? "trigger" : "acknowledge",
              "warning": severity === "warning" ? "acknowledge" : "resolve",
              "info": "resolve"
            }
          },
          "webhook_endpoints": [
            {
              "name": "slack-alerts",
              "url": webhook,
              "events": ["trigger", "resolve"],
              "format": "slack-summary"
            }
          ]
        };

        outputBox.textContent = JSON.stringify(payload, null, 2);
      }

      // Update IDE file header labels
      const fileNameInput = $('download-name-input');
      if (fileNameInput) fileNameInput.value = 'webhooks';
      const fileExtensionTag = $('file-extension-tag');
      if (fileExtensionTag) fileExtensionTag.textContent = '.json';
    };

    tabContainer.appendChild(btn);
  }

  // 3. Floating network status badge
  function injectNetworkStatusBadge() {
    if ($('sre-network-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'sre-network-badge';
    badge.className = 'sre-network-badge';
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      transition: all 0.3s ease;
      cursor: default;
    `;

    const navContainer = document.querySelector('.navbar > div');
    if (navContainer) {
      badge.style.marginLeft = 'auto';
      badge.style.marginRight = '1rem';
      // Insert right before navigation links
      const links = navContainer.querySelector('.hidden.sm\\:flex');
      if (links) {
        navContainer.insertBefore(badge, links);
      } else {
        navContainer.appendChild(badge);
      }
    } else {
      // Fallback to floating fixed badge
      badge.style.position = 'fixed';
      badge.style.bottom = '20px';
      badge.style.right = '20px';
      badge.style.zIndex = '1000';
      badge.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      document.body.appendChild(badge);
    }

    function updateBadge() {
      if (navigator.onLine) {
        badge.innerHTML = '🟢 SRE: Online';
        badge.style.background = 'rgba(16, 185, 129, 0.1)';
        badge.style.borderColor = '#10b981';
        badge.style.borderStyle = 'solid';
        badge.style.borderWidth = '1px';
        badge.style.color = '#10b981';
      } else {
        badge.innerHTML = '🟠 SRE: Offline (Cached mode)';
        badge.style.background = 'rgba(249, 115, 22, 0.1)';
        badge.style.borderColor = '#f97316';
        badge.style.borderStyle = 'solid';
        badge.style.borderWidth = '1px';
        badge.style.color = '#f97316';
      }
    }

    window.addEventListener('online', updateBadge);
    window.addEventListener('offline', updateBadge);
    updateBadge();
  }

  // 4. Save input config states to LocalStorage
  function saveState() {
    const state = {};
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.id && field.type !== 'button' && field.type !== 'submit') {
        if (field.type === 'checkbox') {
          state[field.id] = field.checked;
        } else {
          state[field.id] = field.value;
        }
      }
    });
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  // 5. Restore cached config states from LocalStorage
  function restoreState() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const state = JSON.parse(saved);

      Object.entries(state).forEach(([id, val]) => {
        const field = $(id);
        if (field) {
          if (field.type === 'checkbox') {
            field.checked = !!val;
          } else {
            field.value = val;
          }

          // Trigger change and input events to trigger compilation pipelines
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(field.type === 'checkbox' ? new Event('change', { bubbles: true }) : new Event('change', { bubbles: true }));
        }
      });
    } catch (e) {
      console.error("Failed to restore cached state:", e);
    }
  }

  // 6. Wrap window.switchTab to clean up webhook tab selection
  function wrapSwitchTab() {
    if (typeof window.switchTab === 'function' && !window.switchTab.__wrapped) {
      const original = window.switchTab;
      window.switchTab = function (tabId) {
        const pdTab = $('tab-webhooks');
        if (pdTab) pdTab.classList.remove('active');

        const fileExtensionTag = $('file-extension-tag');
        if (fileExtensionTag && tabId !== 'webhooks') {
          if (tabId === 'flow' || tabId === 'sandbox') {
            fileExtensionTag.textContent = '';
          } else if (tabId === 'script' || tabId === 'bash') {
            fileExtensionTag.textContent = '.sh';
          } else if (tabId === 'dockerfile') {
            fileExtensionTag.textContent = '';
          } else {
            const btn = $(`tab-${tabId}`);
            if (btn) {
              const txt = btn.textContent.toLowerCase();
              if (txt.includes('.')) {
                fileExtensionTag.textContent = '.' + txt.split('.').pop();
              } else {
                fileExtensionTag.textContent = '';
              }
            } else {
              fileExtensionTag.textContent = '.yaml';
            }
          }
        }

        original(tabId);
      };
      window.switchTab.__wrapped = true;
    }
  }

  // Initialize features on load
  function init() {
    injectPagerDutyUI();
    injectWebhookTab();
    injectNetworkStatusBadge();

    // Listen to changes for caching
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.id && field.type !== 'button' && field.type !== 'submit') {
        field.addEventListener('input', saveState);
        field.addEventListener('change', saveState);
      }
    });

    // Restore state and hook switchTab
    setTimeout(() => {
      restoreState();
      wrapSwitchTab();
    }, 150);

    // Keep trying to wrap switchTab in case generator loaded deferred
    let attempts = 0;
    const interval = setInterval(() => {
      wrapSwitchTab();
      attempts++;
      if (attempts > 10 || (window.switchTab && window.switchTab.__wrapped)) {
        clearInterval(interval);
      }
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
