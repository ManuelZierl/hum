import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

/**
 * Stub Expo config plugin for future Lightning core integration.
 *
 * When enabled (WITH_LN_CORE=true), this plugin will later link the
 * Lightning Core native binaries into the project. For now it only logs the
 * intended actions without modifying the native projects.
 */
const withLnCore: ConfigPlugin = (config) => {
  if (process.env.WITH_LN_CORE !== 'true') {
    console.log(
      'with-ln-core: skipping native configuration (set WITH_LN_CORE=true to enable)',
    );
    return config;
  }

  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      console.log('with-ln-core: iOS configuration placeholder');
      // TODO: Inject Lightning Core XCFramework into Xcode project.
      return c;
    },
  ]);

  config = withDangerousMod(config, [
    'android',
    async (c) => {
      console.log('with-ln-core: Android configuration placeholder');
      // TODO: Inject Lightning Core AAR into Gradle project.
      return c;
    },
  ]);

  return config;
};

export default withLnCore;
