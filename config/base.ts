/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import type { Plugin } from 'vite';
import path from 'path';

export function base(): Plugin {
  return {
    name: 'base',
    config() {
      return {
        build: {
          outDir: 'build',
        },
        clearScreen: false,
      };
    },
    apply: 'build',
  };
}

export function script(options: { entry: string }): Plugin {
  return {
    name: 'script',
    config() {
      return {
        build: {
          target: 'node18',
          lib: {
            entry: options.entry,
            formats: ['es'],
            fileName: path.basename(options.entry, path.extname(options.entry)),
          },
          rollupOptions: {
            external: ['fs/promises', 'process', 'readline'],
          },
        },
      };
    },
  };
}
