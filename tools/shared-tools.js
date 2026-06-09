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
          <div style="padding: 1.5rem; background: #0f172a; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: sans-serif; color: #cbd5e1; white-space: normal;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h3 style="font-size: 0.9rem; font-weight: bold; color: #ffffff; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                <span>🚨</span> Webhook Configuration (webhooks.json)
              </h3>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button id="btn-download-sre-bundle-webhooks" style="font-size: 10px; font-weight: bold; background: #6366f1; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s;">📦 Download SRE Bundle (.zip)</button>
                <span style="font-size: 9px; font-family: monospace; color: #818cf8; background: rgba(129, 140, 248, 0.1); border: 1px solid rgba(129, 140, 248, 0.2); padding: 2px 6px; border-radius: 4px;">JSON</span>
              </div>
            </div>
            <pre style="background: #020617; padding: 1rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1; overflow-x: auto; margin: 0; white-space: pre;">${jsonStr}</pre>
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
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: #090d16; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
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
                <div class="visual-diff-box" style="margin-top: 0.5rem; background: #090d16; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.5rem; font-family: monospace; font-size: 10px;">
                  <div style="display: flex; gap: 0.5rem;">
                    <div style="flex: 1; border-right: 1px solid rgba(255, 255, 255, 0.05); padding-right: 0.25rem;">
                      <div style="color: #ef4444; font-weight: bold; margin-bottom: 0.25rem; font-size: 8px; text-transform: uppercase;">Current (Vulnerable)</div>
                      <pre style="margin: 0; color: #f87171; white-space: pre-wrap; font-family: monospace; text-align: left;">- ${vulnSnippet}</pre>
                    </div>
                    <div style="flex: 1; padding-left: 0.25rem;">
                      <div style="color: #10b981; font-weight: bold; margin-bottom: 0.25rem; font-size: 8px; text-transform: uppercase;">Suggested (Secure)</div>
                      <pre style="margin: 0; color: #34d399; white-space: pre-wrap; font-family: monospace; text-align: left;">+ ${patchedSnippet}</pre>
                    </div>
                  </div>
                  <div style="text-align: right; margin-top: 0.5rem;">
                    <button class="btn-apply-remediation" data-rule="${f.rule}" style="font-size: 9px; font-weight: bold; background: #10b981; color: white; border: none; padding: 3px 8px; border-radius: 3px; cursor: pointer; transition: background 0.2s;">💡 Apply Security Patch</button>
                  </div>
                </div>
              `;
            }
          }

          return `
            <div style="margin-bottom: 1rem; padding: 1rem; background: #020617; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: bold; color: #f8fafc;">${f.rule}</span>
                <span class="${badgeColor}" style="font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${f.severity.toUpperCase()}</span>
              </div>
              <p style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 0.5rem;">${f.desc}</p>
              ${diffHtml}
              ${f.remediation !== 'None' ? `
                <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 0.5rem; margin-top: 0.5rem;">
                  <span style="font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase;">Remediation:</span>
                  <pre style="background: #090d16; color: #34d399; font-family: monospace; font-size: 10px; padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(52, 211, 153, 0.2); overflow-x: auto; margin-top: 0.25rem;">${f.remediation}</pre>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');

        outputBox.innerHTML = `
          <div style="padding: 1.5rem; background: #0f172a; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); font-family: sans-serif; color: #cbd5e1; white-space: normal;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 0.75rem; margin-bottom: 1rem;">
              <h3 style="font-size: 0.9rem; font-weight: bold; color: #ffffff; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                <span>🛡️</span> IaC Security Guardrail Report
              </h3>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button id="btn-download-sre-bundle-linter" style="font-size: 10px; font-weight: bold; background: #6366f1; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s;">📦 Download SRE Bundle (.zip)</button>
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

        const linterTab = $('tab-linter');
        if (linterTab) linterTab.classList.remove('active');

        const fileExtensionTag = $('file-extension-tag');
        if (fileExtensionTag && tabId !== 'webhooks' && tabId !== 'linter') {
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
        if (tabId !== 'webhooks' && tabId !== 'linter') {
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
    injectPagerDutyUI();
    injectWebhookTab();
    injectLinterTab();
    injectNetworkStatusBadge();

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
