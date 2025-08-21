import React, { createContext, useContext, ReactNode } from 'react';
import { lightColors, darkColors, Colors } from './colors';
import { spacing, Spacing } from './spacing';
import { typography, Typography } from './typography';

export type Theme = {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
};

const ThemeContext = createContext<Theme>({
  colors: lightColors,
  spacing,
  typography,
});

export type ThemeProviderProps = {
  children: ReactNode;
  mode?: 'light' | 'dark';
};

export const ThemeProvider = ({ children, mode = 'light' }: ThemeProviderProps) => {
  const value: Theme = {
    colors: mode === 'light' ? lightColors : darkColors,
    spacing,
    typography,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
