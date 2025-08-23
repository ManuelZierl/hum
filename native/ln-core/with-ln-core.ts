import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Lightning core integration.
 * Add Breez SDK or LDK native dependencies here in the future.
 */
const withLnCore: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      console.log('with-ln-core: iOS configuration placeholder');
      return c;
    },
  ]);

  config = withDangerousMod(config, [
    'android',
    async (c) => {
      console.log('with-ln-core: Android configuration placeholder');
      return c;
    },
  ]);

  return config;
};

export default withLnCore;
