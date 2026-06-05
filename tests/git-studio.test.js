import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

describe('Git Learning Studio Compiler', () => {
  let dom;
  let window;

  beforeAll(() => {
    // Read the index.html file for git tool
    const filePath = path.resolve(__dirname, '../tools/git/index.html');
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

    // Load and evaluate git-gen.js manually in JSDOM context
    const jsPath = path.resolve(__dirname, '../src/js/generators/git-gen.js');
    let jsCode = fs.readFileSync(jsPath, 'utf8');
    
    // Remove ES6 import statements so window.eval compiles it as a classic script
    jsCode = jsCode.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
    
    window.eval(jsCode);

    // Ensure the compiler has finished initial compile
    if (typeof window.triggerCompileAll === 'function') {
      window.triggerCompileAll();
    }
  });

  it('should initialize and compile default Git Guide configuration', () => {
    expect(window.triggerCompileAll).toBeTypeOf('function');
    expect(window.switchTab).toBeTypeOf('function');

    // Default tab is guide
    window.switchTab('guide');

    const outputBox = window.document.getElementById('output-box');
    expect(outputBox).not.toBeNull();
    
    const guideText = outputBox.textContent;
    expect(guideText).toContain('Git Developer & SRE Learning Guide');
    expect(guideText).toContain('Target Persona: DEVOPS');
    expect(guideText).toContain('Workflow: FEATURE');
    expect(guideText).toContain('Hosting Platform: GITHUB');
  });

  it('should switch tabs and update file name outputs', () => {
    const nameInput = window.document.getElementById('download-name-input');
    const extTag = window.document.getElementById('file-extension-tag');

    // Switch to diagrams tab
    window.switchTab('diagrams');
    expect(nameInput.value).toBe('diagrams');
    expect(extTag.textContent).toBe('.txt');
    expect(window.document.getElementById('output-box').textContent).toContain('GIT INTERACTIVE STUDIO: ASCII DIAGRAM MAPPINGS');

    // Switch to cheatsheet tab
    window.switchTab('cheatsheet');
    expect(nameInput.value).toBe('cheatsheet');
    expect(extTag.textContent).toBe('.md');
    expect(window.document.getElementById('output-box').textContent).toContain('Git Quick-Reference Cheat Sheet');
  });

  it('should update compiled content when selectors change', () => {
    const audienceSelect = window.document.getElementById('target_audience');
    const workflowSelect = window.document.getElementById('git_workflow');
    const platformSelect = window.document.getElementById('git_platform');

    // Change settings to AI developer, GitFlow, and GitLab
    audienceSelect.value = 'ai_engineer';
    workflowSelect.value = 'gitflow';
    platformSelect.value = 'gitlab';

    audienceSelect.dispatchEvent(new window.Event('change'));
    workflowSelect.dispatchEvent(new window.Event('change'));
    platformSelect.dispatchEvent(new window.Event('change'));

    // Switch to guide
    window.switchTab('guide');
    const guideText = window.document.getElementById('output-box').textContent;
    expect(guideText).toContain('Target Persona: AI_ENGINEER');
    expect(guideText).toContain('Workflow: GITFLOW');
    expect(guideText).toContain('Hosting Platform: GITLAB');

    // Switch to cicd workflow
    window.switchTab('cicd');
    const cicdText = window.document.getElementById('output-box').textContent;
    expect(cicdText).toContain('GitLab CI: Git Pipeline Security Verification');
    expect(cicdText).not.toContain('GitHub Actions');
  });
});
