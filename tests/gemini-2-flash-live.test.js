import { describe, it, expect } from 'vitest';
import { Gemini2FlashLiveGenerator } from '../src/js/generators/gemini-2-flash-live-gen.js';

describe('Gemini2FlashLiveGenerator', () => {
  it('should initialize with correct default properties', () => {
    const generator = new Gemini2FlashLiveGenerator();
    expect(generator.name).toBe('Gemini 2.0 Flash Live Generator');
    expect(generator.version).toBe('1.0.0');
  });

  it('should generate valid Gemini 2.0 Flash live config', () => {
    const generator = new Gemini2FlashLiveGenerator();
    const result = generator.generate({
      modality: 'audio_video_duplex',
      voice: 'Aoede',
      videoFps: 2,
      grounding: true
    });

    expect(result.model).toBe('gemini-2.0-flash-exp');
    expect(result.transport).toBe('websocket_bidi');
    expect(result.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Aoede');
    expect(result.setup.tools.length).toBe(1);
    expect(result.clientStreamingParameters.videoSampleRateFps).toBe(2);
  });

  it('should generate python client websocket code', () => {
    const generator = new Gemini2FlashLiveGenerator();
    const script = generator.generatePythonStreamingClient({ voice: 'Charon' });
    expect(script).toContain('connect_gemini_live_session');
    expect(script).toContain('Charon');
    expect(script).toContain('gemini-2.0-flash-exp');
  });
});
