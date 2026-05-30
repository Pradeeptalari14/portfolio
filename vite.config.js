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
        ansible: resolve(__dirname, 'tools/an/index.html'),
        docker: resolve(__dirname, 'tools/do/index.html'),
        jenkins: resolve(__dirname, 'tools/je/index.html'),
        terraform: resolve(__dirname, 'tools/te/index.html'),
        k8s: resolve(__dirname, 'tools/k8s/index.html'),
      }
    }
  }
});
