import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  plugins: [injectHTML()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        skills: resolve(__dirname, 'skills/index.html'),
        projects: resolve(__dirname, 'projects/index.html'),
        experience: resolve(__dirname, 'experience/index.html'),
        certifications: resolve(__dirname, 'certifications/index.html'),
        tools: resolve(__dirname, 'tools/index.html'),
        ai: resolve(__dirname, 'tools/ai/index.html'),
        ansible: resolve(__dirname, 'tools/ansible/index.html'),
        docker: resolve(__dirname, 'tools/docker/index.html'),
        jenkins: resolve(__dirname, 'tools/jenkins/index.html'),
        terraform: resolve(__dirname, 'tools/terraform/index.html'),
        kubernetes: resolve(__dirname, 'tools/kubernetes/index.html'),
        monitoring: resolve(__dirname, 'tools/monitoring/index.html'),
        github: resolve(__dirname, 'tools/github-actions/index.html'),
        helm: resolve(__dirname, 'tools/helm/index.html'),
        argocd: resolve(__dirname, 'tools/argocd/index.html'),
        logging: resolve(__dirname, 'tools/logging/index.html'),
        linux: resolve(__dirname, 'tools/linux/index.html'),
        python: resolve(__dirname, 'tools/python/index.html'),
        shellscript: resolve(__dirname, 'tools/shellscript/index.html'),
        gitlab: resolve(__dirname, 'tools/gitlab/index.html'),
        llm: resolve(__dirname, 'tools/llm/index.html'),
        slm: resolve(__dirname, 'tools/slm/index.html'),
      }
    }
  }
});
