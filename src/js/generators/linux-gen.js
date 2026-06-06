import { setupCompilerTriggers } from '../utils/events.js';
const SCRIPT_VERSION = '2.1.0';

const $ = (id) => document.getElementById(id);
    const $$ = (sel) => document.querySelectorAll(sel);

    let activeTab = 'script';

    let compiledCode = {
      script: '',
      scheduler: '',
      readme: ''
    ,
  flow: ''
};

    window.addEventListener('DOMContentLoaded', () => {
      setupInteractiveListeners();
      triggerCompileAll();
    });

    function setupInteractiveListeners() {
      // Show/Hide relevant options based on script purpose
      $('script_purpose').addEventListener('change', function() {
        const val = this.value;
        ['audit', 'cleanup', 'backup', 'process'].forEach(category => {
          const el = $(category + '-options');
          if (el) {
            if (val === category) {
              el.classList.remove('hidden');
            } else {
              el.classList.add('hidden');
            }
          }
        });
        triggerCompileAll();
      });

      // Update active tabs text based on shell platform selection
      $('shell_type').addEventListener('change', function() {
        const scriptBtn = $('tab-script');
        const schedulerBtn = $('tab-scheduler');
        const nameInput = $('download-name-input');
        const extTag = $('file-extension-tag');

        if (this.value === 'powershell') {
          scriptBtn.textContent = 'sre-script.ps1';
          schedulerBtn.textContent = 'task-scheduler.xml';
          if (activeTab === 'script') extTag.textContent = '.ps1';
          if (activeTab === 'scheduler') extTag.textContent = '.xml';
        } else {
          scriptBtn.textContent = 'sre-script.sh';
          schedulerBtn.textContent = 'cron-setup';
          if (activeTab === 'script') extTag.textContent = '.sh';
          if (activeTab === 'scheduler') extTag.textContent = '';
        }
        triggerCompileAll();
      });

      setupCompilerTriggers(triggerCompileAll);
    }

    function triggerCompileAll() {
      compileScript();
      compileScheduler();
      compileReadme();
      compileMermaidFlow();
  updateViewportContent();
    }

    function compileScript() {
      const shellType = $('shell_type').value;
      const purpose = $('script_purpose').value;
      const webhook = $('alert_webhook').value;
      const strict = $('sre_strict').checked;
      const logFile = $('sre_log_file').checked;

      let code = '';

      if (shellType === 'bash') {
        code += `#!/bin/bash\n`;
        code += `# sre-script.sh - Production System Automator script compiled via Pradeep's Studio\n`;
        
        if (strict) {
          code += `set -euo pipefail # Fail fast on error, undefined variables, and pipeline failures\n`;
        }
        
        if (logFile) {
          code += `LOG_FILE="/var/log/sre_audit.log"\n`;
          code += `exec 3>&1 1>>"\${LOG_FILE}" 2>&1 # Redirect stdout & stderr to logfile\n`;
          code += `echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting SRE Script execution" >&3\n`;
        }

        code += `\n# ── ENVIRONMENT WEBHOOK ALERT METHOD ──\n`;
        code += `send_alert() {\n  local msg="$1"\n  echo "🚨 Alerting: $msg"\n`;
        if (webhook) {
          code += `  curl -s -X POST -H 'Content-type: application/json' --data "{\\"text\\":\\"🚨 [SRE ALERT] Level: WARNING | Host: \${HOSTNAME} | Source: SRE-Shell-Engine\\\\nMessage: \$msg\\"}" "${webhook}" >/dev/null || true\n`;
        }
        code += `}\n\n`;

        if (purpose === 'audit') {
          const disk = $('disk_threshold').value;
          const ram = $('ram_threshold').value;
          const topCpu = $('audit_cpu').checked;
          const netstat = $('audit_networks').checked;

          code += `# ── AUDIT TASKS ──\n`;
          code += `echo "⏱️ Starting server performance audit..."\n\n`;
          code += `DISK_USAGE=$(df / | grep / | awk '{print $5}' | sed 's/%//')\n`;
          code += `if [ "\${DISK_USAGE}" -gt ${disk} ]; then\n`;
          code += `  send_alert "Disk space threshold exceeded! Disk usage is at \${DISK_USAGE}%"\n`;
          code += `else\n`;
          code += `  echo "✅ Disk Space check passed: \${DISK_USAGE}%"\n`;
          code += `fi\n\n`;
          
          code += `RAM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)\n`;
          code += `if [ "\${RAM_USAGE}" -gt ${ram} ]; then\n`;
          code += `  send_alert "Memory threshold exceeded! Memory usage is at \${RAM_USAGE}%"\n`;
          code += `else\n`;
          code += `  echo "✅ RAM Memory check passed: \${RAM_USAGE}%"\n`;
          code += `fi\n\n`;

          if (topCpu) {
            code += `echo "--- Top 5 CPU Consumers ---"\n`;
            code += `ps -eo pid,ppid,cmd,%cpu --sort=-%cpu | head -n 6\n\n`;
          }
          if (netstat) {
            code += `echo "--- Listening Network Sockets ---"\n`;
            code += `sudo ss -tulpn || sudo netstat -tulpn || true\n`;
          }
        } else if (purpose === 'cleanup') {
          const targetDir = $('cleanup_dir').value;
          const days = $('cleanup_retention').value;
          const compress = $('cleanup_zip').checked;
          const dryRun = $('cleanup_dry').checked;

          code += `# ── LOG RETENTION & CLEANUP TASKS ──\n`;
          code += `TARGET_DIR="${targetDir}"\n`;
          code += `RETENTION_DAYS=${days}\n\n`;
          code += `if [ ! -d "\${TARGET_DIR}" ]; then\n`;
          code += `  send_alert "Cleanup directory \${TARGET_DIR} does not exist!"\n`;
          code += `  exit 1\n`;
          code += `fi\n\n`;

          if (compress) {
            code += `echo "Compressing log files older than \${RETENTION_DAYS} days..."\n`;
            if (dryRun) {
              code += `echo "[DRY RUN] Would gzip find \\"\${TARGET_DIR}\\" -type f -name \\"*.log\\" -mtime +\${RETENTION_DAYS}"\n`;
            } else {
              code += `find "\${TARGET_DIR}" -type f -name "*.log" -mtime +\${RETENTION_DAYS} -exec gzip {} \\;\n`;
            }
          }

          code += `echo "Purging old archive logs..."\n`;
          if (dryRun) {
            code += `echo "[DRY RUN] Would delete files older than \${RETENTION_DAYS} days in \${TARGET_DIR}"\n`;
          } else {
            code += `find "\${TARGET_DIR}" -type f -name "*.gz" -mtime +\${RETENTION_DAYS} -delete\n`;
          }
        } else if (purpose === 'backup') {
          const src = $('backup_src').value;
          const dest = $('backup_dest').value;
          const inc = $('backup_incremental').checked;
          const checksum = $('backup_checksum').checked;

          code += `# ── FILESYNCHRONIZATION BACKUPS ──\n`;
          code += `SRC_PATH="${src}"\n`;
          code += `DEST_PATH="${dest}"\n\n`;
          code += `echo "Initiating backup task..."\n`;
          
          let cmd = '';
          if (dest.startsWith('s3://')) {
            cmd = `aws s3 sync "\${SRC_PATH}" "\${DEST_PATH}"`;
            if (checksum) cmd += ` --exact-timestamps`;
          } else {
            cmd = `rsync -avz`;
            if (inc) cmd += ` --update`;
            if (checksum) cmd += ` -c`;
            cmd += ` "\${SRC_PATH}/" "\${DEST_PATH}/"`;
          }
          
          code += `if ${cmd}; then\n`;
          code += `  echo "✅ Backup successfully synced to \${DEST_PATH}"\n`;
          code += `else\n`;
          code += `  send_alert "Backup execution failed for source: \${SRC_PATH}"\n`;
          code += `fi\n`;
        } else if (purpose === 'process') {
          const daemon = $('daemon_name').value;
          const restartCmd = $('daemon_action').value;

          code += `# ── PROCESS SERVICE MONITORING ──\n`;
          code += `DAEMON="${daemon}"\n`;
          code += `RESTART_CMD="${restartCmd}"\n\n`;
          code += `echo "Checking health status of process: \${DAEMON}"\n`;
          code += `if ! pgrep -x "\${DAEMON}" > /dev/null; then\n`;
          code += `  send_alert "Service \${DAEMON} is offline! Deploying auto-restart."\n`;
          code += `  if \${RESTART_CMD}; then\n`;
          code += `    echo "✅ Service \${DAEMON} restarted successfully."\n`;
          code += `  else\n`;
          code += `    send_alert "Failed to restart service \${DAEMON} using command: \${RESTART_CMD}"\n`;
          code += `  fi\n`;
          code += `else\n`;
          code += `  echo "✅ Service \${DAEMON} is running."\n`;
          code += `fi\n`;
        }
      } else {
        // PowerShell (.ps1)
        code += `# sre-script.ps1 - Production Windows PowerShell Script compiled via Pradeep's Studio\n`;
        
        if (strict) {
          code += `$ErrorActionPreference = 'Stop'\n`;
        }

        if (logFile) {
          code += `$LogPath = "C:\\ProgramData\\sre_audit.log"\n`;
          code += `Start-Transcript -Path $LogPath -Append -Confirm:$false\n\n`;
        }

        code += `function Send-Alert {\n  param([string]$message)\n  Write-Warning "Alert: $message"\n`;
        if (webhook) {
          code += `  $body = @{ text = "🚨 [SRE ALERT] Level: WARNING | Host: $env:COMPUTERNAME | Source: SRE-PowerShell-Engine\`nMessage: $message" } | ConvertTo-Json\n`;
          code += `  try {\n    Invoke-RestMethod -Uri "${webhook}" -Method Post -Body $body -ContentType 'application/json' | Out-Null\n  } catch {}\n`;
        }
        code += `}\n\n`;

        if (purpose === 'audit') {
          const disk = $('disk_threshold').value;
          const ram = $('ram_threshold').value;
          const topCpu = $('audit_cpu').checked;
          const netstat = $('audit_networks').checked;

          code += `# ── AUDIT SYSTEM HEALTH ──\n`;
          code += `Write-Output "Auditing disk and memory allocations..."\n`;
          code += `$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"\n`;
          code += `foreach ($disk in $disks) {\n`;
          code += `  $pctFree = [Math]::Round(($disk.FreeSpace / $disk.Size) * 100, 2)\n`;
          code += `  $pctUsed = 100 - $pctFree\n`;
          code += `  if ($pctUsed -gt ${disk}) {\n`;
          code += `    Send-Alert "Disk ($($disk.DeviceID)) space threshold exceeded! Used: $pctUsed%"\n`;
          code += `  } else {\n`;
          code += `    Write-Output "✅ Disk $($disk.DeviceID) Used: $pctUsed%"\n`;
          code += `  }\n`;
          code += `}\n\n`;

          code += `$os = Get-CimInstance Win32_OperatingSystem\n`;
          code += `$freeRam = $os.FreePhysicalMemory\n`;
          code += `$totalRam = $os.TotalVisibleMemorySize\n`;
          code += `$pctRamUsed = [Math]::Round((($totalRam - $freeRam) / $totalRam) * 100, 2)\n`;
          code += `if ($pctRamUsed -gt ${ram}) {\n`;
          code += `  Send-Alert "RAM Memory threshold exceeded! Used: $pctRamUsed%"\n`;
          code += `} else {\n`;
          code += `  Write-Output "✅ RAM Used: $pctRamUsed%"\n`;
          code += `}\n`;

          if (topCpu) {
            code += `\nWrite-Output "--- Top 5 CPU Processes ---"\n`;
            code += `Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Format-Table Id, ProcessName, CPU\n`;
          }
          if (netstat) {
            code += `\nWrite-Output "--- Listening Network Sockets ---"\n`;
            code += `Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess\n`;
          }
        } else if (purpose === 'cleanup') {
          const targetDir = $('cleanup_dir').value;
          const days = $('cleanup_retention').value;
          const compress = $('cleanup_zip').checked;
          const dryRun = $('cleanup_dry').checked;

          code += `# ── FILES CLEANUP PROCESS ──\n`;
          code += `$TargetFolder = "${targetDir.replace(/\//g, '\\')}"\n`;
          code += `$LimitDate = (Get-Date).AddDays(-${days})\n\n`;
          code += `if (!(Test-Path $TargetFolder)) {\n`;
          code += `  Send-Alert "Target cleanup directory $TargetFolder not found"\n`;
          code += `  exit\n`;
          code += `}\n\n`;

          code += `$oldFiles = Get-ChildItem $TargetFolder -File | Where-Object { $_.LastWriteTime -lt $LimitDate }\n`;
          code += `foreach ($file in $oldFiles) {\n`;
          if (compress) {
            code += `  Write-Output "Compressing and archiving: $($file.FullName)"\n`;
            if (!dryRun) {
              code += `  Compress-Archive -Path $file.FullName -DestinationPath "$($file.FullName).zip" -Force\n`;
              code += `  Remove-Item $file.FullName -Force\n`;
            }
          } else {
            code += `  Write-Output "Removing expired file: $($file.FullName)"\n`;
            if (!dryRun) {
              code += `  Remove-Item $file.FullName -Force\n`;
            }
          }
          code += `}\n`;
        } else if (purpose === 'backup') {
          const src = $('backup_src').value;
          const dest = $('backup_dest').value;
          const checksum = $('backup_checksum').checked;

          code += `# ── DATA SYNCHRONIZATION BACKUPS ──\n`;
          code += `$Source = "${src.replace(/\//g, '\\')}"\n`;
          code += `$Dest = "${dest.replace(/\//g, '\\')}"\n`;
          
          if (dest.startsWith('s3://')) {
            code += `Write-Output "Uploading backup datasets to AWS S3 bucket..."\n`;
            code += `aws s3 sync "$Source" "$Dest"\n`;
          } else {
            code += `Write-Output "Executing file sync via Robocopy..."\n`;
            let robocopyFlags = checksum ? '/COPY:DAT /E' : '/E';
            code += `Robocopy "$Source" "$Dest" ${robocopyFlags} /R:3 /W:5\n`;
          }
        } else if (purpose === 'process') {
          const daemon = $('daemon_name').value;
          const restartCmd = $('daemon_action').value;

          code += `# ── SERVICE HEALTH CHECK DAEMON ──\n`;
          code += `$ServiceName = "${daemon}"\n`;
          code += `$Service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue\n\n`;
          code += `if (-not $Service) {\n`;
          code += `  Send-Alert "Service $ServiceName is not installed on this system!"\n`;
          code += `  exit\n`;
          code += `}\n\n`;
          code += `if ($Service.Status -ne 'Running') {\n`;
          code += `  Send-Alert "Service $ServiceName is stopped. Triggering restart cmdlet..."\n`;
          code += `  ${restartCmd}\n`;
          code += `} else {\n`;
          code += `  Write-Output "✅ Service $ServiceName is operational."\n`;
          code += `}\n`;
        }

        if (logFile) {
          code += `\nStop-Transcript\n`;
        }
      }

      compiledCode.script = code;
    }

    function compileScheduler() {
      const shellType = $('shell_type').value;
      const purpose = $('script_purpose').value;

      let code = '';

      if (shellType === 'bash') {
        code += `# Cron job scheduling setups for SRE scripts\n`;
        code += `# Copy-paste these into your shell to install the task\n\n`;
        code += `# 1. Open the cron scheduler list:\n`;
        code += `crontab -e\n\n`;
        code += `# 2. Append the schedule entry at the bottom:\n`;
        
        if (purpose === 'audit') {
          code += `*/15 * * * * /usr/local/bin/sre-script.sh > /dev/null 2>&1  # Run every 15 minutes\n`;
        } else if (purpose === 'cleanup') {
          code += `0 2 * * * /usr/local/bin/sre-script.sh > /dev/null 2>&1     # Run daily at 2:00 AM\n`;
        } else if (purpose === 'backup') {
          code += `0 0 * * * /usr/local/bin/sre-script.sh > /dev/null 2>&1     # Run daily at midnight\n`;
        } else {
          code += `*/5 * * * * /usr/local/bin/sre-script.sh > /dev/null 2>&1   # Monitor health every 5 minutes\n`;
        }
      } else {
        // Windows Task Scheduler XML
        code += `<?xml version="1.0" encoding="UTF-16"?>\n`;
        code += `<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">\n`;
        code += `  <RegistrationInfo>\n`;
        code += `    <Description>SRE Automated Health Check & Tasks</Description>\n`;
        code += `  </RegistrationInfo>\n`;
        code += `  <Triggers>\n`;
        code += `    <CalendarTrigger>\n`;
        code += `      <StartBoundary>2026-06-03T02:00:00</StartBoundary>\n`;
        code += `      <Enabled>true</Enabled>\n`;
        code += `      <ScheduleByDay>\n`;
        code += `        <DaysInterval>1</DaysInterval>\n`;
        code += `      </ScheduleByDay>\n`;
        code += `    </CalendarTrigger>\n`;
        code += `  </Triggers>\n`;
        code += `  <Actions Context="Author">\n`;
        code += `    <Exec>\n`;
        code += `      <Command>powershell.exe</Command>\n`;
        code += `      <Arguments>-NoProfile -ExecutionPolicy Bypass -File C:\\SRE\\sre-script.ps1</Arguments>\n`;
        code += `    </Exec>\n`;
        code += `  </Actions>\n`;
        code += `</Task>\n`;
      }

      compiledCode.scheduler = code;
    }

    function compileReadme() {
      const shellType = $('shell_type').value;
      const purpose = $('script_purpose').value;

      let code = `# Production SRE Automation Guide\n\n`;
      code += `This repository artifact contains automated production tools configured dynamically for client-side deployments.\n\n`;
      code += `## Files Checklist\n`;
      if (shellType === 'bash') {
        code += `* \`sre-script.sh\`: Primary Bash automation script.\n`;
        code += `* \`cron-setup\`: Guide entries to install system crontab.\n`;
      } else {
        code += `* \`sre-script.ps1\`: Primary PowerShell script execution file.\n`;
        code += `* \`task-scheduler.xml\`: XML structure to register system schedule task.\n`;
      }
      code += `\n## Execution Guide\n`;
      if (shellType === 'bash') {
        code += `### Linux Setup\n`;
        code += `1. Move the shell file to a executable path:\n`;
        code += `   \`\`\`bash\n`;
        code += `   sudo mv sre-script.sh /usr/local/bin/sre-script.sh\n`;
        code += `   sudo chmod +x /usr/local/bin/sre-script.sh\n`;
        code += `   \`\`\`\n`;
        code += `2. Run manually to check output diagnostics:\n`;
        code += `   \`\`\`bash\n`;
        code += `   /usr/local/bin/sre-script.sh\n`;
        code += `   \`\`\`\n`;
      } else {
        code += `### Windows PowerShell Setup\n`;
        code += `1. Save files to secure system storage \`C:\\SRE\\sre-script.ps1\`\n`;
        code += `2. Run inside PowerShell console with elevated bypass privileges:\n`;
        code += `   \`\`\`powershell\n`;
        code += `   powershell.exe -ExecutionPolicy Bypass -File C:\\SRE\\sre-script.ps1\n`;
        code += `   \`\`\`\n`;
      }

      compiledCode.readme = code;
    }

    
