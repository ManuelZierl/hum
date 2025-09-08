// Keep this file for lightweight Jest tweaks only.
// Detox init/cleanup is handled by the Detox Jest environment.
// Allow ample time for emulator boot and app launch in CI.
jest.setTimeout(600000);
