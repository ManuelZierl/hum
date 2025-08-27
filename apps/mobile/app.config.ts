import { ExpoConfig, ConfigContext } from '@expo/config';

// To experiment with the Matrix Core config plugin:
// 1. Set WITH_MATRIX_CORE=true in your environment.
// 2. Uncomment the line in the plugins array below.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'mchat',
  slug: config.slug ?? 'mchat',
  version: config.version ?? '1.0.0',
  orientation: config.orientation ?? 'portrait',
  userInterfaceStyle: config.userInterfaceStyle ?? 'light',
  icon: '../../imgs/logo-background.png',
  splash: {
    image: '../../imgs/logo-transparent.png',
    resizeMode: 'contain',
    backgroundColor: '#FFD755',
  },
  web: {
    ...(config.web ?? {}),
    favicon: '../../imgs/logo-transparent.png',
  },
  android: {
    ...(config.android ?? {}),
    adaptiveIcon: {
      ...(config.android?.adaptiveIcon ?? {}),
      foregroundImage: '../../imgs/logo-transparent.png',
      backgroundColor: '#FFD755',
    },
  },
  assetBundlePatterns: config.assetBundlePatterns ?? ['**/*'],
  plugins: [
    ...(config.plugins ?? []),
    // './plugins/with-matrix-core',
  ],
});
