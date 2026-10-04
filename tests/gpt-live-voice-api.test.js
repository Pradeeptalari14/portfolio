import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/gpt-live-voice-api/index.html');
  const htmlText = fs.readFileSync(htmlPath, 'utf8');

  const dom = new JSDOM(htmlText, { runScripts: "dangerously" });
  const window = dom.window;

  window.navigator.clipboard = {
    writeText: () => Promise.resolve()
  };

  const corePath = path.resolve(__dirname, '../src/js/core-tool.js');
  if (fs.existsSync(corePath)) {
    const coreCode = fs.readFileSync(corePath, 'utf8');
    window.eval(coreCode);
  }

  const jsPath = path.resolve(__dirname, '../src/js/generators/gpt-live-voice-api-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI GPT-Live-1 Voice API & Native Speech Engine Studio', () => {
  it('should compile default GPT-Live-1 agent and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('GPT-Live-1 Voice API');
    expect(code).toContain('audio_live_stream_endpoint');
    expect(code).toContain('session.update');
    expect(window.document.getElementById('metric-latency').textContent).toContain('< 140ms P95');
    expect(window.document.getElementById('metric-transport').textContent).toBe('WebRTC Opus 24kHz');
  });

  it('should switch tabs to WebRTC audio client', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="client"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('class GPTLiveAudioClient');
    expect(code).toContain('interruptPlayback');
  });

  it('should update HUD when changing voice persona to echo', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('voicePersona');
    select.value = 'echo_conversational';
    select.dispatchEvent(new window.Event('change'));

    expect(window.document.getElementById('finops-text').textContent).toContain('Echo (Conversational)');
  });
});
