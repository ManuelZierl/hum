// packages/hum-ui-components/src/theme/theme-provider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { type } from './typography';

type Scheme = 'light' | 'dark';
type Theme = {
  scheme: Scheme;
  colors: (typeof colors)[Scheme];
  spacing: typeof spacing;
  radius: typeof radius;
  type: typeof type;
};
const ThemeCtx = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  forcedScheme?: Scheme;
}> = ({ children, forcedScheme }) => {
  const device = useColorScheme() ?? 'light';
  const scheme = forcedScheme ?? (device === 'dark' ? 'dark' : 'light');
  const value = useMemo<Theme>(
    () => ({ scheme, colors: colors[scheme], spacing, radius, type }),
    [scheme],
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
