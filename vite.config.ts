import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export function base(): Plugin {
  return {
    name: 'base',
    config() {
      return {
        build: {
          outDir: 'build/app',
        },
        clearScreen: false,
      };
    },
    apply: 'build',
  };
}

export default defineConfig({
  plugins: [
    base(),
    svgr({
      svgrOptions: {
        ref: true,
      },
    }),
    react(),
  ],
  test: {
    setupFiles: ['@vitest/web-worker', 'src/test/audio'],
  },
  worker: {
    plugins: [base()],
  },
});
