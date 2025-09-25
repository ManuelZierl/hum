import '@testing-library/react-native';
import '@hum/i18n';
(globalThis as any).__DEV__ = true;

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

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
