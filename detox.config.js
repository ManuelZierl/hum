/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'detox/jest.config.js',
    },
  },
  apps: {
    'myApp.ios': {
      type: 'ios.app',
      binaryPath:
        'apps/mobile/ios/build/Build/Products/Debug-iphonesimulator/hum.app',
      build:
        'npm run -w @hum/ui-components build && npm run -w @hum/ui-screens build && xcodebuild -workspace apps/mobile/ios/hum.xcworkspace -scheme hum -configuration Debug -sdk iphonesimulator -derivedDataPath apps/mobile/ios/build',
    },
    'myApp.android': {
      type: 'android.apk',
      binaryPath:
        'apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'npm run -w @hum/ui-components build && npm run -w @hum/ui-screens build && cd apps/mobile/android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    'ios.sim': {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' },
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'test' },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'ios.sim',
      app: 'myApp.ios',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'myApp.android',
    },
  },
};
