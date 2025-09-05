import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', "**/native/rust/**", "**/storybook-static/**"],
  },
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  reactPlugin.configs.flat.recommended,
  // Node-style config files (CommonJS): enable Node globals and allow require()
  {
    files: [
      '**/babel.config.js',
      '**/metro.config.js',
      '**/*.config.js',
      'scripts/**/*.cjs',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: 'writable',
        exports: 'writable',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-native': reactNative,
      prettier: prettierPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactNative.configs.all.rules,
      'prettier/prettier': 'error',
      'react-native/no-color-literals': 'off',
      'react-native/sort-styles': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
];
