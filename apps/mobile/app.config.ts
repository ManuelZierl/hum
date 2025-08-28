import { ExpoConfig, ConfigContext } from '@expo/config';

// To experiment with the Matrix Core config plugin:
// 1. Set WITH_MATRIX_CORE=true in your environment.
// 2. Uncomment the line in the plugins array below.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'hum',
  slug: config.slug ?? 'hum',
  version: config.version ?? '1.0.0',
  orientation: config.orientation ?? 'portrait',
  userInterfaceStyle: config.userInterfaceStyle ?? 'light',
  assetBundlePatterns: config.assetBundlePatterns ?? ['**/*'],
  plugins: [
    ...(config.plugins ?? []),
    // './plugins/with-matrix-core',
  ],
});
