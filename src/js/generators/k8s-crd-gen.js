// Kubernetes CRD Studio Generator
// Copyright (c) 2026 Talari Pradeep. All Rights Reserved.

function initK8sCrd() {
  const $ = (id) => document.getElementById(id);

  // Inputs
  const groupInput = $('crd_group');
  const versionInput = $('crd_version');
  const kindInput = $('crd_kind');
  const pluralInput = $('crd_plural');
  const scopeSelect = $('crd_scope');

  // Outputs
  const outputBox = $('output-box');
  const downloadNameInput = $('download-name-input');

  // Schema properties state
  let properties = [
    { name: 'replicaCount', type: 'integer', required: true, desc: 'Number of active replicas to run.' },
    { name: 'imageURI', type: 'string', required: true, desc: 'Docker container image reference.' },
    { name: 'enableMonitoring', type: 'boolean', required: false, desc: 'Toggle prometheus scraper sidecars.' }
  ];

  function renderPropertiesTable() {
    const tbody = $('fields-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    properties.forEach((prop, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" value="${prop.name}" oninput="updateProperty(${idx}, 'name', this.value)" class="form-input w-full p-1.5 text-xs font-mono" />
        </td>
        <td>
          <select onchange="updateProperty(${idx}, 'type', this.value)" class="form-select w-full p-1.5 text-xs">
            <option value="string" ${prop.type === 'string' ? 'selected' : ''}>string</option>
            <option value="integer" ${prop.type === 'integer' ? 'selected' : ''}>integer</option>
            <option value="boolean" ${prop.type === 'boolean' ? 'selected' : ''}>boolean</option>
          </select>
        </td>
        <td class="text-center">
          <input type="checkbox" ${prop.required ? 'checked' : ''} onchange="updateProperty(${idx}, 'required', this.checked)" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        </td>
        <td>
          <input type="text" value="${prop.desc}" oninput="updateProperty(${idx}, 'desc', this.value)" class="form-input w-full p-1.5 text-xs" />
        </td>
        <td class="text-center">
          <button onclick="removeProperty(${idx})" class="text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    compileCrd();
  }

  window.updateProperty = (idx, field, value) => {
    properties[idx][field] = value;
    compileCrd();
  };

  window.removeProperty = (idx) => {
    properties.splice(idx, 1);
    renderPropertiesTable();
  };

  window.addPropertyRow = () => {
    properties.push({ name: 'newField', type: 'string', required: false, desc: 'Description of field.' });
    renderPropertiesTable();
  };

  function compileCrd() {
    if (!groupInput) return;
    const group = groupInput.value.trim() || 'stable.example.com';
    const version = versionInput.value.trim() || 'v1alpha1';
    const kind = kindInput.value.trim() || 'BackupJob';
    const plural = pluralInput.value.trim() || 'backupjobs';
    const scope = scopeSelect.value;
    
    const activeTabBtn = document.querySelector('.tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.id : 'tab-crd-yaml';
    
    if (activeTab === 'tab-crd-yaml') {
      if (downloadNameInput) downloadNameInput.value = 'crd.yaml';
      if (outputBox) outputBox.textContent = generateCrdYaml(group, version, kind, plural, scope);
    } else if (activeTab === 'tab-sample-cr') {
      if (downloadNameInput) downloadNameInput.value = 'cr.yaml';
      if (outputBox) outputBox.textContent = generateSampleCr(group, version, kind);
    } else {
      if (downloadNameInput) downloadNameInput.value = `${kind.toLowerCase()}_types.go`;
      if (outputBox) outputBox.textContent = generateGoStruct(version, kind);
    }

    updateExplanation(kind);
  }

  function generateCrdYaml(group, version, kind, plural, scope) {
    const requiredFields = properties.filter(p => p.required).map(p => p.name);
    
    let yaml = `apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: ${plural}.${group}
spec:
  group: ${group}
  versions:
    - name: ${version}
      served: true
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              ${requiredFields.length > 0 ? 'required:\n' + requiredFields.map(f => `                - ${f}`).join('\n') : ''}
              properties:
`;

    properties.forEach(p => {
      yaml += `                ${p.name}:
                  type: ${p.type}
                  description: "${p.desc}"\n`;
    });

    yaml += `  scope: ${scope}
  names:
    plural: ${plural}
    singular: ${plural.slice(0, -1)}
    kind: ${kind}
    listKind: ${kind}List
`;

    return yaml;
  }

  function generateSampleCr(group, version, kind) {
    let yaml = `apiVersion: ${group}/${version}
kind: ${kind}
metadata:
  name: example-${kind.toLowerCase()}
spec:\n`;

    properties.forEach(p => {
      let val = '""';
      if (p.type === 'integer') val = 3;
      else if (p.type === 'boolean') val = true;
      yaml += `  ${p.name}: ${val}\n`;
    });

    return yaml;
  }

  function generateGoStruct(version, kind) {
    let go = `package ${version}

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ${kind}Spec defines the desired state of ${kind}
type ${kind}Spec struct {
`;

    properties.forEach(p => {
      const fieldCamel = p.name.charAt(0).toUpperCase() + p.name.slice(1);
      let goType = 'string';
      if (p.type === 'integer') goType = 'int32';
      else if (p.type === 'boolean') goType = 'bool';

      go += `	// ${p.desc}
	${fieldCamel} ${goType} \`json:"${p.name}${p.required ? '' : ',omitempty'}"\`\n\n`;
    });

    go += `}

// ${kind}Status defines the observed state of ${kind}
type ${kind}Status struct {
	Active bool \`json:"active"\`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status

// ${kind} is the Schema for the ${kind.toLowerCase()}s API
type ${kind} struct {
	metav1.TypeMeta   \`json:",inline"\`
	metav1.ObjectMeta \`json:"metadata,omitempty"\`

	Spec   ${kind}Spec   \`json:"spec,omitempty"\`
	Status ${kind}Status \`json:"status,omitempty"\`
}
`;

    return go;
  }

  function updateExplanation(kind) {
    const explainWhy = $('explain-why');
    if (explainWhy) {
      explainWhy.innerHTML = `Compiles structured Custom Resource Definition schemas compliant with structural schema requirements. Enforces OpenAPI validation limits.`;
    }
    const explainWhere = $('explain-where');
    if (explainWhere) {
      explainWhere.innerHTML = `Apply the CRD spec schema to your control plane and start deploying custom resources.`;
    }
    const explainCmd = $('explain-command');
    if (explainCmd) {
      explainCmd.textContent = `kubectl apply -f crd.yaml\nkubectl get crd`;
    }
    
    const practices = $('explain-practices');
    if (practices) {
      practices.innerHTML = `
        <li>Define strict OpenAPI constraints (e.g. required arrays and property data types) to block illegal states.</li>
        <li>Always preserve storage version mappings when updating schemas.</li>
        <li>Use kubebuilder markers to register structural subresources.</li>
      `;
    }
    
    const explainAi = $('explain-ai-mlops');
    if (explainAi) {
      explainAi.innerHTML = `Scaffold custom resource types (e.g. <code>RayJob</code>, <code>TrainingSession</code>) to provision dedicated GPU pods dynamically.`;
    }
    const explainFlow = $('explain-flow');
    if (explainFlow) {
      explainFlow.textContent = `[User Resource Yaml] ---> [Kubernetes API Server] ---> [OpenAPI Validation checks] ---> [Custom Controller Execution]`;
    }
  }

  // Event Listeners
  [groupInput, versionInput, kindInput, pluralInput, scopeSelect].forEach(el => {
    if (el) el.addEventListener('input', compileCrd);
  });

  window.switchTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.ide-viewport').forEach(view => view.classList.add('hidden'));

    if (tabName === 'crd-yaml') {
      const tab = $('tab-crd-yaml');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'sample-cr') {
      const tab = $('tab-sample-cr');
      if (tab) tab.classList.add('active');
    } else if (tabName === 'go-struct') {
      const tab = $('tab-go-struct');
      if (tab) tab.classList.add('active');
    }
    
    compileCrd();
    if (outputBox) outputBox.classList.remove('hidden');
  };

  window.copyActiveTabContent = () => {
    const text = outputBox.textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    });
  };

  window.downloadCrdFile = () => {
    const text = outputBox.textContent;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = downloadNameInput.value;
    link.click();
  };

  window.explainActiveTabCode = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.remove('translate-x-full');
  };

  window.closeExplanationDrawer = () => {
    const drawer = $('explanation-drawer');
    if (drawer) drawer.classList.add('translate-x-full');
  };

  // Initial table render
  renderPropertiesTable();
}

if (document.readyState !== 'loading') {
  initK8sCrd();
} else {
  document.addEventListener('DOMContentLoaded', initK8sCrd);
}
