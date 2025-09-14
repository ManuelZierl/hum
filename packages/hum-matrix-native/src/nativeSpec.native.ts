export function isAvailable() {
  return false;
}
export function loadSomething() {
  throw new Error('hum-matrix-native: native module not available in Expo Go.');
}
