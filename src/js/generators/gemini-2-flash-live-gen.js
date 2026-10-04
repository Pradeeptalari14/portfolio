/**
 * Gemini2FlashLiveGenerator
 * Generates BidiStreaming configuration, WebSocket session setups,
 * and audio/video frame protocols for Google Gemini 2.0 Flash Multimodal Live API.
 */
export class Gemini2FlashLiveGenerator {
  constructor() {
    this.name = 'Gemini 2.0 Flash Live Generator';
    this.version = '1.0.0';
  }

  generate(config = {}) {
    const {
      modality = 'audio_video_duplex',
      voice = 'Aoede',
      videoFps = 2,
      grounding = true
    } = config;

    return {
      model: 'gemini-2.0-flash-exp',
      transport: 'websocket_bidi',
      endpoint: 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent',
      setup: {
        model: 'models/gemini-2.0-flash-exp',
        generationConfig: {
          responseModalities: modality.includes('audio') ? ['AUDIO'] : ['TEXT'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: 'You are an ultra-fast multimodal enterprise operational assistant.' }]
        },
        tools: grounding ? [{ googleSearch: {} }] : []
      },
      clientStreamingParameters: {
        audioInputFormat: 'audio/pcm;rate=16000',
        audioOutputFormat: 'audio/pcm;rate=24000',
        videoSampleRateFps: videoFps,
        chunkIntervalMs: Math.round(1000 / videoFps),
        bidiKeepAliveMs: 5000
      }
    };
  }

  generatePythonStreamingClient(config = {}) {
    const voice = config.voice || 'Aoede';
    return `import asyncio
import json
import websockets

GEMINI_WS_URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent"

async def connect_gemini_live_session(api_key: str):
    url = f"{GEMINI_WS_URL}?key={api_key}"
    async with websockets.connect(url) as ws:
        setup_msg = {
            "setup": {
                "model": "models/gemini-2.0-flash-exp",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": "${voice}"}}}
                }
            }
        }
        await ws.send(json.dumps(setup_msg))
        ack = await ws.recv()
        print("Connected to Gemini Live:", ack)
`;
  }
}
