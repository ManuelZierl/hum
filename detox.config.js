/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'detox/jest.config.js',
  configs: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
      app: {
        type: 'ios.app',
        binaryPath:
          'apps/mobile/ios/build/Build/Products/Debug-iphonesimulator/hum.app',
        build:
          'xcodebuild -workspace apps/mobile/ios/hum.xcworkspace -scheme hum -configuration Debug -sdk iphonesimulator -derivedDataPath apps/mobile/ios/build',
      },
    },
    'android.emu.debug': {
      type: 'android.emulator',
      device: { avdName: 'Pixel_6_API_34' },
      app: {
        type: 'android.apk',
        binaryPath:
          'apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk',
        build:
          'cd apps/mobile/android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      },
    },
  },
};
