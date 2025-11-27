import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
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
  plugins: [
    svgr({ include: '**/*.svg', svgrOptions: { exportType: 'default' } }),
    react(),
    {
      name: 'expo-clipboard-paste-button-jsx-fix',
      enforce: 'pre',
      transform(code, id) {
        if (
          id.includes(
            'node_modules/expo-clipboard/build/ClipboardPasteButton.js',
          )
        ) {
          return {
            code: code.replace(
              'return <ExpoClipboardPasteButton onPastePressed={onPastePressed} {...restProps}/>;',
              'return React.createElement(ExpoClipboardPasteButton, { onPastePressed, ...restProps });',
            ),
            map: null,
          };
        }
        return null;
      },
    },
    {
      name: 'expo-ensure-native-modules-polyfill',
      enforce: 'pre',
      transform(code, id) {
        if (
          id.includes('node_modules/expo-modules-core/src/') &&
          code.includes("import { TurboModuleRegistry } from 'react-native';")
        ) {
          return {
            code: code.replace(
              "import { TurboModuleRegistry } from 'react-native';",
              'const TurboModuleRegistry = { get: () => null };',
            ),
            map: null,
          };
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      'react-native': r('./src/polyfills/react-native-web.ts'),
      '@hum/ui-components': r('../../packages/ui-components/src'),
      '@hum/ui-components/': r('../../packages/ui-components/src/'),
      '@hum/ui-screens': r('../../packages/ui-screens'),
      '@hum/ui-screens/': r('../../packages/ui-screens/'),
      '@hum/breeze-payment-client': r(
        '../../packages/breeze-payment-client/index.ts',
      ),
      '@hum/breeze-payment-client/': r(
        '../../packages/breeze-payment-client/src/',
      ),
      '@hum/payment-client': r('../../packages/payment-client/index.ts'),
      '@hum/payment-client/': r('../../packages/payment-client/src/'),
      'expo-modules-core/src/ensureNativeModulesAreInstalled': r(
        './src/polyfills/expoEnsureNativeModulesAreInstalled.ts',
      ),
      'expo-modules-core/build/ensureNativeModulesAreInstalled': r(
        './src/polyfills/expoEnsureNativeModulesAreInstalled.ts',
      ),
      'react-native-safe-area-context': r(
        './react-native-safe-area-context.tsx',
      ),
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
