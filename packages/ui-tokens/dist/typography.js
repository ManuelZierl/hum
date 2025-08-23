"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typography = void 0;
/**
 * Typography tokens including font families, sizes and weights.
 *
 * ```ts
 * const { typography } = useTheme();
 * const styles = { fontSize: typography.fontSize.md };
 * ```
 */
exports.typography = {
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
};
