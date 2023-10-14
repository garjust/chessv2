import { defineConfig } from 'vite';
import { base, script } from './base';

export default defineConfig({
  plugins: [base(), script({ entry: 'src/script/perft.ts' })],
});
