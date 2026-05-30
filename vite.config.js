import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  plugins: [injectHTML()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tools: resolve(__dirname, 'tools/index.html'),
        ansible: resolve(__dirname, 'tools/ansible/index.html'),
        docker: resolve(__dirname, 'tools/docker/index.html'),
        jenkins: resolve(__dirname, 'tools/jenkins/index.html'),
        terraform: resolve(__dirname, 'tools/terraform/index.html'),
        k8s: resolve(__dirname, 'tools/kubernetes/index.html'),
        mon: resolve(__dirname, 'tools/monitoring/index.html'),
        github: resolve(__dirname, 'tools/github-actions/index.html'),
        helm: resolve(__dirname, 'tools/helm/index.html'),
        argo: resolve(__dirname, 'tools/argocd/index.html'),
        logging: resolve(__dirname, 'tools/logging/index.html'),
      }
    }
  }
});
