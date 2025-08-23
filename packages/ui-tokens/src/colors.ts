/**
 * Color tokens for light mode.
 *
 * ```ts
 * const { colors } = useTheme();
 * const background = colors.surface;
 * ```
 */
export type Colors = {
  /** Default background for surfaces */
  surface: string;
  /** Inverse surface color, typically used on top of `surface` */
  surfaceInverse: string;
  /** Primary text color */
  text: string;
  /** Text color displayed on top of inverse surfaces */
  textInverse: string;
  /** Brand or accent color */
  primary: string;
  /** Secondary brand or accent color */
  secondary: string;
};

export const lightColors: Colors = {
  surface: '#FFFFFF',
  surfaceInverse: '#000000',
  text: '#000000',
  textInverse: '#FFFFFF',
  primary: '#1E90FF',
  secondary: '#FF4081',
};

/**
 * Color tokens for dark mode.
 * The keys mirror {@link lightColors} for consistency.
 */
export const darkColors: Colors = {
  surface: '#000000',
  surfaceInverse: '#FFFFFF',
  text: '#FFFFFF',
  textInverse: '#000000',
  primary: '#1E90FF',
  secondary: '#FF4081',
};

export const colors: Record<'light' | 'dark', Colors> = {
  light: lightColors,
  dark: darkColors,
} as const;
