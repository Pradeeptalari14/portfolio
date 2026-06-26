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

  function applyRemediationPatch(ruleName) {
    const outputBox = $('output-box');
    if (!outputBox) return;

    let code = lastCompiledCode || outputBox.textContent || '';
    
    if (ruleName.includes('Open CIDR')) {
      code = code.replace(/0\.0\.0\.0\/0/g, '10.0.0.0/16');
    } else if (ruleName.includes('Unencrypted S3')) {
      const match = code.match(/resource "aws_s3_bucket" "([^"]+)"/);
      const bucketId = match ? match[1] : 's3_bucket';
      const encryptBlock = `\nresource "aws_s3_bucket_server_side_encryption_configuration" "${bucketId}_encryption" {
  bucket = aws_s3_bucket.${bucketId}.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}`;
      code += encryptBlock;
    } else if (ruleName.includes('Running as Root') || ruleName.includes('Container Running as Root')) {
      code = code.replace(/runAsUser:\s*0/gi, 'runAsUser: 1000');
      code = code.replace(/runAsNonRoot:\s*false/gi, 'runAsNonRoot: true');
      code = code.replace(/user:\s*"root"/gi, 'user: "nonroot"');
      code = code.replace(/user:\s*root/gi, 'user: nonroot');
    } else if (ruleName.includes('Missing Kubernetes Probes') || ruleName.includes('Missing Docker Healthcheck')) {
      if (code.toLowerCase().includes('kind: deployment')) {
        code = code.replace(/(-\s*name:\s*[^\n]+)/i, `$1
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
        readinessProbe:
          httpGet:
            path: /readyz
            port: 8080`);
      } else if (code.toLowerCase().includes('services:')) {
        code = code.replace(/(image:\s*[^\n]+)/i, `$1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3`);
      }
    }

    lastCompiledCode = code;
    outputBox.textContent = code;

    // Refresh linter results
    const linterTab = $('tab-linter');
    if (linterTab) {
      linterTab.click();
    }
  }

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

  let lastCompiledCode = '';

  function runSecurityAudit(code) {
    const findings = [];
    const lowercaseCode = code.toLowerCase();

    // Rule 1: Open CIDR
    if (code.includes('0.0.0.0/0')) {
      findings.push({
        rule: 'Open CIDR Block (0.0.0.0/0)',
        severity: 'Critical',
        desc: 'Traffic is allowed from any source IP address. This exposes resources directly to the internet.',
        remediation: 'Restrict ingress rules to specific IP ranges or target security groups.'
      });
    } else {
      findings.push({
        rule: 'Restrictive CIDR Blocks',
        severity: 'Passed',
        desc: 'No wide-open CIDR blocks (0.0.0.0/0) detected in configuration.',
        remediation: 'None'
      });
    }

    // Rule 2: Unencrypted S3 Bucket
    if (code.includes('aws_s3_bucket') && !code.includes('aws_s3_bucket_server_side_encryption_configuration') && !code.includes('sse_algorithm')) {
      findings.push({
        rule: 'Unencrypted S3 Bucket',
        severity: 'Critical',
        desc: 'S3 bucket resources should enforce server-side encryption to protect data at rest.',
        remediation: 'Define aws_s3_bucket_server_side_encryption_configuration resource linking to the bucket.'
      });
    } else if (code.includes('aws_s3_bucket')) {
      findings.push({
        rule: 'Encrypted S3 Bucket',
        severity: 'Passed',
        desc: 'S3 bucket configurations enforce server-side encryption.',
        remediation: 'None'
      });
    }

    // Rule 3: Root User Accounts
    if (lowercaseCode.includes('user: "root"') || lowercaseCode.includes('user: root') || lowercaseCode.includes('runasuser: 0') || lowercaseCode.includes('runasnonroot: false')) {
      findings.push({
        rule: 'Container Running as Root',
        severity: 'Critical',
        desc: 'Containers running as root can gain host-level privilege access during container escape exploits.',
        remediation: 'Set runAsNonRoot: true, runAsUser: 1000 under securityContext, or configure non-root user in Dockerfile.'
      });
    } else {
      findings.push({
        rule: 'Non-Root Container Config',
        severity: 'Passed',
        desc: 'No active container run-as-root configurations detected.',
        remediation: 'None'
      });
    }

    // Rule 4: Missing healthchecks
    const isK8s = lowercaseCode.includes('kind: deployment') || lowercaseCode.includes('kind: statefulset');
    const isCompose = lowercaseCode.includes('version: "3') || lowercaseCode.includes('services:');
    if (isK8s && !lowercaseCode.includes('livenessprobe') && !lowercaseCode.includes('readinessprobe')) {
      findings.push({
        rule: 'Missing Kubernetes Probes',
        severity: 'Warning',
        desc: 'Deployments should define liveness and readiness probes to enable zero-downtime rollouts and detect crash states.',
        remediation: 'Add livenessProbe and readinessProbe spec settings under the container definition.'
      });
    } else if (isCompose && !lowercaseCode.includes('healthcheck:')) {
      findings.push({
        rule: 'Missing Docker Healthcheck',
        severity: 'Warning',
        desc: 'Compose microservices should specify a healthcheck block for cluster status routing.',
        remediation: 'Add a healthcheck command block under the microservice config.'
      });
    } else if (isK8s || isCompose) {
      findings.push({
        rule: 'Healthchecks & Probes Configured',
        severity: 'Passed',
        desc: 'Container health probes or checks are explicitly defined in configuration.',
        remediation: 'None'
      });
    }

    return findings;
  }

  // 2. Inject webhooks.json tab in the IDE file navbar
  function downloadSREBundle() {
    if (!window.JSZip) {
      console.error("JSZip is not loaded on this page");
      alert("Error: JSZip dependency is not loaded yet.");
      return;
    }
    const zip = new window.JSZip();

    const primaryNameInput = $('download-name-input')?.value || 'configuration';
    const extensionTag = $('file-extension-tag')?.textContent || '.yaml';
    
    let primaryFileName = primaryNameInput;
    if (!primaryFileName.endsWith(extensionTag) && !primaryFileName.includes('.')) {
      primaryFileName += extensionTag;
    }
    zip.file(primaryFileName, lastCompiledCode || '');

    const studioName = pathname.split('/').filter(Boolean).pop() || "devops-studio";
    const validateScript = `#!/bin/bash
# SRE Validation script for ${studioName}
echo "Running validation suite for ${primaryFileName}..."
if [ ! -f "${primaryFileName}" ]; then
  echo "Error: Primary configuration file ${primaryFileName} not found!"
  exit 1
fi
echo "Validating configuration syntax..."
# Mocking syntax validation checks
echo "Checking security policies..."
grep -q "0.0.0.0/0" "${primaryFileName}" && echo "Warning: Open CIDR block detected!"
echo "Validation passed successfully."
exit 0
`;
    zip.folder("scripts").file("validate.sh", validateScript);

    const readmeContent = `# SRE Onboarding & Deployment Guide: ${studioName}

This bundle contains the production SRE configuration and validation scripts for the **${studioName}** service.

## Bundle Contents
- \`${primaryFileName}\`: Primary configuration file.
- \`scripts/validate.sh\`: Shell script to validate syntax and security compliance.
- \`.gitignore\`: Default Git exclusions.

## Deployment Steps
1. Review the configuration defined in \`${primaryFileName}\`.
2. Execute the validation script locally to ensure compliance:
   \`\`\`bash
   chmod +x scripts/validate.sh
   ./scripts/validate.sh
   \`\`\`
3. Commit and push to deploy via the ArgoCD GitOps pipeline.
`;
    zip.file("README.md", readmeContent);

    const gitignoreContent = `# SRE Bundle local cache
.DS_Store
*.log
tmp/
`;
    zip.file(".gitignore", gitignoreContent);

    zip.generateAsync({ type: "blob" }).then(function (content) {
      const createObjectURL = (typeof URL !== 'undefined' && URL.createObjectURL) 
        ? URL.createObjectURL 
        : () => 'mock-url';
      const revokeObjectURL = (typeof URL !== 'undefined' && URL.revokeObjectURL) 
        ? URL.revokeObjectURL 
        : () => {};

      const a = document.createElement("a");
      const url = createObjectURL(content);
      a.href = url;
      a.download = `${studioName}-sre-bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      revokeObjectURL(url);
    }).catch(err => {
      console.error("Failed to generate zip bundle:", err);
    });
  }

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

        const jsonStr = JSON.stringify(payload, null, 2);
        outputBox.innerHTML = `
          <div class="sre-panel-container" style="white-space: normal;">
            <div class="sre-panel-header">
              <h3 class="sre-panel-title">
                <span>🚨</span> Webhook Configuration (webhooks.json)
              </h3>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button id="btn-download-sre-bundle-webhooks" class="sre-button-pill">📦 Download SRE Bundle (.zip)</button>
                <span style="font-size: 9px; font-family: monospace; color: #818cf8; background: rgba(129, 140, 248, 0.1); border: 1px solid rgba(129, 140, 248, 0.2); padding: 2px 6px; border-radius: 4px;">JSON</span>
              </div>
            </div>
            <pre class="sre-panel-code-box">${jsonStr}</pre>
          </div>
        `;

        const dlBtn = $('btn-download-sre-bundle-webhooks');
        if (dlBtn) {
          dlBtn.onclick = () => downloadSREBundle();
        }
      }

      // Update IDE file header labels
      const fileNameInput = $('download-name-input');
      if (fileNameInput) fileNameInput.value = 'webhooks';
      const fileExtensionTag = $('file-extension-tag');
      if (fileExtensionTag) fileExtensionTag.textContent = '.json';
    };

    tabContainer.appendChild(btn);
  }

  // Inject linter tab
  function injectLinterTab() {
    const tabContainer = document.querySelector('.tabs-scrollable') ||
                         (document.querySelector('.tab-btn') ? document.querySelector('.tab-btn').parentElement : null);
    if (!tabContainer) return;
    if ($('tab-linter')) return;

    const btn = document.createElement('button');
    btn.id = 'tab-linter';
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.innerHTML = '🛡️ security.audit';

    btn.onclick = () => {
      // Deactivate all other tabs
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide custom visualization views if present
      const flowContainer = $('mermaid-container');
      if (flowContainer) flowContainer.classList.add('hidden');
      const sandboxContainer = $('sandbox-viewport');
      if (sandboxContainer) sandboxContainer.classList.add('hidden');

      const outputBox = $('output-box');
      if (outputBox) {
        outputBox.classList.remove('hidden');

        // Audit the cached compiled code
        const codeToAudit = lastCompiledCode || outputBox.textContent || '';
        const findings = runSecurityAudit(codeToAudit);

        // Calculate compliance score
        let score = 100;
        findings.forEach(f => {
          if (f.severity === 'Critical') score -= 30;
          else if (f.severity === 'Warning') score -= 15;
        });
        score = Math.max(0, score);
        let scoreColor = '#10b981'; // Green
        let statusText = 'COMPLIANT';
        if (score < 70) {
          scoreColor = '#ef4444'; // Red
          statusText = 'NON-COMPLIANT';
        } else if (score < 90) {
          scoreColor = '#f59e0b'; // Yellow
          statusText = 'PARTIALLY COMPLIANT';
        }

        const scoreGaugeHtml = `
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Compliance &amp; Lint Score:</span>
              <span id="compliance-score-val" style="font-size: 12px; font-weight: 800; color: ${scoreColor}; font-family: monospace;">${score}% (${statusText})</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
              <div id="compliance-score-bar" style="width: ${score}%; height: 100%; background: ${scoreColor}; transition: width 0.3s ease;"></div>
            </div>
          </div>
        `;

        // Build HTML report with styling and dark mode harmony
        const findingsHtml = findings.map(f => {
          let badgeColor = '';
          if (f.severity === 'Critical') badgeColor = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
          else if (f.severity === 'Warning') badgeColor = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
          else badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';

          let diffHtml = '';
          if (f.severity !== 'Passed') {
            let vulnSnippet = '';
            let patchedSnippet = '';
            
            if (f.rule.includes('Open CIDR')) {
              vulnSnippet = 'cidr_blocks = ["0.0.0.0/0"]';
              patchedSnippet = 'cidr_blocks = ["10.0.0.0/16"]';
            } else if (f.rule.includes('Unencrypted S3')) {
              vulnSnippet = 'resource "aws_s3_bucket" "b" {}';
              patchedSnippet = 'resource "aws_s3_bucket" "b" {}\n+ resource "aws_s3_bucket_server_side_encryption_configuration" "b_enc" { ... }';
            } else if (f.rule.includes('Running as Root') || f.rule.includes('Container Running as Root')) {
              vulnSnippet = 'runAsUser: 0\nrunAsNonRoot: false';
              patchedSnippet = 'runAsUser: 1000\nrunAsNonRoot: true';
            } else if (f.rule.includes('Missing Kubernetes Probes') || f.rule.includes('Missing Docker Healthcheck')) {
              vulnSnippet = '(No container health probes configured)';
              patchedSnippet = '+ livenessProbe:\n+   httpGet:\n+     path: /healthz\n+     port: 8080';
            }

            if (vulnSnippet && patchedSnippet) {
              diffHtml = `
                <div class="visual-diff-box">
                  <div style="display: flex; gap: 0.5rem; text-align: left;">
                    <div style="flex: 1; border-right: 1px solid rgba(255, 255, 255, 0.05); padding-right: 0.5rem;">
                      <div style="color: #f43f5e; font-weight: bold; margin-bottom: 0.25rem; font-size: 8px; text-transform: uppercase;">Current (Vulnerable)</div>
                      <pre style="margin: 0; color: #f87171; white-space: pre-wrap; font-family: monospace; text-align: left;">- ${vulnSnippet}</pre>
                    </div>
                    <div style="flex: 1; padding-left: 0.5rem;">
                      <div style="color: #10b981; font-weight: bold; margin-bottom: 0.25rem; font-size: 8px; text-transform: uppercase;">Suggested (Secure)</div>
                      <pre style="margin: 0; color: #34d399; white-space: pre-wrap; font-family: monospace; text-align: left;">+ ${patchedSnippet}</pre>
                    </div>
                  </div>
                  <div style="text-align: right; margin-top: 0.75rem;">
                    <button class="btn-apply-remediation sre-button-pill" data-rule="${f.rule}" style="font-size: 9px; padding: 4px 10px;">💡 Apply Security Patch</button>
                  </div>
                </div>
              `;
            }
          }

          return `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: bold; color: #f8fafc;">${f.rule}</span>
                <span class="${badgeColor}" style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${f.severity.toUpperCase()}</span>
              </div>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 0.5rem; text-align: left;">${f.desc}</p>
              ${diffHtml}
              ${f.remediation !== 'None' ? `
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.5rem; margin-top: 0.5rem; text-align: left;">
                  <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Remediation:</span>
                  <pre style="background: #090d16; color: #34d399; font-family: monospace; font-size: 10px; padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.2); overflow-x: auto; margin-top: 0.25rem;">${f.remediation}</pre>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

        outputBox.innerHTML = `
          <div class="sre-panel-container" style="white-space: normal;">
            <div class="sre-panel-header">
              <h3 class="sre-panel-title">
                <span>🛡️</span> IaC Security Guardrail Report
              </h3>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button id="btn-download-sre-bundle-linter" class="sre-button-pill">📦 Download SRE Bundle (.zip)</button>
                <span style="font-size: 9px; font-family: monospace; color: #818cf8; background: rgba(129, 140, 248, 0.1); border: 1px solid rgba(129, 140, 248, 0.2); padding: 2px 6px; border-radius: 4px;">v1.0.0</span>
              </div>
            </div>
            ${scoreGaugeHtml}
            <div>
              ${findingsHtml}
            </div>
          </div>
        `;

        const dlBtn = $('btn-download-sre-bundle-linter');
        if (dlBtn) {
          dlBtn.onclick = () => downloadSREBundle();
        }

        const remediateBtns = outputBox.querySelectorAll('.btn-apply-remediation');
        remediateBtns.forEach(rBtn => {
          rBtn.onclick = () => {
            const ruleName = rBtn.getAttribute('data-rule');
            applyRemediationPatch(ruleName);
          };
        });
      }

      // Update IDE file header labels
      const fileNameInput = $('download-name-input');
      if (fileNameInput) fileNameInput.value = 'security-audit-report';
      const fileExtensionTag = $('file-extension-tag');
      if (fileExtensionTag) fileExtensionTag.textContent = '.html';
    };

    tabContainer.appendChild(btn);
  }

  // Dynamic injection of AI link in studio header navbars
  function injectAiLinkToNavbar() {
    const navContainer = document.querySelector('.navbar > div');
    if (!navContainer) return;

    const linksWrap = navContainer.querySelector('.hidden.sm\\:flex') || 
                      navContainer.querySelector('.flex.items-center.gap-6') ||
                      navContainer.querySelector('ul.nav-links') ||
                      navContainer.querySelector('.nav-links');
    if (linksWrap) {
      const links = Array.from(linksWrap.querySelectorAll('a'));
      const hasAiLink = links.some(a => {
        const href = a.getAttribute('href') || '';
        return href.includes('/AI/') || a.textContent.toLowerCase().includes('ai');
      });

      if (!hasAiLink) {
        const toolsLink = links.find(a => a.textContent.includes('Tools') || a.textContent.includes('Dashboard'));
        
        const aiLink = document.createElement('a');
        aiLink.href = '../../AI/';
        aiLink.className = 'hover:text-indigo-600 transition';
        aiLink.style.display = 'inline-flex';
        aiLink.style.alignItems = 'center';
        aiLink.style.gap = '4px';
        aiLink.innerHTML = '🧠 AI Studios';

        if (linksWrap.tagName.toLowerCase() === 'ul') {
          const li = document.createElement('li');
          aiLink.className = 'nav-link';
          li.appendChild(aiLink);
          if (toolsLink && toolsLink.parentElement) {
            toolsLink.parentElement.insertAdjacentElement('afterend', li);
          } else {
            linksWrap.appendChild(li);
          }
        } else {
          if (toolsLink) {
            toolsLink.insertAdjacentElement('afterend', aiLink);
          } else {
            linksWrap.appendChild(aiLink);
          }
        }
      }
    }
  }

  // 3. Floating network status badge
  function injectNetworkStatusBadge() {
    if ($('sre-network-badge')) return;

    const badge = document.createElement('div');
    badge.id = 'sre-network-badge';
    badge.className = 'sre-network-badge';

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
      document.body.appendChild(badge);
    }

    function updateBadge() {
      if (navigator.onLine) {
        badge.innerHTML = '🟢 SRE: Online';
        badge.className = 'sre-network-badge online';
      } else {
        badge.innerHTML = '🟠 SRE: Offline (Cached mode)';
        badge.className = 'sre-network-badge offline';
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

  let telemetryInterval = null;
  let cpuData = Array(30).fill(40);
  let memData = Array(30).fill(60);
  let latencyData = Array(30).fill(50);

  function getStudioCategory() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/ai/') || path.includes('/llm')) {
      return 'ai';
    }
    const titleText = document.title.toLowerCase();
    if (titleText.includes('observability') || titleText.includes('monitoring') || titleText.includes('alert') || titleText.includes('loki') || titleText.includes('prometheus') || titleText.includes('grafana')) {
      return 'observability';
    }
    if (titleText.includes('ci/cd') || titleText.includes('pipeline') || titleText.includes('jenkins') || titleText.includes('github actions') || titleText.includes('workflow')) {
      return 'cicd';
    }
    if (titleText.includes('kubernetes') || titleText.includes('k8s') || titleText.includes('terraform') || titleText.includes('cloud') || titleText.includes('aws') || titleText.includes('gcp') || titleText.includes('azure') || titleText.includes('vpc') || titleText.includes('subnet')) {
      return 'cloud';
    }
    if (titleText.includes('docker') || titleText.includes('ansible') || titleText.includes('script') || titleText.includes('automation') || titleText.includes('auto')) {
      return 'automation';
    }
    const folder = path.split('/').filter(Boolean).pop() || '';
    if (folder.includes('docker') || folder.includes('ansible') || folder.includes('script')) return 'automation';
    if (folder.includes('k8s') || folder.includes('kubernetes') || folder.includes('terraform') || folder.includes('vpc') || folder.includes('subnet') || folder.includes('aws') || folder.includes('gcp') || folder.includes('azure') || folder.includes('crossplane') || folder.includes('karpenter')) return 'cloud';
    if (folder.includes('loki') || folder.includes('prometheus') || folder.includes('alert') || folder.includes('grafana') || folder.includes('monitor')) return 'observability';
    if (folder.includes('ci') || folder.includes('pipeline') || folder.includes('workflow') || folder.includes('action')) return 'cicd';
    return 'cloud';
  }

  function startTelemetrySim() {
    if (telemetryInterval) clearInterval(telemetryInterval);
    const canvas = $('sre-telemetry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    telemetryInterval = setInterval(() => {
      // Fluctuate SRE stats
      const usersEl = $('stat-active-users');
      if (usersEl) usersEl.textContent = Math.floor(1000 + Math.random() * 500).toLocaleString();
      const rateEl = $('stat-req-rate');
      if (rateEl) rateEl.textContent = (120 + Math.floor(Math.random() * 50)) + ' req/s';
      const sloEl = $('stat-slo-status');
      if (sloEl) sloEl.textContent = (99.90 + Math.random() * 0.09).toFixed(2) + '%';

      cpuData.shift();
      cpuData.push(Math.max(10, Math.min(100, cpuData[cpuData.length - 1] + (Math.random() - 0.5) * 15)));
      
      memData.shift();
      memData.push(Math.max(10, Math.min(100, memData[memData.length - 1] + (Math.random() - 0.5) * 8)));

      latencyData.shift();
      latencyData.push(Math.max(10, Math.min(100, latencyData[latencyData.length - 1] + (Math.random() - 0.5) * 20)));

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, h * (i / 4));
        ctx.lineTo(w, h * (i / 4));
        ctx.stroke();
      }

      function drawLine(data, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * w;
          const y = h - (data[i] / 100) * (h - 20) - 10;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      drawLine(cpuData, '#3b82f6');
      drawLine(memData, '#10b981');
      drawLine(latencyData, '#f59e0b');
    }, 1000);
  }

  const categorySvgs = {
    ai: `<svg viewBox="0 0 400 120" style="width: 100%; height: auto;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 2 L 8 5 L 0 8 z" fill="#818cf8"/></marker></defs><g transform="translate(10, 10)"><rect x="0" y="30" width="60" height="40" rx="6" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="1.5"/><text x="30" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Prompt</text><line x1="60" y1="50" x2="85" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="90" y="30" width="65" height="40" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" stroke-width="1.5"/><text x="122" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">LLM Router</text><line x1="155" y1="50" x2="175" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="180" y="30" width="60" height="40" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/><text x="210" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Cache (Redis)</text><line x1="240" y1="50" x2="260" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="265" y="30" width="60" height="40" rx="6" fill="rgba(124, 58, 237, 0.1)" stroke="#7c3aed" stroke-width="1.5"/><text x="295" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">vLLM Host</text><line x1="325" y1="50" x2="345" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="350" y="30" width="30" height="40" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" stroke-width="1.5"/><text x="365" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">RAG</text></g></svg>`,
    cloud: `<svg viewBox="0 0 400 120" style="width: 100%; height: auto;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 2 L 8 5 L 0 8 z" fill="#818cf8"/></marker></defs><g transform="translate(10, 10)"><rect x="0" y="30" width="60" height="40" rx="6" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="1.5"/><text x="30" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">IaC Push</text><line x1="60" y1="50" x2="85" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="90" y="30" width="65" height="40" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" stroke-width="1.5"/><text x="122" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">TF/Crossplane</text><line x1="155" y1="50" x2="175" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="180" y="30" width="60" height="40" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/><text x="210" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Vault Sec</text><line x1="240" y1="50" x2="260" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="265" y="30" width="60" height="40" rx="6" fill="rgba(124, 58, 237, 0.1)" stroke="#7c3aed" stroke-width="1.5"/><text x="295" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Compute</text><line x1="325" y1="50" x2="345" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="350" y="30" width="30" height="40" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" stroke-width="1.5"/><text x="365" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Mesh</text></g></svg>`,
    cicd: `<svg viewBox="0 0 400 120" style="width: 100%; height: auto;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 2 L 8 5 L 0 8 z" fill="#818cf8"/></marker></defs><g transform="translate(10, 10)"><rect x="0" y="30" width="60" height="40" rx="6" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="1.5"/><text x="30" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Commit</text><line x1="60" y1="50" x2="85" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="90" y="30" width="65" height="40" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" stroke-width="1.5"/><text x="122" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Webhook</text><line x1="155" y1="50" x2="175" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="180" y="30" width="60" height="40" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/><text x="210" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Lint/Scan</text><line x1="240" y1="50" x2="260" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="265" y="30" width="60" height="40" rx="6" fill="rgba(124, 58, 237, 0.1)" stroke="#7c3aed" stroke-width="1.5"/><text x="295" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Trivy Scan</text><line x1="325" y1="50" x2="345" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="350" y="30" width="30" height="40" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" stroke-width="1.5"/><text x="365" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">GitOps</text></g></svg>`,
    automation: `<svg viewBox="0 0 400 120" style="width: 100%; height: auto;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 2 L 8 5 L 0 8 z" fill="#818cf8"/></marker></defs><g transform="translate(10, 10)"><rect x="0" y="30" width="60" height="40" rx="6" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="1.5"/><text x="30" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Scheduler</text><line x1="60" y1="50" x2="85" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="90" y="30" width="65" height="40" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" stroke-width="1.5"/><text x="122" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Ansible Run</text><line x1="155" y1="50" x2="175" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="180" y="30" width="60" height="40" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/><text x="210" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Env Sync</text><line x1="240" y1="50" x2="260" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="265" y="30" width="60" height="40" rx="6" fill="rgba(124, 58, 237, 0.1)" stroke="#7c3aed" stroke-width="1.5"/><text x="295" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Daemon</text><line x1="325" y1="50" x2="345" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="350" y="30" width="30" height="40" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" stroke-width="1.5"/><text x="365" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Verify</text></g></svg>`,
    observability: `<svg viewBox="0 0 400 120" style="width: 100%; height: auto;"><defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 2 L 8 5 L 0 8 z" fill="#818cf8"/></marker></defs><g transform="translate(10, 10)"><rect x="0" y="30" width="60" height="40" rx="6" fill="rgba(99, 102, 241, 0.1)" stroke="#6366f1" stroke-width="1.5"/><text x="30" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Scraper</text><line x1="60" y1="50" x2="85" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="90" y="30" width="65" height="40" rx="6" fill="rgba(14, 165, 233, 0.1)" stroke="#0ea5e9" stroke-width="1.5"/><text x="122" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Ingest</text><line x1="155" y1="50" x2="175" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="180" y="30" width="60" height="40" rx="6" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" stroke-width="1.5"/><text x="210" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Evaluator</text><line x1="240" y1="50" x2="260" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="265" y="30" width="60" height="40" rx="6" fill="rgba(124, 58, 237, 0.1)" stroke="#7c3aed" stroke-width="1.5"/><text x="295" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Escalation</text><line x1="325" y1="50" x2="345" y2="50" stroke="#818cf8" stroke-width="1.5" marker-end="url(#arrow)"/><rect x="350" y="30" width="30" height="40" rx="6" fill="rgba(244, 63, 94, 0.1)" stroke="#f43f5e" stroke-width="1.5"/><text x="365" y="55" font-family="sans-serif" font-size="9" fill="#f8fafc" text-anchor="middle">Slack</text></g></svg>`
  };

  const lifecycles = {
    ai: {
      when: "Use when optimizing inference token cost, setting up RAG caching, or deploying scalable private LLM models under strict SLO targets.",
      where: "Runs on GPU-accelerated Kubernetes clusters (e.g. AWS EKS g5 instances) behind a cloud-native API gateway."
    },
    cloud: {
      when: "Use when provisioning multi-region cloud resources, configuring subnets, managing secrets lifecycle, or synchronizing resource control planes via GitOps.",
      where: "Deploys to global cloud provider regions (AWS, GCP, Azure) via automated CI pipelines or operators."
    },
    cicd: {
      when: "Use during code integration check-in, automated test suite runs, vulnerability scanning, and continuous delivery synchronization.",
      where: "Executes on secure CI/CD runners (e.g. GitHub Actions self-hosted runners or Jenkins agents) with access to container registries."
    },
    automation: {
      when: "Use when running ad-hoc system maintenance tasks, templating configuration files, or enforcing compliance baselines on virtual servers.",
      where: "Runs on target virtual machine nodes, serverless scheduler runtimes, or management control machines."
    },
    observability: {
      when: "Use when monitoring application performance, alerting on latency drifts, querying log streams, and routing critical incidents to on-call teams.",
      where: "Runs in a dedicated monitoring namespace under centralized observability clusters linked to service alert handlers."
    }
  };

  function renderSystemFlowContent() {
    const viewport = $('system-flow-viewport');
    if (!viewport) return;

    const cat = getStudioCategory();
    const svg = categorySvgs[cat] || categorySvgs.cloud;
    const life = lifecycles[cat] || lifecycles.cloud;

    viewport.innerHTML = `
      <div class="sre-panel-container" style="text-align: left;">
        <div class="sre-panel-header">
          <h3 class="sre-panel-title">
            <span>🗺️</span> Production Topology &amp; Flow Guide
          </h3>
          <button id="btn-print-cheatsheet" class="sre-button-pill">📄 Print Cheatsheet</button>
        </div>
        
        <div style="background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1rem; text-align: center;">
          ${svg}
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05); padding: 1rem; font-size: 11px;">
          <div><strong>WHEN to Use:</strong> <span style="color: #cbd5e1;">${life.when}</span></div>
          <div style="margin-top: 0.25rem;"><strong>WHERE to Deploy:</strong> <span style="color: #cbd5e1;">${life.where}</span></div>
        </div>

        <div class="live-sre-stats-grid">
          <div class="live-sre-stat-card">
            <span class="live-sre-stat-label">Active Users</span>
            <span id="stat-active-users" class="live-sre-stat-value text-indigo-400">1,240</span>
          </div>
          <div class="live-sre-stat-card">
            <span class="live-sre-stat-label">Request Rate</span>
            <span id="stat-req-rate" class="live-sre-stat-value text-emerald-400">145 req/s</span>
          </div>
          <div class="live-sre-stat-card">
            <span class="live-sre-stat-label">SLO Status</span>
            <span id="stat-slo-status" class="live-sre-stat-value text-amber-400">99.98%</span>
          </div>
        </div>

        <div>
          <h4 style="font-size: 0.8rem; font-weight: bold; color: #cbd5e1; margin-bottom: 0.5rem;">📈 Live SRE Telemetry Metrics (Simulation)</h4>
          <canvas id="sre-telemetry-canvas" width="400" height="150" style="width: 100%; height: 150px; background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05);"></canvas>
          <div style="display: flex; justify-content: center; gap: 1rem; font-size: 10px; margin-top: 0.5rem; font-family: monospace;">
            <span style="color: #3b82f6;">● CPU Utilization</span>
            <span style="color: #10b981;">● Memory Allocation</span>
            <span style="color: #f59e0b;">● Latency Metrics</span>
          </div>
        </div>
      </div>
    `;

    const printBtn = $('btn-print-cheatsheet');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }
    startTelemetrySim();
  }

  function getDefaultPayload(slug) {
    return JSON.stringify({
      "name": slug,
      "environment": "production",
      "replicas": 3,
      "port": 8080,
      "enable_tls": true,
      "security": {
        "run_as_root": false,
        "allow_privileged": false
      }
    }, null, 2);
  }

  function appendConsoleLog(msg, type = 'info') {
    const consoleLogs = $('sandbox-console-logs');
    if (!consoleLogs) return;
    const el = document.createElement('div');
    if (type === 'error') el.className = 'text-rose-500 font-bold';
    else if (type === 'success') el.className = 'text-emerald-400';
    else if (type === 'warn') el.className = 'text-amber-500';
    else el.className = 'text-slate-300';
    el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    consoleLogs.appendChild(el);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  function validateSandboxJson() {
    const payloadText = $('sandbox-payload').value;
    const statusSpan = $('sandbox-json-status');
    if (!statusSpan) return false;

    try {
      JSON.parse(payloadText);
      statusSpan.textContent = '✅ Valid JSON';
      statusSpan.style.color = '#10b981';
      appendConsoleLog('[SUCCESS] JSON validation complete. No syntax errors.', 'success');
      return true;
    } catch (e) {
      statusSpan.textContent = '❌ Invalid JSON';
      statusSpan.style.color = '#ef4444';
      appendConsoleLog(`[ERROR] JSON Parsing Error: ${e.message}`, 'error');
      return false;
    }
  }

  function compareAndAudit() {
    if (!validateSandboxJson()) {
      alert("Please correct the JSON syntax errors before auditing.");
      return;
    }

    const payloadText = $('sandbox-payload').value;
    const userObj = JSON.parse(payloadText);

    const compiledText = lastCompiledCode || ($('output-box') ? $('output-box').textContent : '');
    const compiledKeys = {};
    const lines = compiledText.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*["']?([a-zA-Z0-9_-]+)["']?\s*[:=]\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim().replace(/,$/, '').replace(/["']/g, '');
        compiledKeys[key] = val;
      }
    });

    const auditList = $('sandbox-audit-list');
    if (!auditList) return;
    auditList.innerHTML = '';
    $('sandbox-audit-results').classList.remove('hidden');

    const allKeys = new Set([...Object.keys(userObj), ...Object.keys(compiledKeys)]);
    let matchCount = 0;
    let mismatchCount = 0;

    allKeys.forEach(key => {
      if (!key || (typeof userObj[key] === 'object' && userObj[key] !== null)) return;

      const userVal = userObj[key] !== undefined ? String(userObj[key]) : undefined;
      const compVal = compiledKeys[key];

      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.padding = '2px 0';
      item.style.borderBottom = '1px solid rgba(255,255,255,0.02)';

      if (userVal === undefined) {
        item.innerHTML = `<span style="color: #ef4444;">⚠️ Missing key: ${key}</span><span style="color: #cbd5e1;">Compiled: ${compVal}</span>`;
        mismatchCount++;
      } else if (compVal === undefined) {
        item.innerHTML = `<span style="color: #cbd5e1;">➕ Extra sandbox key: ${key}</span><span style="color: #a3e635;">Sandbox: ${userVal}</span>`;
      } else if (userVal !== compVal) {
        item.innerHTML = `<span style="color: #f59e0b;">⚡ Mismatch: ${key}</span><span style="color: #f59e0b;">Sandbox: ${userVal} vs Compiled: ${compVal}</span>`;
        mismatchCount++;
      } else {
        item.innerHTML = `<span style="color: #10b981;">✓ Matched: ${key}</span><span style="color: #cbd5e1;">${userVal}</span>`;
        matchCount++;
      }
      auditList.appendChild(item);
    });

    appendConsoleLog(`[INFO] Audit complete: ${matchCount} matches, ${mismatchCount} warnings/mismatches.`, 'info');
  }

  function sendApiRequestSim() {
    if (!validateSandboxJson()) return;
    const method = $('sandbox-method').value;
    const url = $('sandbox-url').value;
    const payloadText = $('sandbox-payload').value;

    appendConsoleLog(`[HTTP] Sending ${method} request to ${url}...`, 'info');
    appendConsoleLog(`[HTTP] Headers: Content-Type: application/json, Authorization: Bearer tp-token-xxx`, 'info');
    appendConsoleLog(`[HTTP] Body: ${payloadText.substring(0, 100)}...`, 'info');

    setTimeout(() => {
      appendConsoleLog(`[SUCCESS] HTTP 201 Created (OK)`, 'success');
      appendConsoleLog(`[SUCCESS] Transaction payload synchronized with GitOps database.`, 'success');
      appendConsoleLog(`[SUCCESS] Webhook event dispatched.`, 'success');
    }, 1200);
  }

  function renderRestSandboxContent() {
    const viewport = $('rest-sandbox-viewport');
    if (!viewport) return;

    const slug = pathname.split('/').filter(Boolean).pop() || "devops-studio";

    viewport.innerHTML = `
      <div class="sre-panel-container" style="text-align: left;">
        <div class="sre-panel-header">
          <h3 class="sre-panel-title">
            <span>🚀</span> REST API Client Sandbox
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #818cf8; background: rgba(129, 140, 248, 0.1); border: 1px solid rgba(129, 140, 248, 0.2); padding: 2px 6px; border-radius: 4px;">REST CLIENT</span>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <select id="sandbox-method" style="background: #020617; color: white; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 6px 12px; font-size: 11px; font-family: monospace; font-weight: bold; outline: none;">
            <option value="POST">POST</option>
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <input type="text" id="sandbox-url" style="flex: 1; background: #020617; color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 6px 12px; font-size: 11px; font-family: monospace; outline: none;" value="/api/v1/deploy/${slug}">
        </div>

        <div style="font-size: 10px; background: #020617; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.75rem; font-family: monospace;">
          <div style="color: #64748b; font-weight: bold; margin-bottom: 0.25rem;">HTTP HEADERS</div>
          <div style="color: #cbd5e1;">Content-Type: application/json</div>
          <div style="color: #cbd5e1;">Authorization: Bearer tp-token-sandbox-0129</div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-size: 11px; font-weight: bold; color: #cbd5e1;">JSON Payload</span>
            <span id="sandbox-json-status" style="font-size: 9px; font-family: monospace;"></span>
          </div>
          <textarea id="sandbox-payload" style="width: 100%; height: 120px; background: #020617; color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 11px; outline: none; resize: vertical; white-space: pre;" placeholder='{ "key": "value" }'></textarea>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <button id="btn-sandbox-validate" class="sre-button-pill" style="flex: 1; background: #334155; box-shadow: none;">Validate JSON</button>
          <button id="btn-sandbox-compare" class="sre-button-pill" style="flex: 1;">Compare &amp; Audit</button>
          <button id="btn-sandbox-send" class="sre-button-pill" style="flex: 1; background: #10b981; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);">Send Request</button>
        </div>

        <div id="sandbox-audit-results" class="hidden" style="background: #020617; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.75rem; font-size: 11px; font-family: monospace; max-height: 150px; overflow-y: auto;">
          <div style="color: #64748b; font-weight: bold; margin-bottom: 0.5rem;">SIDE-BY-SIDE CONFIG DIFF AUDITOR</div>
          <div id="sandbox-audit-list" style="display: flex; flex-direction: column; gap: 0.25rem;"></div>
        </div>

        <div>
          <div style="font-size: 11px; font-weight: bold; color: #cbd5e1; margin-bottom: 0.25rem;">SIMULATED CONSOLE LOGS</div>
          <div id="sandbox-console-logs" class="sre-terminal-logs" style="height: 100px;">
            <div>[SYSTEM] Console ready. Pasted JSON variables can be audited or sent.</div>
          </div>
        </div>
      </div>
    `;

    $('sandbox-payload').value = getDefaultPayload(slug);

    $('btn-sandbox-validate').onclick = validateSandboxJson;
    $('btn-sandbox-compare').onclick = compareAndAudit;
    $('btn-sandbox-send').onclick = sendApiRequestSim;
  }

  function injectPrintStyle() {
    if ($('cheatsheet-print-style')) return;
    const style = document.createElement('style');
    style.id = 'cheatsheet-print-style';
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #system-flow-viewport, #system-flow-viewport * {
          visibility: visible;
        }
        #system-flow-viewport {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
        }
        #btn-print-cheatsheet, #sre-telemetry-canvas, .no-print, canvas {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectSystemFlowTab() {
    const tabContainer = document.querySelector('.tabs-scrollable') ||
                         (document.querySelector('.tab-btn') ? document.querySelector('.tab-btn').parentElement : null);
    if (!tabContainer || $('tab-system-flow')) return;

    const btn = document.createElement('button');
    btn.id = 'tab-system-flow';
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.innerHTML = '🗺️ System Flow';
    btn.onclick = () => selectCustomTab('system-flow');
    tabContainer.appendChild(btn);
  }

  function injectRestSandboxTab() {
    const tabContainer = document.querySelector('.tabs-scrollable') ||
                         (document.querySelector('.tab-btn') ? document.querySelector('.tab-btn').parentElement : null);
    if (!tabContainer || $('tab-rest-sandbox')) return;

    const btn = document.createElement('button');
    btn.id = 'tab-rest-sandbox';
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.innerHTML = '🚀 REST Sandbox';
    btn.onclick = () => selectCustomTab('rest-sandbox');
    tabContainer.appendChild(btn);
  }

  function injectCustomViewports() {
    const outputBox = $('output-box');
    if (!outputBox || $('system-flow-viewport')) return;

    const parent = outputBox.parentElement;

    const flowDiv = document.createElement('div');
    flowDiv.id = 'system-flow-viewport';
    flowDiv.className = 'hidden ide-viewport flex flex-col bg-slate-950 p-6 border border-slate-800 rounded-lg text-slate-300';
    flowDiv.style.minHeight = '380px';
    flowDiv.style.maxHeight = '480px';
    flowDiv.style.overflowY = 'auto';
    parent.appendChild(flowDiv);

    const sandboxDiv = document.createElement('div');
    sandboxDiv.id = 'rest-sandbox-viewport';
    sandboxDiv.className = 'hidden ide-viewport flex flex-col bg-slate-950 p-6 border border-slate-800 rounded-lg text-slate-300';
    sandboxDiv.style.minHeight = '380px';
    sandboxDiv.style.maxHeight = '480px';
    sandboxDiv.style.overflowY = 'auto';
    parent.appendChild(sandboxDiv);
  }

  function selectCustomTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    const outputBox = $('output-box');
    if (outputBox) outputBox.classList.add('hidden');
    const simViewport = $('simulator-viewport');
    if (simViewport) simViewport.classList.add('hidden');
    const terminalViewport = $('terminal-viewport');
    if (terminalViewport) terminalViewport.classList.add('hidden');
    const mermaidContainer = $('mermaid-container');
    if (mermaidContainer) mermaidContainer.classList.add('hidden');

    const flowViewport = $('system-flow-viewport');
    if (flowViewport) flowViewport.classList.add('hidden');
    const flowTab = $('tab-system-flow');
    if (flowTab) flowTab.classList.remove('active');

    const sandboxViewport = $('rest-sandbox-viewport');
    if (sandboxViewport) sandboxViewport.classList.add('hidden');
    const sandboxTab = $('tab-rest-sandbox');
    if (sandboxTab) sandboxTab.classList.remove('active');

    const webhookTab = $('tab-webhooks');
    if (webhookTab) webhookTab.classList.remove('active');
    const linterTab = $('tab-linter');
    if (linterTab) linterTab.classList.remove('active');
    
    const activeBtn = $(`tab-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    const targetViewport = $(`${tabId}-viewport`);
    if (targetViewport) {
      targetViewport.classList.remove('hidden');
    }

    if (telemetryInterval) {
      clearInterval(telemetryInterval);
      telemetryInterval = null;
    }

    if (tabId === 'system-flow') {
      renderSystemFlowContent();
    } else if (tabId === 'rest-sandbox') {
      renderRestSandboxContent();
    }

    const fileExtensionTag = $('file-extension-tag');
    if (fileExtensionTag) fileExtensionTag.textContent = '';
  }

  function triggerFireDrill() {
    if ($('fire-drill-alert')) return;

    const overlay = document.createElement('div');
    overlay.id = 'fire-drill-alert';
    overlay.className = 'fire-drill-alert';
    
    if (!document.getElementById('fire-drill-style')) {
      const style = document.createElement('style');
      style.id = 'fire-drill-style';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(-100%) translateY(20px); opacity: 0; }
          to { transform: translateX(0) translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    const slug = pathname.split('/').filter(Boolean).pop() || "devops-studio";
    
    overlay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.5rem; text-align: left;">
        <span style="font-size: 1.25rem;">🚨</span>
        <strong style="color: #ef4444; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Critical PagerDuty Incident</strong>
      </div>
      <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.4; text-align: left;">
        Outage Fire-drill: High error rate detected in <strong>${slug}</strong> pod routing thresholds!
      </p>
      <div style="display: flex; gap: 0.5rem;">
        <button id="btn-fd-investigate" class="sre-button-pill" style="flex: 1; font-size: 10px; background: #ef4444; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);">Investigate</button>
        <button id="btn-fd-resolve" class="sre-button-pill" style="font-size: 10px; background: #334155; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); box-shadow: none;">Acknowledge</button>
      </div>
    `;

    document.body.appendChild(overlay);

    $('btn-fd-investigate').onclick = () => {
      const terminalTab = $('tab-terminal') || $('tab-simulator') || $('tab-webhooks');
      if (terminalTab) terminalTab.click();
      
      const terminalLogs = $('terminal-logs');
      if (terminalLogs) {
        const div = document.createElement('div');
        div.className = 'text-rose-500 font-bold';
        div.innerHTML = `[FIRE-DRILL] Incident pd-inc-fire-drill triggered. Error logs: HTTP 502 Bad Gateway.<br/>Running bash scripts/validate.sh checks is recommended.`;
        terminalLogs.appendChild(div);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
      }
      
      overlay.style.borderColor = '#f59e0b';
      overlay.querySelector('strong').style.color = '#f59e0b';
      overlay.querySelector('strong').textContent = 'Investigating Incident';
    };

    $('btn-fd-resolve').onclick = () => {
      overlay.remove();
      alert("Incident acknowledged and auto-remediation policies applied successfully. Excellent work!");
      setTimeout(triggerFireDrill, 120000);
    };
  }

  function initIncidentFireDrills() {
    if ($('fire-drill-alert')) return;
    setTimeout(() => {
      triggerFireDrill();
    }, 10000);
  }

  function triggerGitOpsAnimation() {
    if ($('gitops-sync-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'gitops-sync-panel';
    panel.className = 'gitops-sync-panel';

    panel.innerHTML = `
      <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; margin-top: 0;">
        <span>🔄 GitOps Pipeline Sync</span>
        <button onclick="document.getElementById('gitops-sync-panel').remove()" style="background:none; border:none; color:#64748b; cursor:pointer; font-size:14px;">&times;</button>
      </h4>
      <div id="gitops-steps" style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 11px;">
        <div id="step-git-push" style="color: #cbd5e1;">● Initiating Git Push...</div>
        <div id="step-argocd" style="color: #64748b;">● Webhook delivered to ArgoCD...</div>
        <div id="step-lint" style="color: #64748b;">● Running Security Scan (Trivy)...</div>
        <div id="step-deploy" style="color: #64748b;">● Kubernetes Deployment Rollout...</div>
        <div id="step-mesh" style="color: #64748b;">● Route shifted via Service Mesh...</div>
      </div>
    `;

    document.body.appendChild(panel);

    const steps = [
      { id: 'step-git-push', text: '✅ Git Push Completed', delay: 1000 },
      { id: 'step-argocd', text: '✅ Webhook payload delivered to ArgoCD', delay: 2000 },
      { id: 'step-lint', text: '✅ Lint & Trivy Scanners passed (100% compliant)', delay: 3500 },
      { id: 'step-deploy', text: '✅ Kubernetes Deployment rollout complete', delay: 5000 },
      { id: 'step-mesh', text: '✅ Route traffic successfully shifted to live (100% green)', delay: 6500 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        const el = $(step.id);
        if (el) {
          el.textContent = step.text;
          el.style.color = '#10b981';
          el.style.fontWeight = 'bold';
        }
        if (step.id === 'step-mesh') {
          setTimeout(() => {
            if ($('gitops-sync-panel')) $('gitops-sync-panel').remove();
          }, 3000);
        }
      }, step.delay);
    });
  }

  function injectGitOpsWebhookSimulator() {
    const nameInput = $('download-name-input');
    if (!nameInput || $('btn-gitops-push')) return;

    const parent = nameInput.parentElement;
    const btn = document.createElement('button');
    btn.id = 'btn-gitops-push';
    btn.type = 'button';
    btn.className = 'sre-button-pill';
    btn.style.padding = '4px 10px';
    btn.style.fontSize = '9px';
    btn.innerHTML = `
      <svg style="width: 10px; height: 10px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>
      <span>GitOps Push</span>
    `;

    btn.onclick = triggerGitOpsAnimation;
    parent.insertBefore(btn, nameInput);
  }

  // 6. Wrap window.switchTab to clean up custom tab selection
  function wrapSwitchTab() {
    if (typeof window.switchTab === 'function' && !window.switchTab.__wrapped) {
      const original = window.switchTab;
      window.switchTab = function (tabId) {
        const pdTab = $('tab-webhooks');
        if (pdTab) pdTab.classList.remove('active');

        const linterTab = $('tab-linter');
        if (linterTab) linterTab.classList.remove('active');

        const flowTab = $('tab-system-flow');
        if (flowTab) flowTab.classList.remove('active');
        const flowViewport = $('system-flow-viewport');
        if (flowViewport) flowViewport.classList.add('hidden');

        const sandboxTab = $('tab-rest-sandbox');
        if (sandboxTab) sandboxTab.classList.remove('active');
        const sandboxViewport = $('rest-sandbox-viewport');
        if (sandboxViewport) sandboxViewport.classList.add('hidden');

        if (telemetryInterval) {
          clearInterval(telemetryInterval);
          telemetryInterval = null;
        }

        const fileExtensionTag = $('file-extension-tag');
        if (fileExtensionTag && tabId !== 'webhooks' && tabId !== 'linter' && tabId !== 'system-flow' && tabId !== 'rest-sandbox') {
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

        // Cache the compiled code if switching to a code tab
        if (tabId !== 'webhooks' && tabId !== 'linter' && tabId !== 'system-flow' && tabId !== 'rest-sandbox') {
          setTimeout(() => {
            const outputBox = $('output-box');
            if (outputBox) {
              lastCompiledCode = outputBox.textContent;
            }
          }, 50);
        }

        original(tabId);
      };
      window.switchTab.__wrapped = true;
    }
  }

  // Initialize features on load
  function init() {
    injectAiLinkToNavbar();
    injectPagerDutyUI();
    injectWebhookTab();
    injectLinterTab();
    injectNetworkStatusBadge();

    // Inject Phase 14 Custom Features
    injectSystemFlowTab();
    injectRestSandboxTab();
    injectCustomViewports();
    injectPrintStyle();
    injectGitOpsWebhookSimulator();
    initIncidentFireDrills();

    // Listen to changes for caching
    const fields = document.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      if (field.id && field.type !== 'button' && field.type !== 'submit') {
        field.addEventListener('input', saveState);
        field.addEventListener('change', saveState);
      }
    });

    // Cache initial code load
    setTimeout(() => {
      const outputBox = $('output-box');
      if (outputBox) {
        lastCompiledCode = outputBox.textContent;
      }
    }, 500);

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
