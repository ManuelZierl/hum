import '@testing-library/jest-native/extend-expect';
import '@hum/i18n';
(globalThis as any).__DEV__ = true;

const originalConsoleError = console.error;

console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('react-test-renderer is deprecated')
  ) {
    return;
  }

  originalConsoleError(...args);
};
