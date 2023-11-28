import { defineConfig } from 'vite';
import { base } from './config/base';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
