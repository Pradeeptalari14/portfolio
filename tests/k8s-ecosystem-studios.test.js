import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import VisualFlowCanvas from '../tools/visual-flow-canvas.js';

describe('CNCF Kubernetes Ecosystem Studios & Flow Topologies', () => {
  const root = path.resolve(__dirname, '..');
  const tools = JSON.parse(fs.readFileSync(path.join(root, 'tools/tools.json'), 'utf8'));

  const expectedStudios = [
    { id: 'envoy-gateway', repo: 'tp-envoy-gateway', category: 'cloud' },
    { id: 'cert-manager', repo: 'tp-cert-manager', category: 'automation' },
    { id: 'kustomize', repo: 'tp-kustomize', category: 'cicd' },
    { id: 'longhorn', repo: 'tp-longhorn', category: 'cloud' },
    { id: 'fluent-bit', repo: 'tp-fluentbit', category: 'observability' },
    { id: 'containerd', repo: 'tp-containerd', category: 'automation' }
  ];

  it('should have total 348+ studios registered in tools.json', () => {
    expect(tools.length).toBeGreaterThanOrEqual(348);
  });

  it('should have all 6 CNCF Kubernetes ecosystem studios registered in tools.json with correct categories', () => {
    expectedStudios.forEach(s => {
      const match = tools.find(t => t.link === `${s.id}/`);
      expect(match, `Studio ${s.id} must exist in tools.json`).toBeDefined();
      expect(match.repository).toBe(`Pradeeptalari14/${s.repo}`);
      expect(match.category).toBe(s.category);
    });
  });

  it('should have index.html and learn.html created for all 6 new ecosystem studios', () => {
    expectedStudios.forEach(s => {
      const studioDir = path.join(root, 'tools', s.id);
      expect(fs.existsSync(path.join(studioDir, 'index.html')), `index.html for ${s.id} should exist`).toBe(true);
      expect(fs.existsSync(path.join(studioDir, 'learn.html')), `learn.html for ${s.id} should exist`).toBe(true);
    });
  });

  it('should contain k8sEcosystem starter template with 8 connected nodes in VisualFlowCanvas', () => {
    expect(VisualFlowCanvas.STARTER_TEMPLATES.k8sEcosystem).toBeDefined();
    const template = VisualFlowCanvas.STARTER_TEMPLATES.k8sEcosystem;
    expect(template.nodes.length).toBe(8);
    expect(template.connections.length).toBe(8);
    expect(template.nodes[0].title).toContain('Envoy Gateway');
    expect(template.nodes[1].title).toContain('Kyverno');
    expect(template.nodes[2].title).toContain('KEDA');
    expect(template.nodes[3].title).toContain('Karpenter');
    expect(template.nodes[4].title).toContain('containerd');
    expect(template.nodes[5].title).toContain('Cilium');
    expect(template.nodes[6].title).toContain('Longhorn');
    expect(template.nodes[7].title).toContain('Prometheus');
  });

  it('should dynamically generate the 8-node CNCF ecosystem topology when loading an ecosystem studio', () => {
    const topo = VisualFlowCanvas.generateStudioTopology('envoy-gateway', {
      title: 'Envoy Gateway & Gateway API Studio',
      category: 'cloud'
    });
    expect(topo.nodes.length).toBe(8);
    expect(topo.nodes[0].title).toContain('Envoy Gateway & cert-manager');
    expect(topo.nodes[6].title).toContain('Longhorn CSI Storage');
    expect(topo.copilotHtml).toContain('CNCF Kubernetes Ecosystem Lab');
  });

  it('should preserve existing 5-node Karpenter scaler topology for karpenter-autoscaler', () => {
    const k8sTopo = VisualFlowCanvas.generateStudioTopology('karpenter-autoscaler', {
      title: 'AWS Karpenter Node Autoscaler',
      category: 'cloud'
    });
    expect(k8sTopo.nodes.length).toBe(5);
    expect(k8sTopo.nodes[1].title).toContain('Karpenter NodePool Consolidator');
    expect(k8sTopo.nodes[3].title).toContain('Cilium eBPF CNI');
  });
});
