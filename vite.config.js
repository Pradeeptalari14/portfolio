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
    awsDevopsDashboard: resolve(__dirname, 'projects/aws-devops-dashboard.html'),
    awsEksDeployment: resolve(__dirname, 'projects/aws-eks-deployment.html'),
    jenkinsSharedLibrary: resolve(__dirname, 'projects/jenkins-shared-library.html'),
    sreMonitoringSystem: resolve(__dirname, 'projects/sre-monitoring-system.html'),
    terraformAwsModules: resolve(__dirname, 'projects/terraform-aws-modules.html'),
    awsCostOptimizer: resolve(__dirname, 'projects/aws-cost-optimizer.html'),
    experience: resolve(__dirname, 'experience/index.html'),
    tools: resolve(__dirname, 'tools/index.html'),
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
