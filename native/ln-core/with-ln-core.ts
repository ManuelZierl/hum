import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Lightning core integration.
 * Add Breez SDK or LDK native dependencies here in the future.
 */
const withLnCore: ConfigPlugin = (config) => {
  config = withDangerousMod(config, [
    'ios',
    async (c: Record<string, unknown>) => c,
  ]);

  config = withDangerousMod(config, [
    'android',
    async (c: Record<string, unknown>) => c,
  ]);

  return config;
};

export default withLnCore;
