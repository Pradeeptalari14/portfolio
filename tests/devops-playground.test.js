import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadFullHTML() {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  
  // Resolve load tags manually to construct the full JSDOM DOM
  const replacedHtml = indexHtml.replace(/<load\s+src="([^"]+)"\s*\/>/g, (match, src) => {
    const sectionPath = path.resolve(__dirname, '..', src);
    if (fs.existsSync(sectionPath)) {
      return fs.readFileSync(sectionPath, 'utf8');
    }
    return '';
  });
  
  return replacedHtml;
}

describe('DevOps & SRE Interactive Playground Widgets', () => {
  let dom;
  let window;
  let document;

  beforeAll(() => {
    const htmlText = loadFullHTML();
    dom = new JSDOM(htmlText, {
      runScripts: "dangerously",
      resources: "usable"
    });
    window = dom.window;
    document = window.document;

    // Mock required DOM APIs and external assets
    window.fetch = () => Promise.resolve({
      ok: true,
      headers: { 'Accept': 'application/json' },
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('ok')
    });
    window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
    };

    // Load and execute script.js
    const scriptPath = path.resolve(__dirname, '../script.js');
    const scriptText = fs.readFileSync(scriptPath, 'utf8');
    window.eval(scriptText);
  });

  describe('Interactive SRE Terminal Console', () => {
    it('should initialize terminal greeting in history', () => {
      const history = document.getElementById('terminalHistory');
      expect(history).not.toBeNull();
      expect(history.textContent).toContain('Welcome to tp-shell');
    });

    it('should evaluate help command and display usage description', () => {
      const input = document.getElementById('terminalInput');
      const history = document.getElementById('terminalHistory');
      
      input.value = 'help';
      const event = new window.KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(history.textContent).toContain('help     - Show list of available commands');
      expect(history.textContent).toContain('neofetch - Display system info');
    });

    it('should evaluate neofetch command and show mock OS information', () => {
      const input = document.getElementById('terminalInput');
      const history = document.getElementById('terminalHistory');

      input.value = 'neofetch';
      const event = new window.KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(history.textContent).toContain('OS: TalariOS');
      expect(history.textContent).toContain('Shell: bash-tp-custom');
    });

    it('should evaluate clear command and empty history list', () => {
      const input = document.getElementById('terminalInput');
      const history = document.getElementById('terminalHistory');

      input.value = 'clear';
      const event = new window.KeyboardEvent('keydown', { key: 'Enter' });
      input.dispatchEvent(event);

      expect(history.textContent).toBe('');
    });
  });

  describe('SLA & Error Budget Calculator & Game', () => {
    it('should calculate downtime thresholds based on slider values', () => {
      const slider = document.getElementById('slaSlider');
      const targetVal = document.getElementById('sla-target-val');
      const weekly = document.getElementById('downtime-weekly');
      
      expect(targetVal.textContent).toBe('99.9%');
      expect(weekly.textContent).toBe('10.08 min');

      // Change SLA slider value
      slider.value = '3';
      slider.dispatchEvent(new window.Event('input'));

      expect(targetVal.textContent).toBe('99.99%');
      expect(weekly.textContent).toBe('1.01 min');
    });

    it('should trigger outage incident response choices', () => {
      const startBtn = document.getElementById('btnStartChaosGame');
      const systemStatus = document.getElementById('game-system-status');
      const incidentBox = document.getElementById('game-active-incident');

      expect(incidentBox.classList.contains('hidden')).toBe(true);

      startBtn.dispatchEvent(new window.Event('click'));

      expect(systemStatus.textContent).toBe('INCIDENT ACTIVE');
      expect(incidentBox.classList.contains('hidden')).toBe(false);
    });
  });

  describe('ArgoCD GitOps Deployment Simulator', () => {
    it('should change pod visual states to OutOfSync on Git Push Commit click', () => {
      const commitBtn = document.getElementById('btnGitCommit');
      const syncStatus = document.getElementById('argocd-sync-status');
      const podsGrid = document.getElementById('podsGrid');

      expect(syncStatus.textContent).toBe('Synced');

      commitBtn.dispatchEvent(new window.Event('click'));

      expect(syncStatus.textContent).toBe('OutOfSync');
      const circles = podsGrid.querySelectorAll('.pod-circle');
      circles.forEach(c => {
        expect(c.className).toContain('pod-out-of-sync');
      });
    });

    it('should route traffic to DR cluster and shut down primary on failover toggle', () => {
      const toggleFailover = document.getElementById('toggleArgoFailover');
      const ingressRoute = document.getElementById('ingress-target-route');
      const statusPrimary = document.getElementById('primary-cluster-status');
      const statusDr = document.getElementById('dr-cluster-status');
      const podsGrid = document.getElementById('podsGrid');
      const podsGridDR = document.getElementById('podsGridDR');

      expect(toggleFailover).not.toBeNull();

      // Toggle failover active
      toggleFailover.checked = true;
      toggleFailover.dispatchEvent(new window.Event('change'));

      expect(ingressRoute.textContent).toBe('eu-central-1 (DR)');
      expect(statusPrimary.textContent).toBe('Offline');
      expect(statusDr.textContent).toBe('Active');

      // Primary pods should be shutdown (no pod-running or pod-out-of-sync class)
      const primaryCircles = podsGrid.querySelectorAll('.pod-circle');
      primaryCircles.forEach(c => {
        expect(c.className).toBe('pod-circle');
      });

      // DR pods should match current sync state (which is currently OutOfSync)
      const drCircles = podsGridDR.querySelectorAll('.pod-circle');
      drCircles.forEach(c => {
        expect(c.className).toContain('pod-out-of-sync');
      });

      // Toggle failover inactive again
      toggleFailover.checked = false;
      toggleFailover.dispatchEvent(new window.Event('change'));

      expect(ingressRoute.textContent).toBe('us-east-1 (Primary)');
      expect(statusPrimary.textContent).toBe('Online');
      expect(statusDr.textContent).toBe('Standby');
    });

    it('should run multi-cluster rollout sync animation correctly', async () => {
      const syncBtn = document.getElementById('btnArgoSync');
      const syncStatus = document.getElementById('argocd-sync-status');
      const podsGrid = document.getElementById('podsGrid');

      // Sync the commit
      syncBtn.dispatchEvent(new window.Event('click'));
      expect(syncStatus.textContent).toBe('Syncing...');

      // Wait for the animation simulation (600ms * 4 pods = 2400ms)
      await new Promise(r => setTimeout(r, 2600));

      expect(syncStatus.textContent).toBe('Synced');
      
      const primaryCircles = podsGrid.querySelectorAll('.pod-circle');
      primaryCircles.forEach(c => {
        expect(c.className).toContain('pod-running');
      });
    }, 5000); // 5s timeout
  });

  describe('Chaos Injector & Auto-Healing Dashboard', () => {
    it('should spike CPU metrics when Spike CPU action is triggered', () => {
      const cpuBtn = document.getElementById('btnChaosCPU');
      const cpuVal = document.getElementById('metric-cpu-val');
      const cpuBar = document.getElementById('metric-cpu-bar');

      cpuBtn.dispatchEvent(new window.Event('click'));

      expect(cpuVal.textContent).toBe('98');
      expect(cpuBar.style.width).toBe('98%');
    });
  });

  describe('Playground Tab Switching', () => {
    it('should toggle between Core SRE, Kernel, and Delivery widgets groups', () => {
      const groupCore = document.getElementById('group-play-core');
      const groupKernel = document.getElementById('group-play-kernel');
      const groupDelivery = document.getElementById('group-play-delivery');

      expect(groupCore.classList.contains('hidden')).toBe(false);
      expect(groupKernel.classList.contains('hidden')).toBe(true);
      expect(groupDelivery.classList.contains('hidden')).toBe(true);

      // Switch to Kernel & IaC tab
      window.switchPlaygroundTab('kernel');
      expect(groupCore.classList.contains('hidden')).toBe(true);
      expect(groupKernel.classList.contains('hidden')).toBe(false);
      expect(groupDelivery.classList.contains('hidden')).toBe(true);

      // Switch to Delivery & Autoscaling tab
      window.switchPlaygroundTab('delivery');
      expect(groupCore.classList.contains('hidden')).toBe(true);
      expect(groupKernel.classList.contains('hidden')).toBe(true);
      expect(groupDelivery.classList.contains('hidden')).toBe(false);

      // Switch back
      window.switchPlaygroundTab('core');
      expect(groupCore.classList.contains('hidden')).toBe(false);
      expect(groupKernel.classList.contains('hidden')).toBe(true);
      expect(groupDelivery.classList.contains('hidden')).toBe(true);
    });
  });

  describe('eBPF Network Packet Sniffer', () => {
    it('should block port 22 SSH traffic when toggle is enabled', async () => {
      const togglePort = document.getElementById('toggleEbpfPort');
      const xdpHook = document.getElementById('ebpf-xdp-hook');
      const consoleLog = document.getElementById('ebpfConsole');

      expect(xdpHook.classList.contains('flash-alert')).toBe(false);

      // Enable port 22 drop filter
      togglePort.checked = true;

      // Simulate sending SSH packet
      const btnSsh = document.getElementById('btnEbpfSsh');
      btnSsh.dispatchEvent(new window.Event('click'));

      // Wait 600ms for hook inspection evaluation
      await new Promise(r => setTimeout(r, 600));

      expect(xdpHook.classList.contains('flash-alert')).toBe(true);
      expect(consoleLog.textContent).toContain('SSH traffic blocked at kernel level');
    });
  });

  describe('Terraform Drift Reconciler', () => {
    it('should detect state drift and run apply to restore topology', async () => {
      const btnDrift = document.getElementById('btnTfDrift');
      const btnPlan = document.getElementById('btnTfPlan');
      const btnApply = document.getElementById('btnTfApply');
      const sgStatus = document.getElementById('tf-sg-status');
      const diffTerminal = document.getElementById('tfDiffTerminal');

      expect(sgStatus.textContent).toBe('OK');

      // 1. Trigger Drift
      btnDrift.dispatchEvent(new window.Event('click'));
      expect(sgStatus.textContent).toContain('DRIFT: Port 22 open');
      expect(diffTerminal.textContent).toContain('State discrepancy detected');

      // 2. Run Plan
      btnPlan.dispatchEvent(new window.Event('click'));
      expect(diffTerminal.textContent).toContain('Plan: 0 to add, 1 to change, 0 to destroy');

      // 3. Run Apply
      btnApply.dispatchEvent(new window.Event('click'));
      expect(diffTerminal.textContent).toContain('Acquiring state lock');

      // Wait for apply completes simulation delay
      await new Promise(r => setTimeout(r, 1400));
      expect(sgStatus.textContent).toBe('OK');
      expect(diffTerminal.textContent).toContain('Apply complete');
    });
  });

  describe('Alertmanager Routing Tree', () => {
    it('should silences alert and route metrics correctly', async () => {
      const toggleSilence = document.getElementById('toggleSilenceCpu');
      const btnCpu = document.getElementById('btnTriggerCpuAlert');
      const nodeCpu = document.getElementById('am-src-cpu');

      expect(nodeCpu.classList.contains('am-active-red')).toBe(false);

      // Simulate trigger CPU alert
      btnCpu.dispatchEvent(new window.Event('click'));
      expect(nodeCpu.classList.contains('am-active-red')).toBe(true);
    });
  });

  describe('CI/CD Pipeline Runner Widget', () => {
    it('should run CI/CD stages and succeed under default settings', async () => {
      const btnRun = document.getElementById('btnRunCicd');
      const stageCheckout = document.getElementById('cicd-stage-checkout');
      const stageDeploy = document.getElementById('cicd-stage-deploy');
      const consoleLog = document.getElementById('cicdConsole');

      // Trigger pipeline run
      btnRun.dispatchEvent(new window.Event('click'));

      // Wait 3.5s for all stages (400ms + 600ms + 600ms + 500ms + 600ms = 2700ms total)
      await new Promise(r => setTimeout(r, 3200));

      expect(stageCheckout.classList.contains('cicd-stage-success')).toBe(true);
      expect(stageDeploy.classList.contains('cicd-stage-success')).toBe(true);
      expect(consoleLog.textContent).toContain('[DEPLOY] Rollout completed');
    });

    it('should fail lint stage if Fail Test Suite toggle is active', async () => {
      const btnRun = document.getElementById('btnRunCicd');
      const toggleFail = document.getElementById('toggleCicdFailTest');
      const stageLint = document.getElementById('cicd-stage-lint');
      const consoleLog = document.getElementById('cicdConsole');

      toggleFail.checked = true;

      // Trigger pipeline run
      btnRun.dispatchEvent(new window.Event('click'));

      // Wait 1.5s for lint stage to run and fail
      await new Promise(r => setTimeout(r, 1200));

      expect(stageLint.classList.contains('cicd-stage-fail')).toBe(true);
      expect(consoleLog.textContent).toContain('Error: 3 unit tests failed');

      // Reset toggle
      toggleFail.checked = false;
    });

    it('should fail security scan if CVE toggle is active', async () => {
      const btnRun = document.getElementById('btnRunCicd');
      const toggleVuln = document.getElementById('toggleCicdVuln');
      const stageSecurity = document.getElementById('cicd-stage-security');
      const consoleLog = document.getElementById('cicdConsole');

      toggleVuln.checked = true;

      // Trigger pipeline run
      btnRun.dispatchEvent(new window.Event('click'));

      // Wait 2s for security stage to run and fail
      await new Promise(r => setTimeout(r, 1800));

      expect(stageSecurity.classList.contains('cicd-stage-fail')).toBe(true);
      expect(consoleLog.textContent).toContain('Critical CVE-2026-9045 found');

      // Reset toggle
      toggleVuln.checked = false;
    });
  });

  describe('Karpenter Autoscaling Simulator', () => {
    it('should scale nodes count dynamically based on replica count', () => {
      const slider = document.getElementById('karpenterSlider');
      const podVal = document.getElementById('karpenter-pod-count');
      const nodeVal = document.getElementById('karpenter-node-count');
      const costVal = document.getElementById('karpenter-cost-val');

      // Set pods target to 8
      slider.value = '8';
      slider.dispatchEvent(new window.Event('input'));

      expect(podVal.textContent).toBe('8');
      expect(nodeVal.textContent).toBe('2');
      expect(costVal.textContent).toBe('$0.48');

      // Set pods target to 12
      slider.value = '12';
      slider.dispatchEvent(new window.Event('input'));

      expect(podVal.textContent).toBe('12');
      expect(nodeVal.textContent).toBe('3');
      expect(costVal.textContent).toBe('$0.72');
    });

    it('should lower hourly cost and use spot instances when spot prioritization is active', () => {
      const slider = document.getElementById('karpenterSlider');
      const toggleSpot = document.getElementById('toggleKarpenterSpot');
      const costVal = document.getElementById('karpenter-cost-val');
      const cluster = document.getElementById('karpenterCluster');

      // Set to 4 pods (needs 1 node)
      slider.value = '4';
      slider.dispatchEvent(new window.Event('input'));

      // Enable spot prioritization
      toggleSpot.checked = true;
      toggleSpot.dispatchEvent(new window.Event('change'));

      expect(costVal.textContent).toBe('$0.08');
      const nodes = cluster.querySelectorAll('.karpenter-node-card');
      expect(nodes[0].className).toContain('spot-node');

      // Reset toggle
      toggleSpot.checked = false;
      toggleSpot.dispatchEvent(new window.Event('change'));
    });
  });

  describe('Canary Traffic Splitter Widget', () => {
    it('should update split ratios and label outputs', () => {
      const slider = document.getElementById('canarySlider');
      const sliderLbl = document.getElementById('canary-slider-lbl');
      const splitLbl = document.getElementById('canary-split-lbl');

      slider.value = '30';
      slider.dispatchEvent(new window.Event('input'));

      expect(sliderLbl.textContent).toBe('30%');
      expect(splitLbl.textContent).toBe('70/30');
    });

    it('should initiate auto-rollback when consecutive failures threshold is breached', async () => {
      const toggleError = document.getElementById('toggleCanaryError');
      const slider = document.getElementById('canarySlider');
      const consoleBox = document.getElementById('healerLogs');

      // Configure split to 100% canary so all traffic goes to canary
      slider.value = '100';
      slider.dispatchEvent(new window.Event('input'));

      // Inject error spike
      toggleError.checked = true;

      // Wait for 3 ticks (at 1000ms intervals) to trigger rollback
      await new Promise(r => setTimeout(r, 4200));

      expect(toggleError.checked).toBe(false);
      expect(slider.value).toBe('0');
      expect(consoleBox.textContent).toContain('Canary HTTP 5xx errors spiked. Auto-rollback triggered');
    });
  });

  describe('Chaos Monkey Multi-AZ Outage Simulator', () => {
    it('should isolate us-east-1a zone and failover traffic', () => {
      const btn = document.getElementById('btnTriggerPartition');
      const status = document.getElementById('multiaz-zones-status');
      const cardA = document.getElementById('az-card-a');

      expect(status.textContent).toBe('3 / 3 Active');
      expect(cardA.classList.contains('az-offline')).toBe(false);

      // Trigger partition
      btn.dispatchEvent(new window.Event('click'));

      expect(cardA.classList.contains('az-offline')).toBe(true);
      expect(status.textContent).toBe('2 / 3 Active');

      // Restore zone
      btn.dispatchEvent(new window.Event('click'));

      expect(cardA.classList.contains('az-offline')).toBe(false);
      expect(status.textContent).toBe('3 / 3 Active');
    });
  });

  describe('Chaos Monkey Drag-and-Drop Fault Injection', () => {
    it('should drag monkey and drop on AZ card to isolate the zone', () => {
      const monkey = document.getElementById('chaos-monkey-grab');
      const cardB = document.getElementById('az-card-b');
      const status = document.getElementById('multiaz-zones-status');

      expect(cardB.classList.contains('az-offline')).toBe(false);

      const dragStartEvent = new window.Event('dragstart');
      dragStartEvent.dataTransfer = {
        setData: (type, val) => { dragStartEvent.data = val; },
        getData: () => 'chaos-monkey'
      };
      monkey.dispatchEvent(dragStartEvent);

      const dropEvent = new window.Event('drop');
      dropEvent.dataTransfer = dragStartEvent.dataTransfer;
      cardB.dispatchEvent(dropEvent);

      expect(cardB.classList.contains('az-offline')).toBe(true);
      expect(status.textContent).toContain('Active');
    });

    it('should drag monkey and drop on a pod to trigger simulated OOMKilled/CrashLoopBackOff crash', async () => {
      const monkey = document.getElementById('chaos-monkey-grab');
      const podsGrid = document.getElementById('podsGrid');
      const podWrapper = podsGrid.querySelector('.pod-wrapper');
      const circle = podWrapper.querySelector('.pod-circle');

      const dragStartEvent = new window.Event('dragstart');
      dragStartEvent.dataTransfer = {
        setData: () => {},
        getData: () => 'chaos-monkey'
      };
      monkey.dispatchEvent(dragStartEvent);

      const dropEvent = new window.Event('drop');
      dropEvent.dataTransfer = dragStartEvent.dataTransfer;
      podWrapper.dispatchEvent(dropEvent);

      expect(circle.className).toMatch(/pod-crash-oomkilled|pod-crash-crashloopbackoff/);
    });
  });

  describe('ArgoCD Canary Rollout Strategy & Promotions', () => {
    it('should sync only the first pod when Canary strategy is selected', async () => {
      const btnCanary = document.getElementById('btnStrategyCanary');
      const btnSync = document.getElementById('btnArgoSync');
      const syncStatus = document.getElementById('argocd-sync-status');
      const podsGrid = document.getElementById('podsGrid');
      const circles = podsGrid.querySelectorAll('.pod-circle');

      btnCanary.dispatchEvent(new window.Event('click'));
      btnSync.dispatchEvent(new window.Event('click'));

      expect(syncStatus.textContent).toBe('Syncing...');
      await new Promise(r => setTimeout(r, 700));

      expect(syncStatus.textContent).toBe('Canary Active (90/10 Traffic Split)');
      expect(circles[0].className).toContain('pod-canary-active');
      expect(circles[1].className).not.toContain('pod-canary-active');
    });

    it('should promote canary to complete sync rollout on remaining pods', async () => {
      const btnPromote = document.getElementById('btnArgoPromote');
      const syncStatus = document.getElementById('argocd-sync-status');
      const podsGrid = document.getElementById('podsGrid');
      const circles = podsGrid.querySelectorAll('.pod-circle');

      btnPromote.dispatchEvent(new window.Event('click'));

      expect(syncStatus.textContent).toBe('Syncing...');
      await new Promise(r => setTimeout(r, 2000));

      expect(syncStatus.textContent).toBe('Synced');
      circles.forEach(c => {
        expect(c.className).toContain('pod-running');
        expect(c.className).not.toContain('pod-canary-active');
      });
    });
  });

  describe('eBPF Custom Query Filter Evaluations', () => {
    it('should drop HTTP traffic when filter input matches drop query', async () => {
      const input = document.getElementById('ebpfFilterInput');
      const btnHttp = document.getElementById('btnEbpfHttp');
      const xdpHook = document.getElementById('ebpf-xdp-hook');
      const consoleLog = document.getElementById('ebpfConsole');

      input.value = 'drop';
      input.dispatchEvent(new window.Event('input'));

      btnHttp.dispatchEvent(new window.Event('click'));
      await new Promise(r => setTimeout(r, 600));

      expect(xdpHook.classList.contains('flash-alert')).toBe(true);
      expect(consoleLog.textContent).toContain('traffic blocked at kernel level');

      input.value = '';
      input.dispatchEvent(new window.Event('input'));
    });
  });

  describe('SRE Runbook Simulator Widget (Widget 11)', () => {
    it('should load OOM runbook steps and progress through checks', async () => {
      const runbookSelector = document.getElementById('runbookSelector');
      const stepsList = document.getElementById('runbook-steps-list');
      const emptyState = document.getElementById('runbook-empty-state');
      const consoleLog = document.getElementById('runbook-console');
      const btnAction = document.getElementById('btnRunbookAction');
      const btnReset = document.getElementById('btnRunbookReset');

      expect(emptyState.classList.contains('hidden')).toBe(false);

      // Select OOM runbook
      runbookSelector.value = 'oom';
      runbookSelector.dispatchEvent(new window.Event('change'));

      expect(emptyState.classList.contains('hidden')).toBe(true);
      expect(stepsList.classList.contains('hidden')).toBe(false);
      expect(stepsList.children.length).toBe(4);

      // Step 1: Inject memory leak to get RAM > 75%
      const btnLeak = document.getElementById('btnChaosLeak');
      btnLeak.dispatchEvent(new window.Event('click'));

      // Wait a short time for monitor loop
      await new Promise(r => setTimeout(r, 600));

      // Step 1 should be checked
      const step1Checkbox = stepsList.children[0].querySelector('input[type="checkbox"]');
      expect(step1Checkbox.checked).toBe(true);

      // Step 2 is manual, btnAction should be active
      expect(btnAction.disabled).toBe(false);
      btnAction.dispatchEvent(new window.Event('click'));

      const step2Checkbox = stepsList.children[1].querySelector('input[type="checkbox"]');
      expect(step2Checkbox.checked).toBe(true);

      // Step 3 is manual, btnAction should be active
      expect(btnAction.disabled).toBe(false);
      btnAction.dispatchEvent(new window.Event('click'));

      const step3Checkbox = stepsList.children[2].querySelector('input[type="checkbox"]');
      expect(step3Checkbox.checked).toBe(true);

      // Step 4: Verify metrics normalize below threshold
      await new Promise(r => setTimeout(r, 600));
      const step4Checkbox = stepsList.children[3].querySelector('input[type="checkbox"]');
      expect(step4Checkbox.checked).toBe(true);

      // Click Reset and verify reset
      btnReset.dispatchEvent(new window.Event('click'));
      const resetStep1 = stepsList.children[0].querySelector('input[type="checkbox"]');
      const resetStep2 = stepsList.children[1].querySelector('input[type="checkbox"]');
      expect(resetStep1.checked).toBe(false);
      expect(resetStep2.checked).toBe(false);
    });

    it('should load Drift and Rollback runbook scenarios successfully', () => {
      const runbookSelector = document.getElementById('runbookSelector');
      const stepsList = document.getElementById('runbook-steps-list');

      runbookSelector.value = 'drift';
      runbookSelector.dispatchEvent(new window.Event('change'));
      expect(stepsList.children.length).toBe(4);
      expect(stepsList.textContent).toContain('Security Group drift');

      runbookSelector.value = 'rollback';
      runbookSelector.dispatchEvent(new window.Event('change'));
      expect(stepsList.children.length).toBe(4);
      expect(stepsList.textContent).toContain('Canary Rollout Strategy');
    });
  });

  describe('eBPF Syscall Tracer Widget', () => {
    it('should stream syscall logs and capture actions like Git commit and failover', async () => {
      const toggleSyscalls = document.getElementById('toggleEbpfSyscalls');
      const syscallConsole = document.getElementById('ebpfSyscallConsole');

      expect(syscallConsole.classList.contains('hidden')).toBe(true);

      // Toggle stream on
      toggleSyscalls.checked = true;
      toggleSyscalls.dispatchEvent(new window.Event('change'));

      expect(syscallConsole.classList.contains('hidden')).toBe(false);
      expect(syscallConsole.textContent).toContain('epoll_create1');

      // Click git commit to trigger clone / execve syscall logs
      const btnCommit = document.getElementById('btnGitCommit');
      btnCommit.dispatchEvent(new window.Event('click'));

      expect(syscallConsole.textContent).toContain('sys_clone');
      expect(syscallConsole.textContent).toContain('sys_execve');

      // Trigger failover to trigger connect/setsockopt syscall logs
      const toggleFailover = document.getElementById('toggleArgoFailover');
      toggleFailover.checked = true;
      toggleFailover.dispatchEvent(new window.Event('change'));

      expect(syscallConsole.textContent).toContain('sys_connect');
      expect(syscallConsole.textContent).toContain('sys_setsockopt');

      // Toggle off
      toggleSyscalls.checked = false;
      toggleSyscalls.dispatchEvent(new window.Event('change'));
      expect(syscallConsole.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Terraform Drift Editor Two-Way Syncing', () => {
    it('should update visual node graph statuses based on editor inputs', () => {
      const editor = document.getElementById('tfCodeEditor');
      const sgStatus = document.getElementById('tf-sg-status');
      const btnPlan = document.getElementById('btnTfPlan');
      const diffTerminal = document.getElementById('tfDiffTerminal');

      // Ingress rule change to SSH port 22
      editor.value = 'ingress { from_port = 22 to_port = 22 }';
      editor.dispatchEvent(new window.Event('input'));

      expect(sgStatus.textContent).toContain('DRIFT: Port 22 open');
      expect(btnPlan.disabled).toBe(false);
      expect(diffTerminal.textContent).toContain('State discrepancy detected');

      // Empty ingress configuration
      editor.value = 'resource "aws_security_group" "web" {}';
      editor.dispatchEvent(new window.Event('input'));

      expect(sgStatus.textContent).toContain('ERROR: Firewall Empty');
      expect(btnPlan.disabled).toBe(true);
      expect(diffTerminal.textContent).toContain('Validation failed');

      // Restored port 80 configuration
      editor.value = 'ingress { from_port = 80 to_port = 80 }';
      editor.dispatchEvent(new window.Event('input'));

      expect(sgStatus.textContent).toContain('OK (Port 80)');
      expect(btnPlan.disabled).toBe(true);
      expect(diffTerminal.textContent).not.toContain('Validation failed');
    });
  });

  describe('Advanced SRE Interactivity Suite', () => {
    it('should compile Kustomize overlays in Widget 12', () => {
      const baseInput = document.getElementById('kustBaseInput');
      const patchInput = document.getElementById('kustPatchInput');
      const output = document.getElementById('kustResolvedOutput');

      expect(baseInput).not.toBeNull();
      expect(patchInput).not.toBeNull();
      expect(output).not.toBeNull();

      // Trigger compilation with new patch replicas limit
      patchInput.value = 'spec:\n  replicas: 10\n  template:\n    spec:\n      containers:\n      - name: web\n        image: nginx:latest';
      patchInput.dispatchEvent(new window.Event('input'));

      expect(output.textContent).toContain('replicas: 10');
      expect(output.textContent).toContain('image: nginx:latest');
    });

    it('should trigger Prometheus live chart popup on node clicks', () => {
      const overlay = document.getElementById('prometheus-chart-overlay');
      const cpuNode = document.getElementById('am-src-cpu');
      const diskNode = document.getElementById('am-src-disk');
      const closeBtn = document.getElementById('btn-close-prom-chart');

      expect(overlay.classList.contains('hidden')).toBe(true);

      // Click CPU alert node
      cpuNode.dispatchEvent(new window.Event('click'));
      expect(overlay.classList.contains('hidden')).toBe(false);
      expect(document.getElementById('prometheus-chart-title').textContent).toContain('CPU Usage');

      // Click Close
      closeBtn.dispatchEvent(new window.Event('click'));
      expect(overlay.classList.contains('hidden')).toBe(true);

      // Trigger showPrometheusChart programmatically
      window.showPrometheusChart('Disk Space', [10, 20, 30]);
      expect(overlay.classList.contains('hidden')).toBe(false);
      expect(document.getElementById('prometheus-chart-title').textContent).toContain('Disk Space');
    });

    it('should run custom SRE shell terminal commands and trigger playground side-effects', () => {
      // 1. sre-reconcile sg
      window.runSRETerminalCommand('sre-reconcile sg');
      const tfEditor = document.getElementById('tfCodeEditor');
      expect(tfEditor.value).toContain('from_port = 80');
      expect(document.getElementById('tf-sg-status').textContent).toContain('OK');

      // 2. sre-patch oom
      window.runSRETerminalCommand('sre-patch oom');
      expect(document.getElementById('metric-ram-val').textContent).toBe('42');

      // 3. sre-rollback
      window.runSRETerminalCommand('sre-rollback');
      expect(document.getElementById('canarySlider').value).toBe('0');
      expect(document.getElementById('toggleCanaryError').checked).toBe(false);

      // 4. cat /var/log/containers/payment-service.log
      window.runSRETerminalCommand('cat /var/log/containers/payment-service.log');
      const history = document.getElementById('terminalHistory');
      expect(history.textContent).toContain('payment-service-xyz');
      expect(history.textContent).toContain('OOMKilled');
    });

    it('should click runbook step checklists and execute terminal actions', () => {
      const runbookSelector = document.getElementById('runbookSelector');
      const stepsList = document.getElementById('runbook-steps-list');
      const history = document.getElementById('terminalHistory');

      // Load OOM runbook
      runbookSelector.value = 'oom';
      runbookSelector.dispatchEvent(new window.Event('change'));

      // Step 1: Trigger leak to get RAM > 75%
      document.getElementById('btnChaosLeak').click();
      
      // Step 2 checklist item click (manual step)
      const step2Item = stepsList.children[1];
      step2Item.dispatchEvent(new window.Event('click'));

      // SRE terminal should execute cat command
      expect(history.textContent).toContain('cat /var/log/containers/payment-service.log');
    });

    it('should calculate degradation and AZ uptime statuses in Chaos Monkey blast radius heatmap', () => {
      const cardA = document.getElementById('az-card-a');
      const cardB = document.getElementById('az-card-b');
      const status = document.getElementById('multiaz-zones-status');
      const blastIndicator = document.getElementById('blast-status-indicator');
      const nodeDb = document.getElementById('blast-node-db');
      const btn = document.getElementById('btnTriggerPartition');

      // Clean up previous test's isolated cardB
      if (cardB) cardB.classList.remove('az-offline');
      if (btn && btn.textContent.includes('Rebuild')) {
        btn.click();
      }

      expect(cardA.classList.contains('az-offline')).toBe(false);

      // Trigger us-east-1a partition
      btn.click();

      expect(cardA.classList.contains('az-offline')).toBe(true);
      expect(status.textContent).toContain('2 / 3');
      expect(blastIndicator.textContent).toContain('Degraded');
      expect(nodeDb.textContent).toContain('Partitioned');

      // Restore network routes
      btn.click();
      expect(cardA.classList.contains('az-offline')).toBe(false);
      expect(status.textContent).toContain('3 / 3');
      expect(blastIndicator.textContent).toContain('System Stable');
    });
  });
});
