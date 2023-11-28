import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  clearScreen: false,
  plugins: [
    svgr({
      svgrOptions: {
        ref: true,
      },
    }),
    react(),
  ],
  build: {
    outDir: 'build/app',
  },
  define: {
    USE_NODE_WORKER_THREAD: false,
  },
  resolve: {
    alias: {
      'node:worker_threads': './src/worker_threads-shim.ts',
    },
  },
  test: {
    setupFiles: ['@vitest/web-worker', 'src/test/audio'],
  },
});
