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
export declare const lightColors: Colors;
/**
 * Color tokens for dark mode.
 * The keys mirror {@link lightColors} for consistency.
 */
export declare const darkColors: Colors;
export declare const colors: Record<'light' | 'dark', Colors>;
