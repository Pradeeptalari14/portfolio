// Terraform Drift Auditor logic

const SCRIPT_VERSION = "1.0.0";

function initTerraformDriftStudio() {
  const elements = {
    target: document.getElementById('drift_target'),
    schedule: document.getElementById('drift_schedule'),
    reconcile: document.getElementById('drift_reconcile'),
    outputBox: document.getElementById('output-box'),
    downloadInput: document.getElementById('download-name-input'),
    // Simulator elements
    btnTriggerDrift: document.getElementById('btn_trigger_drift'),
    btnRunAudit: document.getElementById('btn_run_audit'),
    auditLogs: document.getElementById('audit-logs-output'),
    simStatusVal: document.getElementById('sim-status-val'),
  };

  let activeTab = 'cronjob';
  let hasDrift = false;

  function generateCronJobYaml() {
    const target = elements.target ? elements.target.value : 'aws_sg';
    const cron = elements.schedule ? elements.schedule.value : '0 * * * *';

    return `# Kubernetes CronJob for scheduled drift checking - Compiled v${SCRIPT_VERSION}
apiVersion: batch/v1
kind: CronJob
metadata:
  name: tf-drift-auditor-${target.replace('_', '-')}
  namespace: monitoring
spec:
  schedule: "${cron}"
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: drift-auditor
              image: hashicorp/terraform:1.6.0
              command: ["/bin/sh", "-c"]
              args:
                - |
                  terraform init -input=false
                  terraform plan -detailed-exitcode -no-color || exit_code=$?
                  if [ $exit_code -eq 2 ]; then
                    echo "Infrastructure Drift Detected!"
                    # Trigger alert webhook
                    curl -X POST http://alertmanager:9093/api/v1/alerts
                    exit 2
                  fi
              env:
                - name: AWS_ACCESS_KEY_ID
                  valueFrom:
                    secretKeyRef:
                      name: aws-creds
                      key: access-key
                - name: AWS_SECRET_ACCESS_KEY
                  valueFrom:
                    secretKeyRef:
                      name: aws-creds
                      key: secret-key
          restartPolicy: OnFailure
`;
  }

  function generateRunbookSh() {
    const reconcileMode = elements.reconcile ? elements.reconcile.checked : false;

    return `# Auto-reconciliation drift remediation runbook - Compiled v${SCRIPT_VERSION}
# Mode: ${reconcileMode ? 'AUTOMATIC RECONCILIATION' : 'ALERT ONLY'}

echo "Retrieving latest Terraform state lock..."
terraform init -input=false -reconfigure

echo "Running Plan to assess resource drift..."
terraform plan -no-color

${reconcileMode ? `echo "Auto-Reconciliation Enabled. Overwriting manual console changes..."
terraform apply -auto-approve -input=false
echo "Remediation Successful. Infrastructure aligned back to source-of-truth Git code."` : `echo "Auto-Reconciliation Disabled. Filing Slack alert and PagerDuty incident..."
# Alert webhook execution
curl -s -X POST -H 'Content-type: application/json' \\
  --data '{"text":"🚨 Terraform Drift Alert: Manual changes detected in production environment!"}' \\
  "\${SLACK_WEBHOOK_URL}"`}
`;
  }

  function updateOutput() {
    if (!elements.outputBox) return;

    if (activeTab === 'cronjob') {
      elements.outputBox.textContent = generateCronJobYaml();
      if (elements.downloadInput) elements.downloadInput.value = 'drift-cronjob.yaml';
    } else if (activeTab === 'runbook') {
      elements.outputBox.textContent = generateRunbookSh();
      if (elements.downloadInput) elements.downloadInput.value = 'remediate-runbook.sh';
    }
  }

  function triggerManualDrift() {
    if (!elements.auditLogs) return;
    hasDrift = true;
    
    const row = document.createElement('div');
    row.className = 'text-amber-500 font-bold';
    row.textContent = `[${new Date().toLocaleTimeString()}] COMMAND INTERFACE: Manual change introduced in cloud console (e.g. Ports opened, S3 ACL public).`;
    elements.auditLogs.appendChild(row);
    elements.auditLogs.scrollTop = elements.auditLogs.scrollHeight;

    if (elements.simStatusVal) {
      elements.simStatusVal.textContent = 'DRIFT DETECTED';
      elements.simStatusVal.className = 'text-xs font-bold text-amber-500';
    }
  }

  function executeDriftAudit() {
    if (!elements.auditLogs) return;

    elements.auditLogs.innerHTML = '';
    const autoRemediate = elements.reconcile ? elements.reconcile.checked : false;
    const target = elements.target ? elements.target.value : 'aws_sg';

    const addLog = (msg, type = 'info') => {
      const el = document.createElement('div');
      el.className = type === 'error' ? 'text-rose-500' : (type === 'warn' ? 'text-amber-500' : 'text-slate-300');
      el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      elements.auditLogs.appendChild(el);
      elements.auditLogs.scrollTop = elements.auditLogs.scrollHeight;
    };

    addLog("Auditing pipeline: initialising Terraform state locks.");
    addLog("State Engine: fetching AWS cloud state mappings.");

    setTimeout(() => {
      addLog("Planning: comparing live resources against Git state manifests.");

      if (hasDrift) {
        addLog("State Matcher: warning: Out-of-band diff detected!", "warn");
        
        if (target === 'aws_sg') {
          addLog("DIFF: aws_security_group.ingress - unexpected rule ALLOW TCP 22 from 0.0.0.0/0", "error");
        } else if (target === 'aws_s3') {
          addLog("DIFF: aws_s3_bucket.data_bucket - unexpected ACL public-read override", "error");
        } else {
          addLog("DIFF: aws_iam_policy.admin - unexpected role attachment policy mismatch", "error");
        }

        if (autoRemediate) {
          addLog("Reconciliation: Auto-remediation is ACTIVE. Applying code state...", "warn");
          
          setTimeout(() => {
            addLog("Applying: restoring default state constraints...", "info");
            addLog("Remediation: manual edits overwritten successfully. State lock released.", "info");
            hasDrift = false;
            
            if (elements.simStatusVal) {
              elements.simStatusVal.textContent = 'IN SYNC';
              elements.simStatusVal.className = 'text-xs font-bold text-emerald-500';
            }
          }, 800);
        } else {
          addLog("Reconciliation: Auto-remediation is DISABLED. Generating audit alerts.", "error");
          addLog("Alertmanager: Slack webhook notification sent successfully.", "warn");
        }
      } else {
        addLog("State Matcher: Cloud environment in perfect sync with Git codebase.", "info");
        if (elements.simStatusVal) {
          elements.simStatusVal.textContent = 'IN SYNC';
          elements.simStatusVal.className = 'text-xs font-bold text-emerald-500';
        }
      }
    }, 150);
  }

  // Setup tab routing
  window.switchTab = function(tabName) {
    activeTab = tabName;
    
    // Toggle active classes on tab buttons
    ['cronjob', 'runbook', 'simulator'].forEach(tab => {
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
      updateOutput();
    }
  };

  // Bind controls listeners
  [elements.target, elements.schedule, elements.reconcile].forEach(ctrl => {
    if (ctrl) ctrl.addEventListener('change', updateOutput);
  });

  if (elements.btnTriggerDrift) elements.btnTriggerDrift.addEventListener('click', triggerManualDrift);
  if (elements.btnRunAudit) elements.btnRunAudit.addEventListener('click', executeDriftAudit);

  // Initial runs
  updateOutput();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('drift_target')) {
    initTerraformDriftStudio();
  }
});
window.initTerraformDriftStudio = initTerraformDriftStudio;
