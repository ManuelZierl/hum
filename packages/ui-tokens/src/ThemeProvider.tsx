import React, { createContext, useContext, ReactNode } from 'react';
import { colors, Colors } from './colors';
import { spacing, Spacing } from './spacing';
import { typography, Typography } from './typography';

/**
 * Aggregated theme object containing all design tokens.
 */
export type Theme = {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
};

const ThemeContext = createContext<Theme>({
  colors: colors.light,
  spacing,
  typography,
});

export type ThemeProviderProps = {
  /** React node tree that will receive the theme */
  children: ReactNode;
  /** Which color mode to apply */
  mode?: 'light' | 'dark';
};

/**
 * Wraps your application and provides design tokens via React context.
 */
export const ThemeProvider = ({ children, mode = 'light' }: ThemeProviderProps) => {
  const value: Theme = {
    colors: colors[mode],
    spacing,
    typography,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/** Hook to access the current {@link Theme}. */
export const useTheme = () => useContext(ThemeContext);
