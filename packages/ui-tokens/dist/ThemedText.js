"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemedText = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const ThemeProvider_1 = require("./ThemeProvider");
const ThemedText = ({ style, ...rest }) => {
    const { colors, typography } = (0, ThemeProvider_1.useTheme)();
    return (react_1.default.createElement(react_native_1.Text, { ...rest, style: [{ color: colors.text, fontSize: typography.fontSize.md }, style] }));
};
exports.ThemedText = ThemedText;
