// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import StudioSDK from '../src/js/studio-sdk.js';

describe('Phase 8: Enterprise Execution, Verifiable Badges & Interactive Architecture Hub', () => {
  it('should generate verifiable completion certificates with deterministic SHA-256 hash in StudioSDK', async () => {
    expect(typeof StudioSDK.generateCertificate).toBe('function');
    expect(typeof StudioSDK.verifyCertificateHash).toBe('function');

    const cert = await StudioSDK.generateCertificate({
      studentName: 'Talari Pradeep',
      trackId: 'ai-architect',
      trackTitle: 'Enterprise AI & Platform Architect',
      completionCount: 341,
      score: 100
    });

    expect(cert).toBeDefined();
    expect(cert.id).toMatch(/^CERT-[A-F0-9]+/);
    expect(cert.studentName).toBe('Talari Pradeep');
    expect(cert.trackTitle).toBe('Enterprise AI & Platform Architect');
    expect(cert.hash).toBeDefined();
    expect(cert.hash.length).toBeGreaterThanOrEqual(16);
    expect(cert.verified).toBe(true);
    expect(cert.verificationUrl).toContain('https://talaripradeep.info/studios/learn/?cert=');

    // Verify hash method
    const verification = await StudioSDK.verifyCertificateHash(cert.hash);
    expect(verification.valid).toBe(true);
    expect(verification.status).toBe('VERIFIED_CRYPTOGRAPHIC_CREDENTIAL');
  });

  it('should accurately grade interactive terminal drills and report diffs in StudioSDK', () => {
    expect(typeof StudioSDK.gradeDrill).toBe('function');

    // Passing command
    const passingResult = StudioSDK.gradeDrill({
      command: 'python3 -m vllm.entrypoints.openai.api_server --block-size 16',
      expectedPatterns: ['--block-size 16', /vllm\.entrypoints/]
    });
    expect(passingResult.passed).toBe(true);
    expect(passingResult.score).toBe(100);
    expect(passingResult.feedback).toContain('Drill executed successfully');

    // Failing command
    const failingResult = StudioSDK.gradeDrill({
      command: 'cat /etc/passwd',
      expectedPatterns: ['--block-size 16', /vllm\.entrypoints/]
    });
    expect(failingResult.passed).toBe(false);
    expect(failingResult.score).toBe(0);
    expect(failingResult.diff).toContain('Expected command matching');
  });

  it('should include the Interactive Architecture Visualizer and Verifiable Certificate modal in studios/learn/index.html', () => {
    const learnPath = path.resolve(__dirname, '../studios/learn/index.html');
    expect(fs.existsSync(learnPath)).toBe(true);

    const learnContent = fs.readFileSync(learnPath, 'utf8');
    // Architecture Flow section
    expect(learnContent).toContain('id="architecture-flow-section"');
    expect(learnContent).toContain('id="archFlowTitle"');
    expect(learnContent).toContain('id="archPipelineSelect"');
    expect(learnContent).toContain('id="btnSimulateFlow"');

    // Certificate Modal
    expect(learnContent).toContain('id="certModal"');
    expect(learnContent).toContain('id="certStudentName"');
    expect(learnContent).toContain('id="certHashDisplay"');
    expect(learnContent).toContain('id="btnPrintCert"');

    // Specialization Badges
    expect(learnContent).toContain('AI &amp; LLMOps Architect');
    expect(learnContent).toContain('Kernel &amp; eBPF Specialist');
  });

  it('should define Phase 8 styles for certificates, architecture visualizers, and badges in styles.css', () => {
    const cssPath = path.resolve(__dirname, '../styles.css');
    expect(fs.existsSync(cssPath)).toBe(true);

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    expect(cssContent).toContain('.cert-paper');
    expect(cssContent).toContain('.cert-modal-box');
    expect(cssContent).toContain('.cert-hash-badge');
    expect(cssContent).toContain('.arch-flow-box');
    expect(cssContent).toContain('.arch-flow-node');
    expect(cssContent).toContain('.specialization-badge-card');
  });

  it('should provide companion stack automated smoke test script in backend/scripts/smoke_test.py', () => {
    const smokePath = path.resolve(__dirname, '../backend/scripts/smoke_test.py');
    expect(fs.existsSync(smokePath)).toBe(true);

    const smokeContent = fs.readFileSync(smokePath, 'utf8');
    expect(smokeContent).toContain('/api/health');
    expect(smokeContent).toContain('/api/studios/');
    expect(smokeContent).toContain('run_smoke_tests');
  });
});