function compileMermaidFlow() {
  let chart = 'graph TD\n  Script[📄 Bash/PowerShell Script] -->|Execute| OS[🐧 OS Kernel]\n  OS -->|Manage| Sysd[⚙️ systemd services]\n  OS -->|Cron Job| Scheduler[🕒 Periodic Schedules]\n  OS -->|Health Check| Alert[🚨 SLA Alerts]';
  compiledCode.flow = chart;
}

function switchTab(tabId) {
      activeTab = tabId;
      $$('.tab-btn').forEach(btn => btn.classList.remove('active'));
      $('tab-' + tabId).classList.add('active');

      const nameBox = $('download-name-input');
      const extTag = $('file-extension-tag');
      const shellType = $('shell_type').value;

      if (tabId === 'flow') {
    nameBox.value = 'flow';
    extTag.textContent = '.mermaid';
  } else if (tabId === 'script') {
        nameBox.value = 'sre-script';
        extTag.textContent = (shellType === 'powershell') ? '.ps1' : '.sh';
      } else if (tabId === 'scheduler') {
        nameBox.value = (shellType === 'powershell') ? 'task-scheduler' : 'cron-setup';
        extTag.textContent = (shellType === 'powershell') ? '.xml' : '';
      } else if (tabId === 'readme') {
        nameBox.value = 'README';
        extTag.textContent = '.md';
      }
      updateViewportContent();
    }

    function updateViewportContent() {
  if (activeTab === 'flow') {
    $('output-box').classList.add('hidden');
    $('mermaid-container').classList.remove('hidden');

    const container = $('mermaid-container');
    container.innerHTML = '<div class="mermaid text-center">' + compiledCode.flow + '</div>';

    if (typeof mermaid === 'undefined') {
      container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid library is not loaded. Please check your internet connection or reload the page.\n\nCode:\n${compiledCode.flow}</pre>`;
    } else {
      try {
        mermaid.run({
          nodes: [container.querySelector('.mermaid')]
        });
      } catch (e) {
        console.error("Mermaid render error:", e);
        container.innerHTML = `<pre class="text-rose-400 font-mono text-xs p-4">Mermaid Render Error: ${e.message}\n\nCode:\n${compiledCode.flow}</pre>`;
      }
    }
  } else {
    $('output-box').classList.remove('hidden');
    $('mermaid-container').classList.add('hidden');
    $('output-box').textContent = compiledCode[activeTab];
  }
}

    function copyActiveTabContent() {
      const content = compiledCode[activeTab];
      navigator.clipboard.writeText(content).then(() => {
        showToast('✅ Copied tab config to clipboard!');
      });
    }

    function downloadScriptZip() {
      const shellType = $('shell_type').value;
      const zip = new JSZip();
      
      if (shellType === 'powershell') {
        zip.file('sre-script.ps1', compiledCode.script);
        zip.file('task-scheduler.xml', compiledCode.scheduler);
      } else {
        zip.file('sre-script.sh', compiledCode.script);
        zip.file('cron-setup', compiledCode.scheduler);
      }
      zip.file('README.md', compiledCode.readme);

      zip.generateAsync({ type: 'blob' }).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `sre-script-${shellType}.zip`;
        a.click();
        showToast('⬇️ Shell automation scripts downloaded successfully!');
      });
    }

    function clearAllFields() {
      $('shell_type').value = 'bash';
      $('script_purpose').value = 'audit';
      $('alert_webhook').value = 'https://hooks.slack.com/services/T000/B000/XXXXXX';
      $('disk_threshold').value = '85';
      $('ram_threshold').value = '90';
      $('audit_cpu').checked = true;
      $('audit_networks').checked = true;
      $('sre_strict').checked = true;
      $('sre_log_file').checked = true;

      // trigger category element visibility
      $('audit-options').classList.remove('hidden');
      $('cleanup-options').classList.add('hidden');
      $('backup-options').classList.add('hidden');
      $('process-options').classList.add('hidden');

      // reset tabs
      $('tab-script').textContent = 'sre-script.sh';
      $('tab-scheduler').textContent = 'cron-setup';

      triggerCompileAll();
      showToast('🗑️ Defaults configurations successfully restored!');
    }

    function showToast(message) {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.className = 'fixed bottom-6 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-xl shadow-lg z-50 border border-slate-800 transition duration-300';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  
    const tabExplanations = {'sysadmin': {'title': 'Linux System Automation Script', 'filename': 'sysadmin.sh', 'why': 'Automates server initialization tasks (package updates, user configurations, disk limits, cron setups, and firewall controls).', 'when': 'Use to spin up, configure, and secure new Linux servers automatically.', 'where': 'Execute directly on the target server with sudo/root privileges.', 'command': 'chmod +x sysadmin.sh && sudo ./sysadmin.sh', 'practices': ['Test scripts inside Vagrant or virtual boxes first.', 'Ensure script exits instantly on command failures (`set -e`).', 'Log execution trace to log files for tracking.'], 'ai_mlops': 'Optimizes kernel properties to run heavy vector databases and local LLM layers.', 'flow': '[Execute sysadmin.sh] ➔ [Updates packages] ➔ [Creates users] ➔ [Locks firewall]'}, 'readme': {'title': 'Sysadmin Guide', 'filename': 'README.md', 'why': 'Details running arguments, safety parameters, and verification checklists.', 'when': 'Include in the script repository to help sysadmins maintain host automation scripts.', 'where': 'Save in the root of your scripting folder.', 'command': '# View in markdown reader', 'practices': ['List prerequisite system packages.', 'Explain script options.', 'Provide manual check steps.'], 'ai_mlops': 'Guides systemd setup for running local AI automation daemons.', 'flow': '[README.md Guide] ➔ [Guides safe execution steps]'}};

    function explainActiveTabCode() {
      const explanation = tabExplanations[activeTab];
      if (!explanation) {
        showToast("⚠️ No explanation available for this tab.");
        return;
      }

      // Populate drawer content
      document.getElementById('drawer-title').textContent = explanation.title;
      document.getElementById('drawer-filename').textContent = explanation.filename;
      document.getElementById('explain-why').innerHTML = explanation.why;
      document.getElementById('explain-when').innerHTML = explanation.when;
      
      document.getElementById('explain-where').innerHTML = explanation.where;
      document.getElementById('explain-command').textContent = explanation.command;

      const practicesBox = document.getElementById('explain-practices');
      practicesBox.innerHTML = '';
      explanation.practices.forEach(practice => {
        const li = document.createElement('li');
        li.innerHTML = practice;
        practicesBox.appendChild(li);
      });

      // Populate AI/MLOps Integration
      document.getElementById('explain-ai-mlops').innerHTML = explanation.ai_mlops || 'Integrated with MLOps pipelines and SRE AI workloads.';

      document.getElementById('explain-flow').textContent = explanation.flow;

      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
    }

    function closeExplanationDrawer() {
      const drawer = document.getElementById('explanation-drawer');
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('translate-x-full');
    }

// Expose functions globally for HTML inline event handlers
window.clearAllFields = clearAllFields;
window.closeExplanationDrawer = closeExplanationDrawer;
window.copyActiveTabContent = copyActiveTabContent;
window.downloadScriptZip = downloadScriptZip;
window.explainActiveTabCode = explainActiveTabCode;
window.switchTab = switchTab;
window.triggerCompileAll = triggerCompileAll;
