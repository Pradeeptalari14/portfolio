// Dagger Pipelines Studio Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initDaggerPipelines() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const pipelineSdk = $('pipeline_sdk');
  const registryDomain = $('registry_domain');
  const stageLint = $('stage_lint');
  const stageTest = $('stage_test');
  const stageCompile = $('stage_compile');
  const stagePush = $('stage_push');
  const pipelineEnvs = $('pipeline_envs');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');
  const simulatorViewport = $('simulator-viewport');

  // Simulator Inputs & Outputs
  const runPipelineBtn = $('run_pipeline_btn');
  const dagTerminal = $('dag-terminal');

  function compilePipeline() {
    if (!pipelineSdk) return;
    const sdk = pipelineSdk.value;
    const registry = registryDomain.value.trim() || 'docker.io';
    const lint = stageLint.checked;
    const test = stageTest.checked;
    const compile = stageCompile.checked;
    const push = stagePush.checked;

    let activeTabBtn = document.querySelector('.tab-btn.active');
    let activeTab = activeTabBtn ? activeTabBtn.id : 'tab-config';

    const envsList = pipelineEnvs.value.trim() 
      ? pipelineEnvs.value.trim().split('\n').filter(l => l && l.includes('='))
      : [];

    if (activeTab === 'tab-config') {
      if (sdk === 'go') {
        downloadNameInput.value = 'main.go';
        outputBox.textContent = generateGoPipeline(registry, lint, test, compile, push, envsList);
      } else if (sdk === 'python') {
        downloadNameInput.value = 'pipeline.py';
        outputBox.textContent = generatePythonPipeline(registry, lint, test, compile, push, envsList);
      } else {
        downloadNameInput.value = 'pipeline.ts';
        outputBox.textContent = generateTypeScriptPipeline(registry, lint, test, compile, push, envsList);
      }
    } else if (activeTab === 'tab-system') {
      downloadNameInput.value = 'run_pipeline.sh';
      outputBox.textContent = generateShellRunner(sdk);
    }

    updateNodesVisibility();
  }

  function generateGoPipeline(registry, lint, test, compile, push, envs) {
    let steps = [];
    if (lint) steps.push(`		// 1. Run golangci-lint
		lint := client.Container().
			From("golangci/golangci-lint:v1.55-alpine").
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithExec([]string{"golangci-lint", "run", "--timeout", "5m"})
		
		if _, err := lint.Stdout(ctx); err != nil {
			panic(err)
		}`);
    
    if (test) steps.push(`		// 2. Run unit tests
		tests := client.Container().
			From("golang:1.21-alpine").
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithExec([]string{"go", "test", "-v", "./..."})

		if _, err := tests.Stdout(ctx); err != nil {
			panic(err)
		}`);

    if (compile) steps.push(`		// 3. Compile local binary
		build := client.Container().
			From("golang:1.21-alpine").
			WithMountedDirectory("/src", src).
			WithWorkdir("/src").
			WithExec([]string{"go", "build", "-o", "bin/app", "main.go"})`);

    if (push) steps.push(`		// 4. Publish to registry
		addr, err := client.Container().
			From("alpine:latest").
			WithMountedFile("/usr/local/bin/app", build.File("/src/bin/app")).
			WithEntrypoint([]string{"/usr/local/bin/app"}).
			Publish(ctx, "${registry}/myproject/app:latest")
		if err != nil {
			panic(err)
		}
		println("Published image endpoint address:", addr)`);

    return `package main

import (
	"context"
	"os"
	"dagger.io/dagger"
)

func main() {
	ctx := context.Background()
	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		panic(err)
	}
	defer client.Close()

	src := client.Host().Directory(".")

	// Injected Environments
	${envs.map(e => `os.Setenv("${e.split('=')[0]}", "${e.split('=')[1]}")`).join('\n\t')}

	// Execute Pipeline stages
${steps.join('\n\n')}
}
`;
  }

  function generatePythonPipeline(registry, lint, test, compile, push, envs) {
    let steps = [];
    if (lint) steps.push(`        # 1. Run flake8 linting
        lint = (
            client.container()
            .from_("alpine/flake8:latest")
            .with_directory("/src", src)
            .with_workdir("/src")
            .with_exec(["flake8", "."])
        )
        await lint.stdout()`);

    if (test) steps.push(`        # 2. Run pytest
        tests = (
            client.container()
            .from_("python:3.11-alpine")
            .with_directory("/src", src)
            .with_workdir("/src")
            .with_exec(["pip", "install", "-r", "requirements.txt"])
            .with_exec(["pytest"])
        )
        await tests.stdout()`);

    if (compile) steps.push(`        # 3. Setup build files
        build = (
            client.container()
            .from_("python:3.11-alpine")
            .with_directory("/src", src)
            .with_workdir("/src")
        )`);

    if (push) steps.push(`        # 4. Push to registry
        address = await (
            client.container()
            .from_("python:3.11-alpine")
            .with_directory("/app", build.directory("/src"))
            .with_entrypoint(["python", "/app/main.py"])
            .publish("${registry}/myproject/python-app:latest")
        )
        print(f"Published python image target: {address}")`);

    return `import asyncio
import sys
import os
import dagger

async def main():
    config = dagger.Config(log_output=sys.stdout)
    async with dagger.connection(config) as client:
        src = client.host().directory(".")

        # Injected Environments
        ${envs.map(e => `os.environ["${e.split('=')[0]}"] = "${e.split('=')[1]}"`).join('\n        ')}

        # Execute Pipeline stages
${steps.join('\n\n')}

if __name__ == "__main__":
    asyncio.run(main())
`;
  }

  function generateTypeScriptPipeline(registry, lint, test, compile, push, envs) {
    return `import { connect } from "@dagger/dagger"

connect(async (client) => {
  const src = client.host().directory(".")

  // Injected Environments
  ${envs.map(e => `process.env.${e.split('=')[0]} = "${e.split('=')[1]}"`).join('\n  ')}

  // Pipeline stages execution
  ${lint ? `const lint = client.container()
    .from("node:18-alpine")
    .withDirectory("/src", src)
    .withWorkdir("/src")
    .withExec(["npm", "run", "lint"])
  await lint.stdout()` : ''}

  ${test ? `const tests = client.container()
    .from("node:18-alpine")
    .withDirectory("/src", src)
    .withWorkdir("/src")
    .withExec(["npm", "run", "test"])
  await tests.stdout()` : ''}

  ${push ? `const addr = await client.container()
    .from("node:18-alpine")
    .withDirectory("/app", src)
    .withEntrypoint(["node", "/app/dist/index.js"])
    .publish("${registry}/myproject/node-app:latest")
  console.log("TypeScript app published to:", addr)` : ''}
}, { LogOutput: process.stdout })
`;
  }

  function generateShellRunner(sdk) {
    let runner = '#!/bin/bash\n# Install Dagger CLI and execute container builds\n\n';
    if (sdk === 'go') {
      runner += 'go run main.go';
    } else if (sdk === 'python') {
      runner += 'python pipeline.py';
    } else {
      runner += 'npx ts-node pipeline.ts';
    }
    return runner;
  }

  function updateNodesVisibility() {
    // Show/hide simulator nodes based on checkboxes
    $('node-lint').style.display = stageLint.checked ? 'block' : 'none';
    $('node-test').style.display = stageTest.checked ? 'block' : 'none';
    $('node-compile').style.display = stageCompile.checked ? 'block' : 'none';
    $('node-push').style.display = stagePush.checked ? 'block' : 'none';
  }

  async function executeDagPipeline() {
    const lint = stageLint.checked;
    const test = stageTest.checked;
    const compile = stageCompile.checked;
    const push = stagePush.checked;

    runPipelineBtn.disabled = true;
    dagTerminal.innerHTML = '[pipeline] Initiating Dagger Engine bootstrap...';

    const nodes = [
      { id: 'node-lint', active: lint, label: 'Linting Source' },
      { id: 'node-test', active: test, label: 'Unit Tests' },
      { id: 'node-compile', active: compile, label: 'Compile Binary' },
      { id: 'node-push', active: push, label: 'Push Image' }
    ];

    // Reset nodes
    nodes.forEach(n => {
      const el = $(n.id);
      if (el) {
        el.className = 'dag-node w-48';
      }
    });

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node.active) continue;

      const el = $(node.id);
      if (el) {
        el.className = 'dag-node w-48 active';
        dagTerminal.innerHTML += `<br/>[pipeline] Running stage: <span class="text-sky-400">${node.label}</span>...`;
        await delay(900);
        el.className = 'dag-node w-48 success';
        dagTerminal.innerHTML += `<br/>[pipeline] Stage <span class="text-emerald-400">${node.label}</span> successfully completed.`;
      }
    }

    dagTerminal.innerHTML += '<br/><span class="text-emerald-400 font-bold">[pipeline] SUCCESS! Container Pipeline executed without errors.</span>';
    runPipelineBtn.disabled = false;
  }

  // Event Listeners
  [pipelineSdk, registryDomain, stageLint, stageTest, stageCompile, stagePush].forEach(el => {
    if (el) {
      el.addEventListener('change', compilePipeline);
      el.addEventListener('input', compilePipeline);
    }
  });

  if (pipelineEnvs) {
    pipelineEnvs.addEventListener('input', compilePipeline);
  }

  if (runPipelineBtn) {
    runPipelineBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeDagPipeline();
    });
  }

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'config') {
      const tab = $('tab-config');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'system') {
      const tab = $('tab-system');
      if (tab) tab.classList.add('active');
      if (outputBox) outputBox.classList.remove('hidden');
    } else if (tabName === 'simulator') {
      const tab = $('tab-simulator');
      if (tab) tab.classList.add('active');
      if (simulatorViewport) simulatorViewport.classList.remove('hidden');
      if (outputBox) outputBox.classList.add('hidden');
    }

    compilePipeline();
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Code copied to clipboard!');
    });
  };

  window.downloadActiveFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  // Trigger initial compile
  compilePipeline();
}

if (document.readyState !== 'loading') {
  initDaggerPipelines();
} else {
  document.addEventListener('DOMContentLoaded', initDaggerPipelines);
}
