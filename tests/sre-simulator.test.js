import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('SRE Incident Triaging Simulator Compiler', () => {
  let dom;
  let window;

  beforeAll(() => {
    // Read the index.html file for sre-simulator
    const filePath = path.resolve(__dirname, '../tools/sre-simulator/index.html');
    const htmlText = fs.readFileSync(filePath, 'utf8');

    // Create JSDOM instance with script execution enabled
    dom = new JSDOM(htmlText, {
      runScripts: "dangerously"
    });
    window = dom.window;

    // Mock window.mermaid
    window.mermaid = {
      run: () => {}
    };

    // Mock setupCompilerTriggers for JSDOM context
    window.setupCompilerTriggers = (compileCallback, excludeIds = ['download-name-input']) => {
      const inputs = window.document.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!excludeIds.includes(input.id)) {
          input.addEventListener('input', compileCallback);
          input.addEventListener('change', compileCallback);
        }
      });
    };

    // Load and evaluate sre-simulator-gen.js manually in JSDOM context
    const jsPath = path.resolve(__dirname, '../src/js/generators/sre-simulator-gen.js');
    let jsCode = fs.readFileSync(jsPath, 'utf8');
    
    // Remove ES6 import statements so window.eval compiles it as a classic script
    jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    window.eval(jsCode);

    // Ensure the compiler has finished initial compile
    if (typeof window.triggerCompileAll === 'function') {
      window.triggerCompileAll();
    }
  });

  it('should initialize and compile default Memory Leak configurations', () => {
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');
    expect(window.runIncidentSimulation).toBeTypeOf('function');

    // Default configuration should compile memory leak
    const rcaTab = window.document.getElementById('tab-rca');
    expect(rcaTab).not.toBeNull();

    window.switchTab('rca');
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox.textContent).toContain('Go Router Cache Memory Leak');
    expect(outputBox.textContent).toContain('OOMKilled');
  });

  it('should switch tabs and update file name outputs', () => {
    const nameInput = window.document.getElementById('download-name-input');
    const extTag = window.document.getElementById('file-extension-tag');

    // Switch to playbook tab
    window.switchTab('playbook');
    expect(nameInput.value).toBe('oom_restart_triage_fix');
    expect(extTag.textContent).toBe('.sh');
    expect(window.document.getElementById('output-box').textContent).toContain('SafeCache');

    // Switch to prevention tab
    window.switchTab('prevention');
    expect(nameInput.value).toBe('oom_restart_triage_prevention');
    expect(extTag.textContent).toBe('.yaml');
    expect(window.document.getElementById('output-box').textContent).toContain('GoMemoryLeakDetected');
  });

  it('should change compiled content when incident type is switched', () => {
    const incSelect = window.document.getElementById('incident_type');
    expect(incSelect).not.toBeNull();

    // Select database deadlock incident
    incSelect.value = 'db_deadlock';
    incSelect.dispatchEvent(new window.Event('change'));

    // Switch to rca tab
    window.switchTab('rca');
    expect(window.document.getElementById('output-box').textContent).toContain('PostgreSQL Transaction Deadlocks');
    expect(window.document.getElementById('output-box').textContent).not.toContain('OOMKilled');

    // Switch to playbook tab
    window.switchTab('playbook');
    expect(window.document.getElementById('output-box').textContent).toContain('pg_cancel_backend');
  });

  it('should compile SSH outage incident configurations and rca reports', () => {
    const incSelect = window.document.getElementById('incident_type');
    expect(incSelect).not.toBeNull();

    // Select SSH outage incident
    incSelect.value = 'ssh_outage';
    incSelect.dispatchEvent(new window.Event('change'));

    // Switch to rca tab
    window.switchTab('rca');
    expect(window.document.getElementById('output-box').textContent).toContain('Root Cause Analysis: SSH Connection Refused');
    expect(window.document.getElementById('output-box').textContent).toContain('100% utilization');

    // Switch to playbook tab
    window.switchTab('playbook');
    expect(window.document.getElementById('output-box').textContent).toContain('docker system prune');
  });

  it('should compile CrashLoopBackOff configuration outputs and playbooks', () => {
    const incSelect = window.document.getElementById('incident_type');
    expect(incSelect).not.toBeNull();

    // Select CrashLoopBackOff incident
    incSelect.value = 'crashloop_backoff';
    incSelect.dispatchEvent(new window.Event('change'));

    // Switch to rca tab
    window.switchTab('rca');
    expect(window.document.getElementById('output-box').textContent).toContain('Root Cause Analysis: ConfigMap Mount Reference Failure');
    expect(window.document.getElementById('output-box').textContent).toContain('app-config-env');

    // Switch to playbook tab
    window.switchTab('playbook');
    expect(window.document.getElementById('output-box').textContent).toContain('restore_configmap_mount.sh');
  });

  it('should compile ImagePullBackOff configuration outputs and playbooks', () => {
    const incSelect = window.document.getElementById('incident_type');
    expect(incSelect).not.toBeNull();

    // Select ImagePullBackOff incident
    incSelect.value = 'image_pull_backoff';
    incSelect.dispatchEvent(new window.Event('change'));

    // Switch to rca tab
    window.switchTab('rca');
    expect(window.document.getElementById('output-box').textContent).toContain('Root Cause Analysis: Private Registry Unauthorized');
    expect(window.document.getElementById('output-box').textContent).toContain('secure-registry.io');

    // Switch to playbook tab
    window.switchTab('playbook');
    expect(window.document.getElementById('output-box').textContent).toContain('patch_image_pull_secret.sh');
  });
});
