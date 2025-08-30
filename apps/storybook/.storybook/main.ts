import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const require = createRequire(import.meta.url);
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  framework: { name: getAbsolutePath('@storybook/react-vite'), options: {} },
  stories: ['../storybook/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    // (optional) getAbsolutePath("@storybook/addon-essentials"),
  ],
  core: { disableTelemetry: true },

  // ---> This is the important part <---
  viteFinal: async (viteConfig) => {
    // Ensure objects exist
    viteConfig.resolve ??= {};
    // Use RegExp to alias *only* bare 'react-native' imports
    // (deep imports like 'react-native/Libraries/...' should still flow through RNW’s compatibility)
    const rnAlias = {
      find: /^react-native$/,
      replacement: getAbsolutePath('react-native-web'),
    };
    const pkgsDir = join(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      '..',
      '..',
      'packages',
    );
    const uiDir = join(pkgsDir, 'ui-components');
    const uiSrc = join(uiDir, 'index.ts');
    const uiSubSrc = join(uiDir, 'src');
    const uiAlias = { find: /^@hum\/ui-components$/, replacement: uiSrc };
    const uiSubAlias = {
      find: /^@hum\/ui-components\/(.*)$/,
      replacement: join(uiSubSrc, '$1'),
    };
    const uiScreensDir = join(pkgsDir, 'ui-screens');
    const uiScreensSrc = join(uiScreensDir, 'index.ts');
    const uiScreensSubSrc = join(uiScreensDir, 'src');
    const uiScreensAlias = {
      find: /^@hum\/ui-screens$/,
      replacement: uiScreensSrc,
    };
    const uiScreensSubAlias = {
      find: /^@hum\/ui-screens\/(.*)$/,
      replacement: join(uiScreensSubSrc, '$1'),
    };
    const safeAreaSrc = join(
      dirname(fileURLToPath(import.meta.url)),
      '..',
      'react-native-safe-area-context.tsx',
    );
    const safeAreaAlias = {
      find: /^react-native-safe-area-context$/,
      replacement: safeAreaSrc,
    };

    const existingAlias = Array.isArray(viteConfig.resolve.alias)
      ? viteConfig.resolve.alias
      : Object.entries(viteConfig.resolve.alias ?? {}).map(
          ([find, replacement]) => ({ find, replacement }),
        );
    viteConfig.resolve.alias = [
      rnAlias,
      uiAlias,
      uiSubAlias,
      uiScreensAlias,
      uiScreensSubAlias,
      safeAreaAlias,
      ...existingAlias,
    ];

    // Avoid pre-bundling RN; it confuses docgen/sourcemaps
    viteConfig.optimizeDeps = {
      ...(viteConfig.optimizeDeps ?? {}),
      exclude: [
        ...new Set([
          ...(viteConfig.optimizeDeps?.exclude ?? []),
          'react-native',
        ]),
      ],
      include: [
        ...new Set([
          ...(viteConfig.optimizeDeps?.include ?? []),
          'react',
          'react-dom',
          'react-native-web',
        ]),
      ],
    };

    // Make sure SSR build (used by docs/docgen) doesn’t externalize RN pieces
    viteConfig.ssr = {
      ...(viteConfig.ssr ?? {}),
      noExternal: [
        ...(Array.isArray(viteConfig.ssr?.noExternal)
          ? (viteConfig.ssr!.noExternal as Array<string | RegExp>)
          : []),
        /^react-native($|\/)/,
      ],
    };

    return viteConfig;
  },

  // Use TS docgen and ignore node_modules so it won’t parse RN’s Flow/TS mix
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        if (!prop.parent) return true;
        return !/node_modules/.test(prop.parent.fileName);
      },
    },
  },
};

export default config;
