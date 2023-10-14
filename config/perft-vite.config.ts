import { UserConfigExport, defineConfig } from 'vite';
import baseConfig from './base-vite.config';

export default defineConfig(() => {
  const config: UserConfigExport = Object.assign({}, baseConfig);

  config.build!.target = 'node18';
  config.build!.lib = {
    entry: 'src/script/perft.ts',
    formats: ['es'],
    fileName: 'perft',
  };

  config.build!.rollupOptions = {
    external: ['fs/promises', 'process'],
  };

  return config;
});
