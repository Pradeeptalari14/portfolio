// Systemd Service Builder & Manager Simulator Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initSystemdBuilder() {
  // Elements
  const $ = (id) => document.getElementById(id);
  const unitTypeSelect = $('unit_type');
  const serviceInputs = $('service-inputs');
  const timerInputs = $('timer-inputs');
  const socketInputs = $('socket-inputs');
  const pathInputs = $('path-inputs');

  const unitDesc = $('unit_desc');
  const unitAfter = $('unit_after');
  const unitWants = $('unit_wants');
  const serviceExecStart = $('service_exec');
  const serviceWorkdir = $('service_workdir');
  const serviceUser = $('service_user');
  const serviceRestart = $('service_restart');
  const serviceRestartSec = $('service_restart_sec');
  const installWantedBy = $('install_wantedby');

  const timerCalendar = $('timer_calendar');
  const timerActiveSec = $('timer_active_sec');
  const timerUnit = $('timer_unit');

  const socketListen = $('socket_listen');
  const socketAccept = $('socket_accept');

  const pathChanged = $('path_changed');
  const pathUnit = $('path_unit');

  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  
  // Simulator State
  let serviceState = {
    active: 'inactive', // inactive, active, failed
    enabled: 'disabled', // enabled, disabled
    pid: 0,
    startTime: null,
    logs: []
  };

  const terminalInput = $('terminal-input');
  const terminalBody = $('terminal-body');

  // Switch fields based on Unit Type
  function updateUnitTypeFields() {
    const type = unitTypeSelect.value;
    serviceInputs.classList.add('hidden');
    timerInputs.classList.add('hidden');
    socketInputs.classList.add('hidden');
    pathInputs.classList.add('hidden');

    if (type === 'service') {
      serviceInputs.classList.remove('hidden');
      downloadNameInput.value = 'app.service';
    } else if (type === 'timer') {
      timerInputs.classList.remove('hidden');
      downloadNameInput.value = 'app.timer';
    } else if (type === 'socket') {
      socketInputs.classList.remove('hidden');
      downloadNameInput.value = 'app.socket';
    } else if (type === 'path') {
      pathInputs.classList.remove('hidden');
      downloadNameInput.value = 'app.path';
    }
    compileUnit();
  }

  // Compiler logic
  function compileUnit() {
    const type = unitTypeSelect.value;
    let content = '';

    // Unit Section
    content += `[Unit]\n`;
    content += `Description=${unitDesc.value || 'Custom Systemd Unit'}\n`;
    content += `Documentation=https://github.com/Pradeeptalari14/portfolio\n`;
    if (unitAfter.value) content += `After=${unitAfter.value}\n`;
    if (unitWants.value) content += `Wants=${unitWants.value}\n`;
    content += `\n`;

    // Type Specific Section
    if (type === 'service') {
      content += `[Service]\n`;
      content += `Type=simple\n`;
      content += `ExecStart=${serviceExecStart.value || '/usr/bin/node /app/server.js'}\n`;
      if (serviceWorkdir.value) content += `WorkingDirectory=${serviceWorkdir.value}\n`;
      if (serviceUser.value) content += `User=${serviceUser.value}\n`;
      content += `Restart=${serviceRestart.value}\n`;
      content += `RestartSec=${serviceRestartSec.value}s\n`;
      content += `Environment=NODE_ENV=production PORT=8080\n`;
      content += `StandardOutput=journal\n`;
      content += `StandardError=journal\n`;
    } else if (type === 'timer') {
      content += `[Timer]\n`;
      if (timerCalendar.value) content += `OnCalendar=${timerCalendar.value}\n`;
      if (timerActiveSec.value) content += `OnUnitActiveSec=${timerActiveSec.value}s\n`;
      content += `Unit=${timerUnit.value || 'app.service'}\n`;
      content += `Persistent=true\n`;
    } else if (type === 'socket') {
      content += `[Socket]\n`;
      content += `ListenStream=${socketListen.value || '8080'}\n`;
      content += `Accept=${socketAccept.checked ? 'yes' : 'no'}\n`;
    } else if (type === 'path') {
      content += `[Path]\n`;
      content += `PathChanged=${pathChanged.value || '/opt/data/trigger.txt'}\n`;
      content += `Unit=${pathUnit.value || 'app.service'}\n`;
    }
    content += `\n`;

    // Install Section
    content += `[Install]\n`;
    content += `WantedBy=${installWantedBy.value || 'multi-user.target'}\n`;

    outputBox.textContent = content;
    updateSimulatorExplanation();
  }

  // Update simulator explanatory block
  function updateSimulatorExplanation() {
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Generates a validated systemd unit file of type <strong>${unitTypeSelect.value}</strong> configured to auto-bootstrap, track lifecycle hooks, and restart on failures automatically.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Save unit configuration to <code>/etc/systemd/system/${downloadNameInput.value}</code> and reload standard controllers.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `sudo cp ${downloadNameInput.value} /etc/systemd/system/\nsudo systemctl daemon-reload\nsudo systemctl enable ${downloadNameInput.value}\nsudo systemctl start ${downloadNameInput.value}`;
    }
    
    // Practices
    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Always run services as a non-privileged <code>User=</code> to protect filesystem paths.</li>
        <li>Specify absolute paths for <code>ExecStart=</code> executables.</li>
        <li>Set <code>RestartSec=</code> to buffer startup failure loops.</li>
      `;
    }
    
    // AI MLOps
    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `For AI training workloads, run timers to trigger daily validation sweeps or use systemd services to boot Local SLM/Ollama services on startup.`;
    }

    // Visual Flow
    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `[Systemd Controller] --(spawns)--> [ExecStart] --(outputs logs)--> [Journald]`;
    }
  }

  // Terminal Simulator Operations
  function writeTerminalLine(text, type = 'output') {
    const line = document.createElement('div');
    if (type === 'command') {
      line.className = 'text-slate-400 font-mono text-xs';
      line.innerHTML = `<span class="text-indigo-400">$</span> ${text}`;
    } else if (type === 'error') {
      line.className = 'text-red-400 font-mono text-xs';
      line.textContent = text;
    } else if (type === 'success') {
      line.className = 'text-green-400 font-mono text-xs';
      line.textContent = text;
    } else {
      line.className = 'text-slate-300 font-mono text-xs';
      line.innerHTML = text.replace(/\n/g, '<br/>');
    }
    if (terminalBody) {
      terminalBody.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  function executeTerminalCommand(cmd) {
    const cleanCmd = cmd.trim();
    writeTerminalLine(cleanCmd, 'command');

    const unitName = downloadNameInput.value;

    if (cleanCmd.startsWith('systemctl start')) {
      serviceState.active = 'active';
      serviceState.pid = Math.floor(Math.random() * 5000) + 1500;
      serviceState.startTime = new Date();
      serviceState.logs.push(`[${new Date().toLocaleTimeString()}] systemd[1]: Started ${unitDesc.value || 'Custom Service'}.`);
      serviceState.logs.push(`[${new Date().toLocaleTimeString()}] app[${serviceState.pid}]: Service bootstrap completed successfully.`);
      writeTerminalLine(`Systemd: Started ${unitName} successfully.`, 'success');
    } 
    else if (cleanCmd.startsWith('systemctl stop')) {
      serviceState.active = 'inactive';
      serviceState.pid = 0;
      serviceState.startTime = null;
      serviceState.logs.push(`[${new Date().toLocaleTimeString()}] systemd[1]: Stopped ${unitDesc.value || 'Custom Service'}.`);
      writeTerminalLine(`Systemd: Stopped ${unitName} successfully.`, 'success');
    }
    else if (cleanCmd.startsWith('systemctl enable')) {
      serviceState.enabled = 'enabled';
      writeTerminalLine(`Created symlink /etc/systemd/system/${installWantedBy.value}.wants/${unitName} → /etc/systemd/system/${unitName}.`, 'success');
    }
    else if (cleanCmd.startsWith('systemctl disable')) {
      serviceState.enabled = 'disabled';
      writeTerminalLine(`Removed symlink /etc/systemd/system/${installWantedBy.value}.wants/${unitName}.`, 'success');
    }
    else if (cleanCmd.startsWith('systemctl status')) {
      const activeText = serviceState.active === 'active' 
        ? `<span class="text-green-400">active (running)</span> since ${serviceState.startTime ? serviceState.startTime.toLocaleString() : 'just now'}` 
        : (serviceState.active === 'failed' ? '<span class="text-red-400">failed</span>' : '<span class="text-slate-500">inactive (dead)</span>');
      
      const loadedText = `loaded (/etc/systemd/system/${unitName}; ${serviceState.enabled}; vendor preset: enabled)`;
      const pidText = serviceState.pid ? `\n   Main PID: ${serviceState.pid} (node)` : '';
      
      const statusOutput = `● ${unitName} - ${unitDesc.value || 'Custom Systemd Unit'}
     Loaded: ${loadedText}
     Active: ${activeText}${pidText}
      Tasks: ${serviceState.active === 'active' ? '12 (limit: 4915)' : '0'}
     Memory: ${serviceState.active === 'active' ? '32.4M' : '0B'}
        CPU: ${serviceState.active === 'active' ? '82ms' : '0ms'}`;
      writeTerminalLine(statusOutput);
    }
    else if (cleanCmd.startsWith('journalctl -u')) {
      if (serviceState.logs.length === 0) {
        writeTerminalLine(`-- No entries --`);
      } else {
        writeTerminalLine(serviceState.logs.join('\n'));
      }
    }
    else if (cleanCmd === 'clear') {
      if (terminalBody) terminalBody.innerHTML = '';
    }
    else {
      writeTerminalLine(`bash: command not found: ${cleanCmd}. Try systemctl start/stop/enable/disable/status or journalctl -u.`, 'error');
    }
    
    updateStateBadges();
  }

  function updateStateBadges() {
    const activeBadge = $('state-active');
    const enabledBadge = $('state-enabled');
    
    if (activeBadge) {
      if (serviceState.active === 'active') {
        activeBadge.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-green-500/20 text-green-400 border border-green-500/30';
        activeBadge.textContent = 'Active (running)';
      } else {
        activeBadge.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-slate-500/20 text-slate-400 border border-slate-500/30';
        activeBadge.textContent = 'Inactive (dead)';
      }
    }

    if (enabledBadge) {
      if (serviceState.enabled === 'enabled') {
        enabledBadge.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
        enabledBadge.textContent = 'Enabled';
      } else {
        enabledBadge.className = 'px-2 py-0.5 text-[10px] font-mono rounded bg-slate-500/20 text-slate-400 border border-slate-500/30';
        enabledBadge.textContent = 'Disabled';
      }
    }
  }

  // Event Listeners
  if (unitTypeSelect) unitTypeSelect.addEventListener('change', updateUnitTypeFields);
  [
    unitDesc, unitAfter, unitWants, serviceExecStart, serviceWorkdir, serviceUser,
    serviceRestart, serviceRestartSec, installWantedBy, timerCalendar, timerActiveSec,
    timerUnit, socketListen, socketAccept, pathChanged, pathUnit
  ].forEach(el => {
    if (el) el.addEventListener('input', compileUnit);
  });

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = terminalInput.value;
        if (cmd) {
          executeTerminalCommand(cmd);
          terminalInput.value = '';
        }
      }
    });
  }

  // Simulator button shortcuts
  window.runSimCommand = (commandType) => {
    const unitName = downloadNameInput.value;
    let cmd = '';
    if (commandType === 'start') cmd = `systemctl start ${unitName}`;
    else if (commandType === 'stop') cmd = `systemctl stop ${unitName}`;
    else if (commandType === 'enable') cmd = `systemctl enable ${unitName}`;
    else if (commandType === 'disable') cmd = `systemctl disable ${unitName}`;
    else if (commandType === 'status') cmd = `systemctl status ${unitName}`;
    else if (commandType === 'journal') cmd = `journalctl -u ${unitName}`;
    
    executeTerminalCommand(cmd);
  };

  // Switch tabs
  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'unit-file') {
      const tab = $('tab-unit-file');
      if (tab) tab.classList.add('active');
      outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      const view = $('simulator-viewport');
      if (view) view.classList.remove('hidden');
    }
  };

  // Copy unit file content
  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Systemd configuration copied to clipboard!');
    });
  };

  // Download unit file
  window.downloadUnitFile = () => {
    const blob = new Blob([outputBox.textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Explain Active Tab Code
  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Initialize
  updateUnitTypeFields();
  writeTerminalLine('Linux systemd manager simulation. Type systemctl commands or use quick buttons above.', 'success');
}

if (document.readyState !== 'loading') {
  initSystemdBuilder();
} else {
  document.addEventListener('DOMContentLoaded', initSystemdBuilder);
}
