import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { colors } from './colors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

describe('ThemeProvider', () => {
  it('provides light theme when forced', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider forcedScheme="light">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expectAny(result.current.colors).toBe(colors.light);
  });

  it('provides dark theme when forced', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider forcedScheme="dark">{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expectAny(result.current.colors).toBe(colors.dark);
  });

  it('throws when used outside of ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within ThemeProvider',
    );
  });
});
