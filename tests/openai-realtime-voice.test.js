import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

function loadToolDom() {
  const htmlPath = path.resolve(__dirname, '../tools/openai-realtime-voice/index.html');
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

  const jsPath = path.resolve(__dirname, '../src/js/generators/openai-realtime-voice-gen.js');
  let jsCode = fs.readFileSync(jsPath, 'utf8');
  jsCode = jsCode.replace(/^import\s+.*?\s+from\s+['"].*?['"];?/gm, '');
  window.eval(jsCode);

  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);
  window.dispatchEvent(event);

  return window;
}

describe('OpenAI Realtime WebRTC Voice Agent Studio', () => {
  it('should compile default Python WebRTC agent code and initialize HUD metrics', () => {
    const window = loadToolDom();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.title).toContain('OpenAI Realtime WebRTC Voice');
    expect(code).toContain('gpt-4o-realtime-preview');
    expect(code).toContain('aiortc');
    expect(window.document.getElementById('metric-latency').textContent).toBe('<280 ms');
    expect(window.document.getElementById('metric-codec').textContent).toContain('Opus 24kHz');
  });

  it('should switch tabs to Browser WebRTC Client code', () => {
    const window = loadToolDom();
    const tabBtn = window.document.querySelector('.tab-btn[data-tab="javascript"]');
    expect(tabBtn).not.toBeNull();
    tabBtn.click();
    const code = window.document.getElementById('codeOutput').textContent;
    expect(code).toContain('RTCPeerConnection');
    expect(code).toContain('input_audio_buffer.speech_started');
  });

  it('should update HUD and code when changing transport to WebSocket', () => {
    const window = loadToolDom();
    const select = window.document.getElementById('audioFormat');
    select.value = 'websocket';
    select.dispatchEvent(new window.Event('change'));

    const code = window.document.getElementById('codeOutput').textContent;
    expect(window.document.getElementById('metric-latency').textContent).toBe('<650 ms');
    expect(window.document.getElementById('metric-codec').textContent).toContain('PCM16');
  });
});
