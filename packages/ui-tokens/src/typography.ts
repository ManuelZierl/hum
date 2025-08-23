/**
 * Typography tokens including font families, sizes and weights.
 *
 * ```ts
 * const { typography } = useTheme();
 * const styles = { fontSize: typography.fontSize.md };
 * ```
 */
export const typography = {
  fontFamily: 'System',
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
} as const;

export type Typography = typeof typography;
