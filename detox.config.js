module.exports = {
  testRunner: 'jest',
  runnerConfig: 'detox/jest.config.js',
  behavior: {
    init: {
      exposeGlobals: true,
      launchApp: true,
      reinstallApp: true,
      initTimeout: 300000,
    },
  },
  artifacts: {
    rootDir: 'detox-artifacts',
    plugins: {
      log: { enabled: true },
      screenshot: { enabled: 'onFail' },
      video: { enabled: 'onFail' },
      timeline: { enabled: true },
    },
  },
  configurations: {
    'android.emu.debug': {
      device: {
        type: 'android.emulator',
        avdName: 'Pixel_5_API_34',
        headless: true,
        bootArgs: [
          '-no-snapshot',
          '-no-boot-anim',
          '-gpu',
          'swiftshader_indirect',
          '-noaudio',
          '-camera-back',
          'none',
          '-camera-front',
          'none',
        ],
      },
      app: 'android.debug.apk',
    },
  },
};
