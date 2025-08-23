"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = exports.darkColors = exports.lightColors = void 0;
exports.lightColors = {
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
exports.darkColors = {
    surface: '#000000',
    surfaceInverse: '#FFFFFF',
    text: '#FFFFFF',
    textInverse: '#000000',
    primary: '#1E90FF',
    secondary: '#FF4081',
};
exports.colors = {
    light: exports.lightColors,
    dark: exports.darkColors,
};
