import { ExpoConfig, ConfigContext } from '@expo/config';

const withMatrixCorePlugin = './plugins/with-matrix-core';

export default ({ config }: ConfigContext): ExpoConfig => {
  const withMatrixCore = process.env.WITH_MATRIX_CORE === 'true';

  return {
    ...config,
    name: config.name ?? 'mchat',
    slug: config.slug ?? 'mchat',
    plugins: [
      ...(config.plugins ?? []),
      ...(withMatrixCore ? [withMatrixCorePlugin] : []),
    ],
  };
};
