// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import StudioSDK from '../src/js/studio-sdk.js';

describe('StudioPlatformSDK (Universal Database & Offline Engine)', () => {
  beforeEach(() => {
    // Clear localStorage for isolated test runs
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should initialize and provide default progress structure', async () => {
    const prog = await StudioSDK.getStudioProgress('vllm-paged-attention');
    expect(prog).toBeDefined();
    expect(prog.studio_id).toBe('vllm-paged-attention');
    expect(prog.mode).toBe('learn');
    expect(Array.isArray(prog.completed_steps)).toBe(true);
  });

  it('should track completion of the 7-step sequence', async () => {
    await StudioSDK.completeStep('vllm-paged-attention', 'understand');
    await StudioSDK.completeStep('vllm-paged-attention', 'simulate');

    const updated = await StudioSDK.getStudioProgress('vllm-paged-attention');
    expect(updated.completed_steps).toContain('understand');
    expect(updated.completed_steps).toContain('simulate');
  });

  it('should toggle and retrieve bookmarks', async () => {
    const isBm1 = await StudioSDK.toggleBookmark('rag-pipeline');
    expect(isBm1).toBe(true);

    const isMarked = await StudioSDK.isBookmarked('rag-pipeline');
    expect(isMarked).toBe(true);

    const allBms = await StudioSDK.getAllBookmarks();
    expect(allBms).toContain('rag-pipeline');

    // Toggle off
    const isBm2 = await StudioSDK.toggleBookmark('rag-pipeline');
    expect(isBm2).toBe(false);
  });

  it('should save and list user project workspaces', async () => {
    const project = await StudioSDK.saveProject({
      name: 'Production Cluster AI',
      studio_id: 'ebpf-continuous-profiler',
      settings: { replicas: 3 }
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Production Cluster AI');

    const allProjects = await StudioSDK.getAllProjects();
    expect(allProjects.length).toBeGreaterThanOrEqual(1);
    expect(allProjects.some(p => p.name === 'Production Cluster AI')).toBe(true);
  });

  it('should execute sandbox command in safe client-simulation mode when offline', async () => {
    const result = await StudioSDK.executeSandbox({
      command: 'docker ps',
      language: 'bash'
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.exit_code).toBe(0);
    expect(result.stdout).toContain('docker ps');
  });

  it('should export and import portable database snapshots', async () => {
    await StudioSDK.toggleBookmark('synthetic-data');
    await StudioSDK.saveProject({ name: 'Snapshot Project', studio_id: 'synthetic-data' });

    const snapshot = await StudioSDK.exportDatabaseSnapshot();
    expect(snapshot.platform).toBe('Talari Pradeep Studios Hub');
    expect(snapshot.bookmarks).toContain('synthetic-data');

    // Test import
    const importRes = await StudioSDK.importDatabaseSnapshot({
      bookmarks: ['new-studio-1'],
      projects: [{ name: 'Imported Project', studio_id: 'new-studio-1' }]
    });

    expect(importRes.success).toBe(true);
    const bms = await StudioSDK.getAllBookmarks();
    expect(bms).toContain('new-studio-1');
  });

  it('should report correct engine mode and status for in-browser wasm tier', () => {
    const mode = StudioSDK.getEngineMode();
    expect(mode).toBe('wasm-browser');

    const status = StudioSDK.getEngineStatus();
    expect(status.mode).toBe('wasm-browser');
    expect(status.label).toContain('WASM');
    expect(status.isLive).toBe(false);
  });

  it('should support configuring and clearing custom cloud API endpoints', async () => {
    await StudioSDK.setCloudEndpoint('https://api.talaripradeep.info');
    expect(localStorage.getItem('studios_cloud_api')).toBe('https://api.talaripradeep.info');

    await StudioSDK.setCloudEndpoint(null);
    expect(localStorage.getItem('studios_cloud_api')).toBeNull();
  });
});
