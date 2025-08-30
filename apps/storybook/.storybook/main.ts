import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from "@storybook/react-vite";

const require = createRequire(import.meta.url);
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}

const config: StorybookConfig = {
  framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
  stories: ["../storybook/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    // (optional) getAbsolutePath("@storybook/addon-essentials"),
  ],
  core: { disableTelemetry: true },

  // ---> This is the important part <---
  viteFinal: async (viteConfig) => {
    // Ensure objects exist
    viteConfig.resolve ??= {};
    // Use RegExp to alias *only* bare 'react-native' imports
    // (deep imports like 'react-native/Libraries/...' should still flow through RNW’s compatibility)
    const rnAlias = { find: /^react-native$/, replacement: "react-native-web" };

    // Support both array and object alias shapes
    if (Array.isArray(viteConfig.resolve.alias)) {
      viteConfig.resolve.alias = [...viteConfig.resolve.alias, rnAlias];
    } else {
      viteConfig.resolve.alias = {
        ...(viteConfig.resolve.alias ?? {}),
        // Vite also accepts object form, but RegExp only works in array form.
        // Keep an object alias as a safety net for tools reading object shape:
        "react-native": "react-native-web",
      };
    }

    // Avoid pre-bundling RN; it confuses docgen/sourcemaps
    viteConfig.optimizeDeps = {
      ...(viteConfig.optimizeDeps ?? {}),
      exclude: [...new Set([...(viteConfig.optimizeDeps?.exclude ?? []), "react-native"])],
      include: [...new Set([...(viteConfig.optimizeDeps?.include ?? []), "react", "react-dom", "react-native-web"])],
    };

    // Make sure SSR build (used by docs/docgen) doesn’t externalize RN pieces
    viteConfig.ssr = {
      ...(viteConfig.ssr ?? {}),
      noExternal: [
        ...(Array.isArray(viteConfig.ssr?.noExternal) ? viteConfig.ssr!.noExternal as any[] : []),
        /^react-native($|\/)/,
      ],
    };

    return viteConfig;
  },

  // Use TS docgen and ignore node_modules so it won’t parse RN’s Flow/TS mix
  typescript: {
    reactDocgen: "react-docgen-typescript",
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
