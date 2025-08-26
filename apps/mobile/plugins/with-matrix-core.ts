import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Matrix core integration.
 *
 * When enabled (WITH_MATRIX_CORE=true), this plugin will later link the
 * Matrix Core native binaries into the project. For now it only logs the
 * intended actions without modifying the native projects.
 */
const withMatrixCore: ConfigPlugin = (config) => {
  if (process.env.WITH_MATRIX_CORE !== 'true') {
    console.log(
      'with-matrix-core: skipping native configuration (set WITH_MATRIX_CORE=true to enable)',
    );
    return config;
  }

  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      console.log('with-matrix-core: iOS configuration placeholder');
      return c;
    },
  ]);

  config = withDangerousMod(config, [
    'android',
    async (c) => {
      console.log('with-matrix-core: Android configuration placeholder');
      return c;
    },
  ]);

  return config;
};

export default withMatrixCore;
