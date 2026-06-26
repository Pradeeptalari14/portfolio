import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve, join } from 'path';
import fs from 'fs';

// Helper to find all tools dynamically
function getToolInputs() {
  const inputs = {
    main: resolve(__dirname, 'index.html'),
    skills: resolve(__dirname, 'skills/index.html'),
    projects: resolve(__dirname, 'projects/index.html'),
    enterpriseAgenticOs: resolve(__dirname, 'projects/enterprise-agentic-os.html'),
    enterpriseRagPlatform: resolve(__dirname, 'projects/enterprise-rag-platform.html'),
    aiInfraMonitoringCopilot: resolve(__dirname, 'projects/ai-infra-monitoring-copilot.html'),
    multiCloudLandingZone: resolve(__dirname, 'projects/multi-cloud-landing-zone.html'),
    observabilityPlatformK8s: resolve(__dirname, 'projects/observability-platform-k8s.html'),
    whatsappVoiceAiAssistant: resolve(__dirname, 'projects/whatsapp-voice-ai-assistant.html'),
    experience: resolve(__dirname, 'experience/index.html'),
    tools: resolve(__dirname, 'tools/index.html'),
    aiCatalog: resolve(__dirname, 'AI/index.html'),
    interview: resolve(__dirname, 'interview/index.html'),
  };

  const toolsDir = resolve(__dirname, 'tools');
  const items = fs.readdirSync(toolsDir);
  for (const item of items) {
    const itemPath = join(toolsDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const htmlPath = join(itemPath, 'index.html');
      if (fs.existsSync(htmlPath)) {
        // Convert folder name to camelCase for the rollup input key
        const key = item.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        inputs[key] = htmlPath;
      }
    }
  }
  return inputs;
}

export default defineConfig({
  plugins: [injectHTML()],
  build: {
    rollupOptions: {
      input: getToolInputs()
    }
  }
});
