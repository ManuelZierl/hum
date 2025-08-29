import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const r = (...p: string[]) => path.resolve(__dirname, ...p);

/**
 * NOTE:
 * Storybook 8.6 sometimes trips Vite on 'storybook/internal/preview/runtime'.
 * If that happens again, alias it to Storybook's own runtime file to mirror
 * the package export. SB packages are also excluded from optimizeDeps to avoid
 * pre-bundling issues.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@mchat/ui-tokens': r('../../packages/ui-tokens/src'),
      '@mchat/lightning-ui': r('../../packages/lightning-ui'),
      '@mchat/message-ui': r('../../packages/message-ui'),
      '@mchat/mobile-ui': r('../../packages/mobile-ui'),
    },
  },
  optimizeDeps: {
    exclude: ['storybook', '@storybook/*'],
    include: ['react', 'react-dom', 'react-native-web'],
  },
  ssr: {
    noExternal: ['storybook', '@storybook/*'],
  },
});
