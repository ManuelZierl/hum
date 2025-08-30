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
      '@hum/ui-components': r('../../packages/ui-components/'),
      '@hum/ui-screens': r('../../packages/ui-screens/'),
      'react-native-safe-area-context': r(
        './react-native-safe-area-context.tsx',
      ),
      '@react-native/assets-registry/registry': r('./assets-registry.ts'),
      '@react-native/assets-registry': r('./assets-registry.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['storybook', '@storybook/*'],
    include: ['react', 'react-dom', 'react-native-web'],
    esbuildOptions: {
      loader: {
        '.js': 'tsx',
      },
    },
  },
  ssr: {
    noExternal: ['storybook', '@storybook/*'],
  },
});
