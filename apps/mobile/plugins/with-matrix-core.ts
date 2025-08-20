import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Matrix core integration.
 * Currently logs intended changes without modifying native projects.
 */
const withMatrixCore: ConfigPlugin = (config) => {
  config = withDangerousMod(config, ['ios', async (c) => {
    console.log('with-matrix-core: iOS configuration placeholder');
    return c;
  }]);

  config = withDangerousMod(config, ['android', async (c) => {
    console.log('with-matrix-core: Android configuration placeholder');
    return c;
  }]);
import { ConfigPlugin } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Matrix core integration.
 * Currently logs intended changes without modifying native projects.
 */
const withMatrixCore: ConfigPlugin = (config) => {
  console.log('with-matrix-core: iOS configuration placeholder');
  console.log('with-matrix-core: Android configuration placeholder');
  return config;
};

export default withMatrixCore;
