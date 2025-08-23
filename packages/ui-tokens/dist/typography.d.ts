/**
 * Typography tokens including font families, sizes and weights.
 *
 * ```ts
 * const { typography } = useTheme();
 * const styles = { fontSize: typography.fontSize.md };
 * ```
 */
export declare const typography: {
    readonly fontFamily: "System";
    readonly fontSize: {
        readonly xs: 12;
        readonly sm: 14;
        readonly md: 16;
        readonly lg: 20;
        readonly xl: 24;
    };
    readonly fontWeight: {
        readonly regular: "400";
        readonly medium: "500";
        readonly bold: "700";
    };
};
export type Typography = typeof typography;
