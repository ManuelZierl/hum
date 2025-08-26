import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const r = (...p: string[]) => path.resolve(__dirname, ...p);

/**
 * NOTE:
 * Storybook 8.6 sometimes trips Vite on 'storybook/internal/preview/runtime'.
 * We alias it to the public preview API, and ensure SB packages are *not*
 * pre-bundled by optimizeDeps. This prevents the internal import error.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@mchat/ui-tokens': r('../../packages/ui-tokens/src'),
      '@mchat/lightning-ui': r('../../packages/lightning-ui/src'),
      '@mchat/message-ui': r('../../packages/message-ui/src'),

      // Fix: resolve SB internal virtual import
      'storybook/internal/preview/runtime': '@storybook/preview-api',
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
