export function ensureNativeModulesAreInstalled(): void {
  // Expo modules are not available in Storybook's web runtime.
  // The native module installation step is therefore a no-op.
}
