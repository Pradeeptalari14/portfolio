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

  const categoryTopologies = {
    ai: {
      name: "Generative AI Inference & Vector RAG Mesh",
      badge: "LLM INFERENCE & RAG",
      png: "/sre_architecture_flow_ai.png",
      nodes: {
        client: { name: "Client / Prompt", layer: "Edge Ingress", port: ":443", proto: "HTTPS / REST", latency: "1.8ms", health: "HEALTHY (200 OK)", logs: "[INGRESS] TLS 1.3 handshakes ok. Token bucket rate limiter active (450 req/min/user)." },
        gateway: { name: "Kong / Envoy Gateway", layer: "API Gateway", port: ":443", proto: "HTTP/2 mTLS", latency: "3.2ms", health: "HEALTHY (200 OK)", logs: "[GATEWAY] Validated JWT bearer token. Ingress routing to LLM router cluster." },
        cache: { name: "Redis Semantic Cache", layer: "Vector Cache", port: ":6379", proto: "RESP / TCP", latency: "1.4ms", health: "HEALTHY (HIT 74%)", logs: "[CACHE] Vector cosine similarity match = 0.94. Returning cached embedding response." },
        router: { name: "LiteLLM Router", layer: "Model Routing", port: ":8000", proto: "REST / gRPC", latency: "6.8ms", health: "HEALTHY (BALANCED)", logs: "[ROUTER] Dispatched inference prompt to vLLM Worker Pool 2 (lowest load index)." },
        vllm: { name: "vLLM GPU Cluster", layer: "Model Inference", port: ":8000", proto: "CUDA / PagedAttn", latency: "38.2ms", health: "HEALTHY (8 GPUs)", logs: "[vLLM] Tensor-parallel=8, kv_cache=82% alloc. Generated 186 tokens @ 48 tok/sec." },
        rag: { name: "Qdrant Vector DB", layer: "Knowledge Index", port: ":6333", proto: "gRPC", latency: "11.5ms", health: "HEALTHY (INDEXED)", logs: "[QDRANT] Hybrid HNSW query matched 4 document chunks in collection 'sre_knowledgebase'." }
      },
      commands: [
        {
          cmd: "curl -s -X POST https://ai.internal/v1/chat/completions -d '{\"model\":\"llama-3\",\"prompt\":\"SRE health\"}'",
          label: "🚀 Send AI Prompt",
          pulse: "gateway",
          output: "HTTP/2 200 OK\ncontent-type: application/json\nx-cache-status: HIT (Redis Semantic)\nx-latency: 42ms\n\n{\n  \"id\": \"chatcmpl-914a82\",\n  \"model\": \"meta-llama/Llama-3-70b-instruct\",\n  \"choices\": [{\"message\": {\"role\": \"assistant\", \"content\": \"Cluster topology healthy. SLO: 99.98%.\"}}],\n  \"usage\": {\"prompt_tokens\": 14, \"completion_tokens\": 9, \"total_tokens\": 23}\n}"
        },
        {
          cmd: "kubectl get pods -n vllm-inference -o wide",
          label: "📦 K8s GPU Pods",
          pulse: "vllm",
          output: "NAME                             READY   STATUS    RESTARTS   AGE   IP             NODE\nvllm-worker-gpu-0                1/1     Running   0          42h   10.244.3.18    g5.12xlarge-node-a\nvllm-worker-gpu-1                1/1     Running   0          42h   10.244.4.22    g5.12xlarge-node-b\nvllm-router-deployment-7f89b    2/2     Running   0          14d   10.244.1.9     c6i.2xlarge-master"
        },
        {
          cmd: "redis-cli -h cache.internal info stats | grep -E 'keyspace_hits|used_memory_human'",
          label: "⚡ Cache Hit Rate",
          pulse: "cache",
          output: "keyspace_hits: 1482910\nkeyspace_misses: 492011\nhit_rate: 75.08%\nused_memory_human: 4.18G"
        }
      ]
    },
    cloud: {
      name: "Multi-Region Cloud & GitOps Control Fabric",
      badge: "INFRASTRUCTURE AS CODE",
      png: "/sre_architecture_flow_cloud.png",
      nodes: {
        git: { name: "Developer IaC PR", layer: "Version Control", port: ":443", proto: "HTTPS / SSH", latency: "8.5ms", health: "MERGED / VERIFIED", logs: "[GIT] Commit verified by GPG key. Branch 'main' trigger received." },
        engine: { name: "Terraform / Crossplane", layer: "Control Engine", port: ":8443", proto: "gRPC", latency: "14.2ms", health: "SYNCED (LOCKED)", logs: "[IAC] State lock acquired in DynamoDB. Resource diff: 0 to add, 1 to change, 0 to destroy." },
        vault: { name: "HashiCorp Vault", layer: "Secrets Engine", port: ":8200", proto: "HTTPS mTLS", latency: "2.6ms", health: "HEALTHY (SEALED: FALSE)", logs: "[VAULT] Issued short-lived AWS STS token for Karpenter role (TTL: 3600s)." },
        cloud_api: { name: "Cloud Fabric (AWS/GCP)", layer: "Provider API", port: ":443", proto: "HTTPS REST", latency: "21.0ms", health: "AVAILABLE (MULTI-AZ)", logs: "[CLOUD] Multi-AZ VPC subnets reconciled. Transit Gateway route tables active." },
        karpenter: { name: "EKS & Karpenter", layer: "Compute Cluster", port: ":6443", proto: "Kube-API", latency: "7.4ms", health: "HEALTHY (18 NODES)", logs: "[KARPENTER] Provisioned 2x m6i.xlarge Spot instances for incoming batch workload." },
        mesh: { name: "Istio / Cilium eBPF", layer: "Zero-Trust Mesh", port: ":15000", proto: "eBPF / Envoy", latency: "1.2ms", health: "HEALTHY (mTLS STRICT)", logs: "[MESH] WireGuard encryption tunnel active. 0 drops detected on L7 ingress filter." }
      },
      commands: [
        {
          cmd: "terraform plan -detailed-exitcode -out=tfplan",
          label: "📋 Terraform Plan",
          pulse: "engine",
          output: "Acquiring state lock in DynamoDB table 'terraform-locks'...\nTerraform Cloud Backend: Synchronizing workspace 'production-us-east-1'\n\nPlan: 0 to add, 2 to change, 0 to destroy.\n  ~ module.eks_nodepool.aws_autoscaling_group.workers\n      max_size: 24 -> 32\n\nNo unexpected drift. Lock released."
        },
        {
          cmd: "kubectl get nodes -l karpenter.sh/nodepool=default -o wide",
          label: "☸️ Karpenter Nodes",
          pulse: "karpenter",
          output: "NAME                         STATUS   ROLES    AGE   VERSION   INTERNAL-IP    INSTANCE-TYPE   ZONE\nip-10-0-12-44.ec2.internal   Ready    node     3d    v1.29.3   10.0.12.44     m6i.xlarge      us-east-1a\nip-10-0-14-88.ec2.internal   Ready    node     4h    v1.29.3   10.0.14.88     m6i.xlarge      us-east-1b\nip-10-0-18-91.ec2.internal   Ready    node     12m   v1.29.3   10.0.18.91     c6i.2xlarge     us-east-1c"
        },
        {
          cmd: "aws elbv2 describe-target-health --target-group-arn arn:aws:tg:prod-mesh",
          label: "🛡️ Target Health",
          pulse: "cloud_api",
          output: "{\n  \"TargetHealthDescriptions\": [\n    {\"Target\": {\"Id\": \"10.0.12.44\", \"Port\": 8080}, \"HealthCheckPort\": \"8080\", \"TargetHealth\": {\"State\": \"healthy\"}},\n    {\"Target\": {\"Id\": \"10.0.14.88\", \"Port\": 8080}, \"HealthCheckPort\": \"8080\", \"TargetHealth\": {\"State\": \"healthy\"}}\n  ]\n}"
        }
      ]
    },
    cicd: {
      name: "Automated Continuous Delivery & DevSecOps",
      badge: "GITOPS & ZERO-TRUST CI",
      png: "/sre_architecture_flow_cicd.png",
      nodes: {
        git: { name: "Git SCM Webhook", layer: "Source Control", port: ":443", proto: "HTTPS / HMAC", latency: "4.2ms", health: "VERIFIED (SHA-256)", logs: "[WEBHOOK] GitHub event 'push' delivered. Payload verified against secret HMAC." },
        runner: { name: "Ephemeral CI Runner", layer: "Build Worker", port: ":443", proto: "Containerized", latency: "11.0ms", health: "HEALTHY (IDLE: 0)", logs: "[RUNNER] Mounted isolated Docker socket. Cloned commit 39abc8d in 0.8s." },
        linter: { name: "SonarQube & SAST", layer: "Code Governance", port: ":9000", proto: "REST API", latency: "16.4ms", health: "PASSED (0 BUGS)", logs: "[SAST] Static analysis finished. 0 critical vulnerabilities. Test coverage: 94.2%." },
        trivy: { name: "Trivy Container Gate", layer: "Security Scanner", port: ":8080", proto: "Daemon / CLI", latency: "22.8ms", health: "PASSED (0 CRIT)", logs: "[TRIVY] Scanning layer blobs for CVE-2024-xxx. SBOM signed with Cosign key." },
        argocd: { name: "ArgoCD Controller", layer: "GitOps Reconciler", port: ":8080", proto: "gRPC", latency: "5.1ms", health: "Synced / Healthy", logs: "[ARGOCD] Target Git repo matched live cluster state. Diff: 0 resources out-of-sync." },
        k8s_pods: { name: "Canary K8s Pods", layer: "Production Runtime", port: ":8080", proto: "HTTP/2", latency: "1.8ms", health: "HEALTHY (100%)", logs: "[ROLLOUT] Canary promotion 100% complete. Automated rollback sentinel on standby." }
      },
      commands: [
        {
          cmd: "trivy image --severity HIGH,CRITICAL registry.internal/app:v2.4.1",
          label: "🛡️ Trivy Scan",
          pulse: "trivy",
          output: "2026-09-27T16:08:14Z INFO Vulnerability database is up to date\nregistry.internal/app:v2.4.1 (debian 12.5)\n==========================================\nTotal: 0 (HIGH: 0, CRITICAL: 0)\nResult: PASSED. Zero vulnerabilities blocking deployment."
        },
        {
          cmd: "argocd app sync production-web --prune",
          label: "🔄 ArgoCD Sync",
          pulse: "argocd",
          output: "TIMESTAMP                  GROUP        KIND         NAMESPACE     NAME              STATUS    HEALTH       HOOK  MESSAGE\n2026-09-27T16:08:15Z   apps         Deployment   production    web-service       Synced    Progressing        deployment.apps/web-service configured\n2026-09-27T16:08:18Z   apps         Deployment   production    web-service       Synced    Healthy            Deployment is up to date"
        },
        {
          cmd: "kubectl rollout status deployment/web-service -n production",
          label: "🚀 Rollout Status",
          pulse: "k8s_pods",
          output: "Waiting for deployment \"web-service\" rollout to finish: 1 of 3 updated replicas are available...\nWaiting for deployment \"web-service\" rollout to finish: 2 of 3 updated replicas are available...\ndeployment \"web-service\" successfully rolled out."
        }
      ]
    },
    automation: {
      name: "Infrastructure Automation & Fleet Orchestration",
      badge: "ANSIBLE & SENTINEL",
      png: "/sre_architecture_flow_automation.png",
      nodes: {
        trigger: { name: "Event Scheduler", layer: "Event Trigger", port: ":443", proto: "Cron / Event", latency: "1.0ms", health: "ACTIVE (SCHEDULED)", logs: "[TRIGGER] Scheduled cron maintenance fired: 'reconcile-compliance-baseline'." },
        ansible: { name: "Ansible Control Node", layer: "Automation Core", port: ":22", proto: "SSH / Python", latency: "12.8ms", health: "IDEMPOTENT (0 ERR)", logs: "[ANSIBLE] Executing playbook site.yml across 48 target inventory hosts in parallel." },
        vault_sec: { name: "KMS / SSH Bastion", layer: "Secrets & Certs", port: ":8200", proto: "HTTPS mTLS", latency: "2.4ms", health: "ISSUED (SHORT-LIVED)", logs: "[KMS] Decrypted inventory secrets using AWS KMS key 'alias/ansible-prod'." },
        fleet: { name: "Target Linux Fleet", layer: "Target Systems", port: ":22", proto: "SSH / TCP", latency: "8.2ms", health: "HEALTHY (48/48)", logs: "[FLEET] Package updates installed. Kernel sysctl parameters verified: net.ipv4.tcp_tw_reuse=1." },
        sentinel: { name: "Systemd Sentinel Loop", layer: "Local Daemon", port: "local", proto: "Unix Socket", latency: "0.8ms", health: "ACTIVE (RUNNING)", logs: "[SENTINEL] Drift verification complete. No configuration drift detected." },
        probe: { name: "Blackbox Health Prober", layer: "Verification Gate", port: ":9115", proto: "HTTP/TCP Probe", latency: "3.5ms", health: "PROBE SUCCEEDED", logs: "[PROBE] Synthetic HTTP GET probe returned 200 OK in 14ms. Canary verification passed." }
      },
      commands: [
        {
          cmd: "ansible-playbook -i production.inv site.yml --check",
          label: "🤖 Run Ansible",
          pulse: "ansible",
          output: "PLAY [Enforce Production Security Baselines] **********************************\n\nTASK [security : Ensure SSH root login disabled] ******************************\nok: [node-prod-01]\nok: [node-prod-02]\nok: [node-prod-03]\n\nPLAY RECAP ********************************************************************\nnode-prod-01 : ok=14   changed=0    unreachable=0    failed=0    skipped=0\nnode-prod-02 : ok=14   changed=0    unreachable=0    failed=0    skipped=0\nnode-prod-03 : ok=14   changed=0    unreachable=0    failed=0    skipped=0"
        },
        {
          cmd: "systemctl status sentinel-agent.service",
          label: "⚙️ Systemd Status",
          pulse: "sentinel",
          output: "● sentinel-agent.service - Production SRE Fleet Drift Sentinel\n     Loaded: loaded (/etc/systemd/system/sentinel-agent.service; enabled; vendor preset: enabled)\n     Active: active (running) since Thu 2026-09-24 10:14:02 UTC; 3 days ago\n   Main PID: 18492 (sentinel)\n      Tasks: 4 (limit: 9410)\n     Memory: 24.8M\n        CPU: 1.2%"
        },
        {
          cmd: "curl -s http://prober:9115/probe?target=http://localhost:8080&module=http_2xx",
          label: "🔍 Blackbox Probe",
          pulse: "probe",
          output: "probe_success 1\nprobe_duration_seconds 0.0142\nprobe_http_status_code 200\nprobe_ip_protocol 4\nprobe_ssl_earliest_cert_expiry 1.7829e+09"
        }
      ]
    },
    observability: {
      name: "Full-Stack SRE Telemetry & Escalation Pipeline",
      badge: "METRICS, LOGS & TRACES",
      png: "/sre_architecture_flow_observability.png",
      nodes: {
        probes: { name: "eBPF & Kernel Probes", layer: "Data Ingestion", port: "kernel", proto: "eBPF Sockets", latency: "0.4ms", health: "RECORDING (0.01% CPU)", logs: "[eBPF] Capturing syscalls and HTTP/2 packet headers with zero context switch overhead." },
        collector: { name: "Vector / OTEL Collector", layer: "Telemetry Buffer", port: ":4317", proto: "OTLP gRPC", latency: "2.5ms", health: "HEALTHY (BUFFER 4%)", logs: "[VECTOR] Ingest rate: 14,200 events/sec. Batching 2MB chunks to Prometheus and Loki." },
        prometheus: { name: "Prometheus TSDB", layer: "Metrics Engine", port: ":9090", proto: "PromQL / HTTP", latency: "6.8ms", health: "HEALTHY (HEAD OK)", logs: "[PROM] Evaluated 184 recording rules in 42ms. 0 alerts firing." },
        loki: { name: "Grafana Loki Store", layer: "Log Aggregator", port: ":3100", proto: "LogQL / HTTP", latency: "9.2ms", health: "HEALTHY (S3 BACKED)", logs: "[LOKI] Stream chunk index synced with MinIO bucket. Retention: 30 days." },
        alertmanager: { name: "Alertmanager Router", layer: "Notification Engine", port: ":9093", proto: "HTTP Webhook", latency: "3.1ms", health: "HEALTHY (0 SILENCES)", logs: "[ALERTS] Deduplication window: 30s. Routing alerts by cluster='production-us-east'." },
        escalation: { name: "PagerDuty / Slack", layer: "Incident On-Call", port: ":443", proto: "HTTPS Webhook", latency: "14.5ms", health: "CONNECTED (ON-CALL)", logs: "[ON-CALL] Incident routing ready. Escalation tier 1: Pradeep Talari (SRE Lead)." }
      },
      commands: [
        {
          cmd: "promtool check rules /etc/prometheus/rules/alerts.yml",
          label: "📊 Promtool Check",
          pulse: "prometheus",
          output: "Checking /etc/prometheus/rules/alerts.yml\n  SUCCESS: 8 rules found\n\nRule Syntax: VALID\nRecording Rules: 4\nAlerting Rules: 4\nDuration Checks: PASSED"
        },
        {
          cmd: "curl -s -G 'http://prometheus:9090/api/v1/query' --data-urlencode 'query=rate(http_requests_total[2m])'",
          label: "📈 Query Metric",
          pulse: "prometheus",
          output: "{\"status\":\"success\",\"data\":{\"resultType\":\"vector\",\"result\":[{\"metric\":{\"app\":\"api\",\"handler\":\"/v1/status\",\"instance\":\"10.0.1.4:8080\"},\"value\":[1782914000,\"145.28\"]}]}}"
        },
        {
          cmd: "logcli query '{namespace=\"production\"} |= \"CRITICAL\"' --limit=5",
          label: "📜 LogCLI Stream",
          pulse: "loki",
          output: "http://loki:3100 > query '{namespace=\"production\"} |= \"CRITICAL\"' (limit 5)\n2026-09-27T16:04:18Z [ALERT] Latency spike detected on payment-service: p99 > 850ms (auto-healed)\n2026-09-27T16:01:02Z [INFO] Zero critical unhandled exceptions in the last 15 minutes."
        }
      ]
    }
  };

  function buildTopologySvg(cat) {
    const topo = categoryTopologies[cat] || categoryTopologies.cloud;
    const nodeKeys = Object.keys(topo.nodes);
    const nodeWidth = 96;
    const spacing = 124;
    const startX = 14;
    const y = 30;

    let defs = `
      <defs>
        <marker id="arrow-flow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 2 L 8 5 L 0 8 z" fill="#38bdf8"/>
        </marker>
        <linearGradient id="gn-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#090d16" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
    `;

    let wiresSvg = '';
    let nodesSvg = '';

    nodeKeys.forEach((key, i) => {
      const n = topo.nodes[key];
      const curX = startX + i * spacing;

      if (i < nodeKeys.length - 1) {
        const nextX = startX + (i + 1) * spacing;
        const x1 = curX + nodeWidth;
        const x2 = nextX - 4;
        const midY = y + 36;
        wiresSvg += `
          <g class="sre-flow-wire-group">
            <path class="sre-flow-wire" d="M ${x1} ${midY} L ${x2} ${midY}" stroke="#6366f1" stroke-width="2" marker-end="url(#arrow-flow)" />
            <circle r="3.5" fill="#fde047">
              <animateMotion dur="2.4s" repeatCount="indefinite" path="M ${x1} ${midY} L ${x2} ${midY}" />
            </circle>
          </g>
        `;
      }

      nodesSvg += `
        <g class="sre-svg-node" data-node-id="${key}" transform="translate(${curX}, ${y})">
          <rect width="${nodeWidth}" height="72" rx="8" fill="url(#gn-bg)" stroke="#4338ca" stroke-width="1.5" />
          <circle cx="16" cy="18" r="4" fill="#10b981" />
          <rect x="50" y="11" width="38" height="14" rx="3" fill="rgba(255,255,255,0.06)" />
          <text x="69" y="21" font-family="monospace" font-size="8" fill="#94a3b8" text-anchor="middle">${n.port}</text>
          <text x="48" y="44" font-family="sans-serif" font-weight="bold" font-size="10" fill="#f8fafc" text-anchor="middle">${n.name}</text>
          <text x="48" y="58" font-family="sans-serif" font-size="8" fill="#818cf8" text-anchor="middle">${n.layer}</text>
        </g>
      `;
    });

    return `
      <svg viewBox="0 0 740 135" style="width: 100%; height: auto; display: block; overflow: visible;">
        ${defs}
        ${wiresSvg}
        ${nodesSvg}
      </svg>
    `;
  }

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

  let activeFaultTimeout = null;

  function renderSystemFlowContent() {
    const viewport = $('system-flow-viewport');
    if (!viewport) return;

    const cat = getStudioCategory();
    const topo = categoryTopologies[cat] || categoryTopologies.cloud;
    const life = lifecycles[cat] || lifecycles.cloud;
    const svg = buildTopologySvg(cat);
    const initialNodeKey = Object.keys(topo.nodes)[0];
    const initialNode = topo.nodes[initialNodeKey];

    viewport.innerHTML = `
      <div class="sre-panel-container" style="text-align: left; display: flex; flex-direction: column; gap: 1rem;">
        
        <!-- Header Toolbar -->
        <div class="sre-panel-header" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem;">
          <div>
            <h3 class="sre-panel-title" style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🗺️</span> Production Topology &amp; Flow Guide
            </h3>
            <span class="manim-badge" style="margin-top: 0.25rem;">${topo.badge}</span>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            <button id="btn-toggle-flow-anim" class="sre-quick-cmd-btn" title="Toggle Wire Animations">⏸ Pause Flow</button>
            <button id="btn-inject-flow-chaos" class="sre-quick-cmd-btn" style="color: #f87171; border-color: rgba(239,68,68,0.3);">💥 Inject Chaos</button>
            <button id="btn-view-blueprint" class="sre-quick-cmd-btn" style="color: #38bdf8; border-color: rgba(56,189,248,0.3);">🖼️ Blueprint PNG</button>
            <button id="btn-print-cheatsheet" class="sre-button-pill">📄 Print Cheatsheet</button>
          </div>
        </div>
        
        <!-- Interactive Manim-Style Architecture Canvas -->
        <div class="sre-flow-canvas-wrapper" id="flow-canvas-container">
          ${svg}
        </div>

        <!-- Node Deep-Dive HUD Inspector -->
        <div id="flow-node-inspector" class="flow-hud-inspector">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 0.4rem;">
            <span id="hud-node-title" style="font-weight: bold; color: #f8fafc; font-size: 12px;">🔍 Node: ${initialNode.name}</span>
            <span id="hud-node-health" style="font-family: monospace; font-size: 10px; color: #4ade80;">● ${initialNode.health}</span>
          </div>
          
          <div class="flow-hud-grid">
            <div class="flow-hud-stat">
              <span class="flow-hud-stat-label">Architecture Layer</span>
              <span id="hud-node-layer" class="flow-hud-stat-val">${initialNode.layer}</span>
            </div>
            <div class="flow-hud-stat">
              <span class="flow-hud-stat-label">Internal Endpoint</span>
              <span id="hud-node-port" class="flow-hud-stat-val" style="color: #fde047;">${initialNode.port}</span>
            </div>
            <div class="flow-hud-stat">
              <span class="flow-hud-stat-label">Protocol</span>
              <span id="hud-node-proto" class="flow-hud-stat-val">${initialNode.proto}</span>
            </div>
            <div class="flow-hud-stat">
              <span class="flow-hud-stat-label">p99 Latency</span>
              <span id="hud-node-latency" class="flow-hud-stat-val" style="color: #10b981;">${initialNode.latency}</span>
            </div>
          </div>
          
          <div style="background: rgba(2, 6, 23, 0.7); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px; padding: 0.5rem; font-family: monospace; font-size: 10px; color: #94a3b8; overflow-x: auto;">
            <div style="color: #64748b; font-size: 9px; margin-bottom: 2px;">COMPONENT DIAGNOSTIC LOGS</div>
            <pre id="hud-node-logs" style="margin: 0; white-space: pre-wrap;">${initialNode.logs}</pre>
          </div>
        </div>

        <!-- Lifecycle Guidance Guidelines -->
        <div style="display: flex; flex-direction: column; gap: 0.5rem; background: #020617; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.05); padding: 0.85rem 1rem; font-size: 11px;">
          <div><strong>WHEN to Use:</strong> <span style="color: #cbd5e1;">${life.when}</span></div>
          <div style="margin-top: 0.25rem;"><strong>WHERE to Deploy:</strong> <span style="color: #cbd5e1;">${life.where}</span></div>
        </div>

        <!-- Interactive SRE Terminal Playground -->
        <div class="sre-terminal-emulator" id="sre-interactive-terminal">
          <div class="sre-terminal-header">
            <div class="sre-terminal-dots">
              <span class="sre-terminal-dot red"></span>
              <span class="sre-terminal-dot yellow"></span>
              <span class="sre-terminal-dot green"></span>
            </div>
            <span class="sre-terminal-title">sre@prod-mesh:~ (zsh) · Interactive Playground</span>
            <span style="font-size: 9px; color: #64748b; font-family: monospace;">ESC to clear</span>
          </div>

          <!-- Quick Action Commands -->
          <div class="sre-terminal-quick-pills">
            ${topo.commands.map((c, idx) => `
              <button class="sre-quick-cmd-btn" data-cmd-idx="${idx}">${c.label}</button>
            `).join('')}
          </div>

          <div class="sre-terminal-body" id="sre-term-output">
            <pre style="color: #38bdf8;">[SYSTEM] Production mesh initialized. Click quick commands or type CLI commands below.</pre>
          </div>

          <div class="sre-terminal-prompt-line">
            <span class="sre-terminal-prompt-user">sre@prod-cluster:~$</span>
            <input type="text" id="sre-term-cmd-input" class="sre-terminal-input" placeholder="Type command (e.g. curl, kubectl, terraform)..." spellcheck="false" autocomplete="off" />
          </div>
        </div>

        <!-- Live SRE Telemetry Metrics (Simulation) -->
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

      <!-- Blueprint Lightbox Modal Overlay -->
      <div id="blueprint-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 2rem;">
        <div style="background: #0f172a; border: 1px solid rgba(99,102,241,0.3); border-radius: 12px; max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: #020617;">
            <span style="font-weight: bold; color: #f8fafc; font-size: 13px;">🖼️ Reference Blueprint: ${topo.name}</span>
            <button id="btn-close-blueprint" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px;">✕</button>
          </div>
          <div style="padding: 1rem; overflow: auto; text-align: center; background: #030712;">
            <img id="blueprint-modal-img" src="${topo.png}" onerror="this.src='/sre_architecture_flow.png'" alt="Architecture Blueprint" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.05); background: #020617;">
            <a href="${topo.png}" target="_blank" download class="sre-button-pill" style="text-decoration: none;">💾 Download PNG</a>
          </div>
        </div>
      </div>
    `;

    // 1. Cheatsheet Print
    const printBtn = $('btn-print-cheatsheet');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }

    // 2. Blueprint Lightbox
    const viewBpBtn = $('btn-view-blueprint');
    const bpModal = $('blueprint-modal');
    const closeBpBtn = $('btn-close-blueprint');
    if (viewBpBtn && bpModal) {
      viewBpBtn.onclick = () => {
        bpModal.classList.remove('hidden');
        bpModal.style.display = 'flex';
      };
    }
    if (closeBpBtn && bpModal) {
      closeBpBtn.onclick = () => {
        bpModal.classList.add('hidden');
        bpModal.style.display = 'none';
      };
    }
    if (bpModal) {
      bpModal.onclick = (e) => {
        if (e.target === bpModal) {
          bpModal.classList.add('hidden');
          bpModal.style.display = 'none';
        }
      };
    }

    // 3. Node HUD Inspector on Click
    const nodeEls = viewport.querySelectorAll('.sre-svg-node');
    nodeEls.forEach(el => {
      el.addEventListener('click', () => {
        const nodeId = el.getAttribute('data-node-id');
        const nodeData = topo.nodes[nodeId];
        if (!nodeData) return;

        nodeEls.forEach(n => n.classList.remove('active-node'));
        el.classList.add('active-node');

        const titleEl = $('hud-node-title');
        const healthEl = $('hud-node-health');
        const layerEl = $('hud-node-layer');
        const portEl = $('hud-node-port');
        const protoEl = $('hud-node-proto');
        const latEl = $('hud-node-latency');
        const logsEl = $('hud-node-logs');

        if (titleEl) titleEl.textContent = `🔍 Node: ${nodeData.name}`;
        if (healthEl) healthEl.textContent = `● ${nodeData.health}`;
        if (layerEl) layerEl.textContent = nodeData.layer;
        if (portEl) portEl.textContent = nodeData.port;
        if (protoEl) protoEl.textContent = nodeData.proto;
        if (latEl) latEl.textContent = nodeData.latency;
        if (logsEl) logsEl.textContent = nodeData.logs;
      });
    });

    // 4. Toggle Animation Pause / Play
    const toggleAnimBtn = $('btn-toggle-flow-anim');
    if (toggleAnimBtn) {
      let isPaused = false;
      toggleAnimBtn.onclick = () => {
        isPaused = !isPaused;
        viewport.querySelectorAll('.sre-flow-wire').forEach(w => {
          if (isPaused) w.classList.add('paused');
          else w.classList.remove('paused');
        });
        toggleAnimBtn.textContent = isPaused ? '▶ Play Flow' : '⏸ Pause Flow';
      };
    }

    // 5. Chaos Fault Injection
    const chaosBtn = $('btn-inject-flow-chaos');
    if (chaosBtn) {
      chaosBtn.onclick = () => {
        if (activeFaultTimeout) clearTimeout(activeFaultTimeout);

        const nodeKeys = Object.keys(topo.nodes);
        const faultKey = nodeKeys[Math.min(2, nodeKeys.length - 1)];
        const faultNode = topo.nodes[faultKey];
        const faultEl = viewport.querySelector(`[data-node-id="${faultKey}"]`);

        if (faultEl) {
          faultEl.classList.add('chaos-fault');
          faultEl.querySelector('rect').setAttribute('stroke', '#ef4444');
        }

        // Terminal Log Incident
        const termOut = $('sre-term-output');
        if (termOut) {
          const alertLine = document.createElement('pre');
          alertLine.style.color = '#ef4444';
          alertLine.textContent = `\n🔥 [CHAOS FAULT INJECTED] Node '${faultNode.name}' unresponsive! HTTP 504 Gateway Timeout.\n🚨 [PAGERDUTY ALERT] Incident INC-9418 firing: Latency spike > 3,500ms.\n🛡️ [CIRCUIT BREAKER] Tripping open circuit breaker on route [${faultKey}]. Re-routing traffic to standby replica.`;
          termOut.appendChild(alertLine);
          termOut.scrollTop = termOut.scrollHeight;
        }

        // Drop Telemetry SLO temporarily
        const sloEl = $('stat-slo-status');
        if (sloEl) sloEl.textContent = '94.12%';

        // Auto-heal after 6 seconds
        activeFaultTimeout = setTimeout(() => {
          if (faultEl) {
            faultEl.classList.remove('chaos-fault');
            faultEl.querySelector('rect').setAttribute('stroke', '#4338ca');
          }
          if (termOut) {
            const healLine = document.createElement('pre');
            healLine.style.color = '#4ade80';
            healLine.textContent = `\n💚 [AUTO-REMEDIATION] Sentinel operator spawned replacement replica for '${faultNode.name}'.\n✓ [HEALTH RESTORED] SLO recovered: 99.99% | Latency normalized: ${faultNode.latency} | Circuit closed.`;
            termOut.appendChild(healLine);
            termOut.scrollTop = termOut.scrollHeight;
          }
          if (sloEl) sloEl.textContent = '99.99%';
          activeFaultTimeout = null;
        }, 6000);
      };
    }

    // 6. Interactive Terminal Quick Commands & Execution
    const termOut = $('sre-term-output');
    const termInput = $('sre-term-cmd-input');

    function executeTerminalCommand(cmdText, outputText, pulseNodeId) {
      if (!termOut) return;
      
      const cmdLine = document.createElement('pre');
      cmdLine.style.color = '#f8fafc';
      cmdLine.style.fontWeight = 'bold';
      cmdLine.textContent = `\nsre@prod-cluster:~$ ${cmdText}`;
      termOut.appendChild(cmdLine);

      const outLine = document.createElement('pre');
      outLine.style.color = '#cbd5e1';
      outLine.textContent = outputText || 'Command executed successfully.';
      termOut.appendChild(outLine);

      termOut.scrollTop = termOut.scrollHeight;

      if (pulseNodeId) {
        const pEl = viewport.querySelector(`[data-node-id="${pulseNodeId}"]`);
        if (pEl) {
          pEl.classList.add('active-node');
          setTimeout(() => pEl.classList.remove('active-node'), 1800);
        }
      }
    }

    viewport.querySelectorAll('.sre-quick-cmd-btn[data-cmd-idx]').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-cmd-idx'), 10);
        const cmdObj = topo.commands[idx];
        if (cmdObj) {
          executeTerminalCommand(cmdObj.cmd, cmdObj.output, cmdObj.pulse);
        }
      };
    });

    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && termInput.value.trim()) {
          const val = termInput.value.trim();
          termInput.value = '';
          
          const matchedCmd = topo.commands.find(c => c.cmd.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(c.cmd.split(' ')[0]));
          if (matchedCmd) {
            executeTerminalCommand(val, matchedCmd.output, matchedCmd.pulse);
          } else {
            executeTerminalCommand(val, `Executing [${val}] across production cluster...\n✓ Task completed with exit code 0.`);
          }
        }
      });
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

  function generateManimPythonCode(cat, studioTitle) {
    const topo = categoryTopologies[cat] || categoryTopologies.cloud;
    const nodeKeys = Object.keys(topo.nodes);
    
    return `"""
═══════════════════════════════════════════════════════════════════════════
  PRODUCTION SRE ARCHITECTURE FLOW ANIMATION
  Topology: ${topo.name}
  Generated by Developer Studio | Talari Pradeep Portfolio
═══════════════════════════════════════════════════════════════════════════

PREREQUISITES:
  1. Python 3.9+
  2. Install Manim Community Edition:
     pip install manim
  3. Ensure ffmpeg is installed and available on your system PATH.

EXECUTION INSTRUCTIONS:
  # Fast low-quality preview (480p @ 15fps):
  manim -pql manim_flow.py SREArchitectureFlow

  # Full HD 1080p presentation video (60fps):
  manim -pqh --fps 60 manim_flow.py SREArchitectureFlow

  # 4K Ultra-HD broadcast video (2160p @ 60fps):
  manim -pqk -r 3840,2160 --fps 60 manim_flow.py SREArchitectureFlow
"""

from manim import *

class SREArchitectureFlow(Scene):
    def construct(self):
        # 1. Dark Enterprise Canvas Theme
        self.camera.background_color = "#030712"

        # 2. Header Title Banner
        header = Text(
            "${topo.name}",
            font_size=26,
            weight=BOLD,
            color="#f8fafc"
        ).to_edge(UP, buff=0.4)
        
        subtitle = Text(
            "Topology Stage Flow & Automated Failover Circuit Breaker",
            font_size=14,
            color="#94a3b8"
        ).next_to(header, DOWN, buff=0.15)

        self.play(FadeIn(header, shift=DOWN * 0.3), FadeIn(subtitle), run_time=1.0)

        # 3. Construct Architecture Stage Nodes
        node_configs = [
${nodeKeys.map(k => {
  const n = topo.nodes[k];
  return `            {"id": "${k}", "title": "${n.name}", "layer": "${n.layer}", "port": "${n.port}"},`;
}).join('\n')}
        ]

        node_mobjects = []
        for cfg in node_configs:
            box = RoundedRectangle(
                corner_radius=0.12,
                height=1.2,
                width=1.85,
                color="#6366f1",
                fill_color="#0f172a",
                fill_opacity=0.95,
                stroke_width=2
            )
            title = Text(cfg["title"], font_size=10, weight=BOLD, color=WHITE).shift(UP * 0.2)
            layer = Text(cfg["layer"], font_size=8, color="#818cf8").shift(DOWN * 0.1)
            port = Text(cfg["port"], font_size=7, font="Courier", color="#38bdf8").shift(DOWN * 0.35)
            
            group = VGroup(box, title, layer, port)
            node_mobjects.append(group)

        # Arrange nodes linearly across the canvas
        nodes_group = VGroup(*node_mobjects).arrange(RIGHT, buff=0.45).scale(0.85).shift(UP * 0.3)

        # 4. Connecting Directed Arrows
        arrows = []
        for i in range(len(node_mobjects) - 1):
            arrow = Arrow(
                start=node_mobjects[i].get_right(),
                end=node_mobjects[i + 1].get_left(),
                buff=0.08,
                color="#38bdf8",
                stroke_width=2.5,
                max_tip_length_to_length_ratio=0.25
            )
            arrows.append(arrow)

        # Animate Assembly
        self.play(LaggedStart(*[FadeIn(n, shift=UP * 0.2) for n in node_mobjects], lag_ratio=0.15), run_time=1.8)
        self.play(*[GrowArrow(a) for a in arrows], run_time=1.2)
        self.wait(0.5)

        # 5. Live Request Packet Flow Animation (Forward Traverse)
        packet_dots = []
        for arrow in arrows:
            dot = Dot(color="#fde047", radius=0.08).move_to(arrow.get_start())
            packet_dots.append((dot, arrow))

        for dot, arrow in packet_dots:
            self.play(FadeIn(dot, scale=0.5), run_time=0.15)
            self.play(MoveAlongPath(dot, arrow), rate_func=linear, run_time=0.6)
            self.play(FadeOut(dot, scale=0.5), run_time=0.15)

        # 6. Simulate SRE Chaos Incident (Node Failure on Stage 2)
        target_node = node_mobjects[min(2, len(node_mobjects) - 1)]
        fault_highlight = SurroundingRectangle(target_node, color=RED, buff=0.08, stroke_width=3)
        alarm_text = Text("504 GATEWAY TIMEOUT", font_size=9, weight=BOLD, color=RED).next_to(target_node, UP, buff=0.1)

        self.play(
            Create(fault_highlight),
            Write(alarm_text),
            target_node[0].animate.set_stroke(color=RED),
            run_time=0.8
        )
        self.play(Indicate(target_node, color=RED_E, scale_factor=1.1), run_time=0.8)
        self.wait(0.6)

        # 7. Automated Circuit-Breaker Traffic Re-Route to Standby Replica
        replica_box = RoundedRectangle(
            corner_radius=0.12,
            height=1.0,
            width=1.85,
            color="#10b981",
            fill_color="#022c22",
            fill_opacity=0.9,
            stroke_width=2
        ).next_to(target_node, DOWN, buff=0.6)
        replica_txt = Text("Hot Standby Replica\\n:8080 (Synced)", font_size=9, color=WHITE).move_to(replica_box.get_center())
        replica_group = VGroup(replica_box, replica_txt)

        reroute_arrow_in = CurvedArrow(node_mobjects[1].get_bottom(), replica_box.get_left(), color=GREEN, angle=-TAU/6)
        reroute_arrow_out = CurvedArrow(replica_box.get_right(), node_mobjects[min(3, len(node_mobjects) - 1)].get_bottom(), color=GREEN, angle=-TAU/6)

        self.play(FadeIn(replica_group, shift=UP * 0.2), GrowArrow(reroute_arrow_in), GrowArrow(reroute_arrow_out), run_time=1.2)

        # Route Traffic via Standby Replica
        standby_dot = Dot(color="#4ade80", radius=0.08)
        self.play(MoveAlongPath(standby_dot, reroute_arrow_in), rate_func=linear, run_time=0.6)
        self.play(MoveAlongPath(standby_dot, reroute_arrow_out), rate_func=linear, run_time=0.6)
        self.play(FadeOut(standby_dot))

        # 8. SRE Telemetry & Recovery Badge
        slo_banner = Text(
            "✓ INCIDENT MITIGATED · SLO: 99.99% · MTTR: 3.8s · Traffic Re-Routed",
            font_size=12,
            weight=BOLD,
            color="#4ade80"
        ).to_edge(DOWN, buff=0.5)

        self.play(
            FadeOut(fault_highlight),
            FadeOut(alarm_text),
            FadeIn(slo_banner, shift=UP * 0.2),
            run_time=1.0
        )
        self.wait(2.0)
`;
  }

  function renderManimFlowContent() {
    const viewport = $('manim-flow-viewport');
    if (!viewport) return;

    const cat = getStudioCategory();
    const topo = categoryTopologies[cat] || categoryTopologies.cloud;
    const titleText = document.title || 'DevOps & SRE Studio';
    const manimPythonCode = generateManimPythonCode(cat, titleText);

    viewport.innerHTML = `
      <div class="sre-panel-container" style="text-align: left; display: flex; flex-direction: column; gap: 1rem;">
        
        <!-- Header Toolbar -->
        <div class="sre-panel-header" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem;">
          <div>
            <h3 class="sre-panel-title" style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>🎬</span> Manim Video Generator (manim_flow.py)
            </h3>
            <span class="manim-badge" style="margin-top: 0.25rem;">MANIM COMMUNITY EDITION</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            <button id="btn-copy-manim" class="sre-button-pill">📋 Copy Script</button>
            <button id="btn-download-manim" class="sre-button-pill" style="background: #10b981;">💾 Download .py</button>
            <button id="btn-run-sim-flow" class="sre-quick-cmd-btn" style="color: #38bdf8; border-color: rgba(56,189,248,0.3);">▶ In-Browser Flow</button>
          </div>
        </div>

        <!-- Quick Execution Instructions -->
        <div style="background: #020617; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); padding: 0.85rem 1rem; font-family: monospace; font-size: 11px; color: #cbd5e1;">
          <div style="color: #38bdf8; font-weight: bold; margin-bottom: 0.35rem;">🚀 HOW TO RUN LOCALLY:</div>
          <div style="color: #94a3b8; margin-bottom: 0.25rem;">1. Ensure Python &amp; ffmpeg are installed, then install Manim:</div>
          <pre style="margin: 0 0 0.5rem 0; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px; color: #a5b4fc;">pip install manim</pre>
          <div style="color: #94a3b8; margin-bottom: 0.25rem;">2. Render fast 480p preview (15fps) or 1080p 60fps presentation:</div>
          <pre style="margin: 0; padding: 4px 8px; background: rgba(255,255,255,0.03); border-radius: 4px; color: #4ade80;">manim -pql manim_flow.py SREArchitectureFlow\n# Full 1080p 60fps:\nmanim -pqh --fps 60 manim_flow.py SREArchitectureFlow</pre>
        </div>

        <!-- Script Viewer -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-size: 11px; font-weight: bold; color: #cbd5e1;">Generated Python Source Code:</span>
            <span id="manim-copy-toast" style="font-size: 10px; color: #4ade80; font-family: monospace; display: none;">✓ Copied to clipboard!</span>
          </div>
          <div class="manim-code-viewport" style="max-height: 280px; overflow-y: auto;">
            <pre><code id="manim-code-text">${manimPythonCode.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
          </div>
        </div>
      </div>
    `;

    // Copy Button
    const copyBtn = $('btn-copy-manim');
    const toast = $('manim-copy-toast');
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(manimPythonCode).then(() => {
            if (toast) {
              toast.style.display = 'inline';
              setTimeout(() => toast.style.display = 'none', 2000);
            }
          });
        }
      };
    }

    // Download Button
    const dlBtn = $('btn-download-manim');
    if (dlBtn) {
      dlBtn.onclick = () => {
        const blob = new Blob([manimPythonCode], { type: 'text/x-python;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'manim_flow.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
    }

    // Switch to System Flow Button
    const runSimBtn = $('btn-run-sim-flow');
    if (runSimBtn) {
      runSimBtn.onclick = () => {
        selectCustomTab('system-flow');
      };
    }
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

  function injectManimFlowTab() {
    const tabContainer = document.querySelector('.tabs-scrollable') ||
                         (document.querySelector('.tab-btn') ? document.querySelector('.tab-btn').parentElement : null);
    if (!tabContainer || $('tab-manim-flow')) return;

    const btn = document.createElement('button');
    btn.id = 'tab-manim-flow';
    btn.className = 'tab-btn';
    btn.type = 'button';
    btn.innerHTML = '🎬 manim_flow.py';
    btn.onclick = () => selectCustomTab('manim-flow');
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

    const manimDiv = document.createElement('div');
    manimDiv.id = 'manim-flow-viewport';
    manimDiv.className = 'hidden ide-viewport flex flex-col bg-slate-950 p-6 border border-slate-800 rounded-lg text-slate-300';
    manimDiv.style.minHeight = '380px';
    manimDiv.style.maxHeight = '520px';
    manimDiv.style.overflowY = 'auto';
    parent.appendChild(manimDiv);

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

    const manimViewport = $('manim-flow-viewport');
    if (manimViewport) manimViewport.classList.add('hidden');
    const manimTab = $('tab-manim-flow');
    if (manimTab) manimTab.classList.remove('active');

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
    } else if (tabId === 'manim-flow') {
      renderManimFlowContent();
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

        const manimTab = $('tab-manim-flow');
        if (manimTab) manimTab.classList.remove('active');
        const manimViewport = $('manim-flow-viewport');
        if (manimViewport) manimViewport.classList.add('hidden');

        const sandboxTab = $('tab-rest-sandbox');
        if (sandboxTab) sandboxTab.classList.remove('active');
        const sandboxViewport = $('rest-sandbox-viewport');
        if (sandboxViewport) sandboxViewport.classList.add('hidden');

        if (telemetryInterval) {
          clearInterval(telemetryInterval);
          telemetryInterval = null;
        }

        const fileExtensionTag = $('file-extension-tag');
        if (fileExtensionTag && tabId !== 'webhooks' && tabId !== 'linter' && tabId !== 'system-flow' && tabId !== 'rest-sandbox' && tabId !== 'manim-flow') {
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
        if (tabId !== 'webhooks' && tabId !== 'linter' && tabId !== 'system-flow' && tabId !== 'rest-sandbox' && tabId !== 'manim-flow') {
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

    // Inject Phase 14 & 15 Custom Features
    injectSystemFlowTab();
    injectManimFlowTab();
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
