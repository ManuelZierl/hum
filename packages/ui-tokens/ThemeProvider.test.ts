import type { ReactElement } from 'react';
import { ThemeProvider, type Theme } from './src/ThemeProvider';
import { colors } from './src/colors';
import { spacing } from './src/spacing';
import { typography } from './src/typography';

describe('ThemeProvider', () => {
  test('provides light theme by default', () => {
    const element: ReactElement<{ value: Theme }> = ThemeProvider({
      children: null,
    });
    const value = element.props.value;
    expect(value).toEqual({
      colors: colors.light,
      spacing,
      typography,
    });
  });

  test('provides dark theme when mode is dark', () => {
    const element: ReactElement<{ value: Theme }> = ThemeProvider({
      children: null,
      mode: 'dark',
    });
    const value = element.props.value;
    expect(value).toEqual({
      colors: colors.dark,
      spacing,
      typography,
    });
  });
});
