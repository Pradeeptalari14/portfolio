import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Python SRE Utility Studio Compiler', () => {
  let dom;
  let window;

  beforeAll(() => {
    // Read the index.html file
    const filePath = path.resolve(__dirname, '../tools/python/index.html');
    const htmlText = fs.readFileSync(filePath, 'utf8');

    // Create JSDOM instance with script execution enabled
    dom = new JSDOM(htmlText, {
      runScripts: "dangerously"
    });
    window = dom.window;

    // Mock window.mermaid to prevent errors during dynamic rendering
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

    // Load and evaluate python-gen.js manually in JSDOM context
    const jsPath = path.resolve(__dirname, '../src/js/generators/python-gen.js');
    let jsCode = fs.readFileSync(jsPath, 'utf8');
    
    // Remove ES6 import statements so window.eval compiles it as a classic script
    jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    window.eval(jsCode);

    // Ensure the compiler has finished initial compile
    if (typeof window.triggerCompileAll === 'function') {
      window.triggerCompileAll();
    }
  });

  it('should initialize and compile default AWS FinOps script', () => {
    // Verify that the compiler functions are loaded and executable
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');

    // Ensure we are viewing the script tab
    window.switchTab('script');

    // Default compilation output should be AWS FinOps with Boto3 calls in the output-box element
    const outputBox = window.document.getElementById('output-box');
    expect(outputBox).not.toBeNull();
    
    const script = outputBox.textContent;
    expect(script).toContain('execute_finops_sweep');
    expect(script).toContain('boto3.client(\'ec2\'');
    expect(script).toContain('region = "us-east-1"');
    expect(script).toContain('dry_run = True');
  });

  it('should update compilation when script purpose is changed to kubernetes monitor', () => {
    const select = window.document.getElementById('script_purpose');
    expect(select).not.toBeNull();

    select.value = 'k8s_monitor';
    select.dispatchEvent(new window.Event('change'));
    window.switchTab('script');

    // Check if output changed to K8s Monitor
    const script = window.document.getElementById('output-box').textContent;
    expect(script).toContain('monitor_pods');
    expect(script).toContain('config.load_kube_config()');
    expect(script).toContain('v1.list_namespaced_pod');
    expect(script).not.toContain('boto3.client');
  });

  it('should respect the exception safety toggle', () => {
    const select = window.document.getElementById('script_purpose');
    select.value = 'sys_monitor';
    select.dispatchEvent(new window.Event('change'));

    const checkbox = window.document.getElementById('py_exceptions');
    expect(checkbox).not.toBeNull();

    // Disable exceptions handling
    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).not.toContain('except Exception as err:');

    // Enable exceptions handling
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).toContain('except Exception as err:');
  });

  it('should respect the logging toggle', () => {
    const select = window.document.getElementById('script_purpose');
    select.value = 'sys_monitor';
    select.dispatchEvent(new window.Event('change'));

    const checkbox = window.document.getElementById('py_logging');
    expect(checkbox).not.toBeNull();

    // Disable logging
    checkbox.checked = false;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).not.toContain('logging.basicConfig');

    // Enable logging
    checkbox.checked = true;
    checkbox.dispatchEvent(new window.Event('change'));
    window.switchTab('script');
    expect(window.document.getElementById('output-box').textContent).toContain('logging.basicConfig');
  });
});
