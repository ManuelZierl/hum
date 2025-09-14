import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // strip any existing sdkVersion coming from config/defaults
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sdkVersion: _ignore, ...rest } = config ?? {};

  return {
    name: rest.name ?? 'hum',
    slug: rest.slug ?? 'hum',
    version: rest.version ?? '1.0.0',
    orientation: rest.orientation ?? 'portrait',
    userInterfaceStyle: rest.userInterfaceStyle ?? 'automatic',
    icon: '../../docs/assets/img/logo-background.png',
    splash: {
      image: '../../docs/assets/img/logo-transparent.png',
      resizeMode: 'contain',
      backgroundColor: '#FFD755',
    },
    web: {
      ...(rest.web ?? {}),
      favicon: '../../docs/assets/img/logo-transparent.png',
    },
    android: {
      ...(rest.android ?? {}),
      package: rest.android?.package ?? 'com.hum.app',
      adaptiveIcon: {
        ...(rest.android?.adaptiveIcon ?? {}),
        foregroundImage: '../../docs/assets/img/logo-transparent.png',
        backgroundColor: '#FFD755',
      },
    },
    ios: {
      ...(rest.ios ?? {}),
      bundleIdentifier: rest.ios?.bundleIdentifier ?? 'com.hum.app',
    },
    assetBundlePatterns: rest.assetBundlePatterns ?? ['**/*'],
    extra: {
      ...(rest.extra ?? {}),
      devFeatures:
        process.env.DEV_FEATURES === '1' || process.env.DEV_FEATURES === 'true',
    },
    plugins: [
      ...(rest.plugins ?? []),
      ...(process.env.WITH_HUM_RUST === 'true'
        ? ['./plugins/with-hum-rust']
        : []),
    ],
    // NOTE: Do NOT set sdkVersion here. Expo derives it from the installed "expo" package.
  };
};
