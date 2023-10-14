/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { base } from './config/base';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [base(), svgr(), react()],
});
