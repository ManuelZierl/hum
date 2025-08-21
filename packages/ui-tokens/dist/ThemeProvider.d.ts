import { ReactNode } from 'react';
import { Colors } from './colors';
import { Spacing } from './spacing';
import { Typography } from './typography';
export type Theme = {
    colors: Colors;
    spacing: Spacing;
    typography: Typography;
};
export type ThemeProviderProps = {
    children: ReactNode;
    mode?: 'light' | 'dark';
};
export declare const ThemeProvider: ({ children, mode }: ThemeProviderProps) => any;
export declare const useTheme: () => any;
