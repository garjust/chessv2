/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { base } from './config/base';

export default defineConfig({
  plugins: [base()],
});
