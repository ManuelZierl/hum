import React, { ReactNode } from 'react';
import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
/**
 * Aggregated theme object containing all design tokens.
 */
export type Theme = {
    colors: Colors;
    spacing: Spacing;
    typography: Typography;
};
export type ThemeProviderProps = {
    /** React node tree that will receive the theme */
    children: ReactNode;
    /** Which color mode to apply */
    mode?: 'light' | 'dark';
};
/**
 * Wraps your application and provides design tokens via React context.
 */
export declare const ThemeProvider: ({ children, mode }: ThemeProviderProps) => React.JSX.Element;
/** Hook to access the current {@link Theme}. */
export declare const useTheme: () => Theme;
