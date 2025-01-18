import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import wasm from 'vite-plugin-wasm';
import path from 'path';

export default defineConfig({
  clearScreen: false,
  plugins: [
    svgr({
      svgrOptions: {
        ref: true,
      },
    }),
    react(),
    wasm(),
  ],
  build: {
    outDir: 'build/app',
  },
  define: {
    USE_NODE_WORKER_THREAD: false,
  },
  resolve: {
    alias: {
      // This alias allows us to shim the node worker_threads module when
      // bundling for the browser. With this we can consolidate worker code
      // further.
      'node:worker_threads': path.resolve(
        __dirname,
        'vendor/worker_threads-shim.js',
      ),
    },
  },
  test: {
    setupFiles: ['@vitest/web-worker', 'src/test/audio'],
  },
});
