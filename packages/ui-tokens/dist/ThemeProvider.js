"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
const react_1 = __importStar(require("react"));
const colors_1 = require("./colors");
const spacing_1 = require("./spacing");
const typography_1 = require("./typography");
const ThemeContext = (0, react_1.createContext)({
    colors: colors_1.colors.light,
    spacing: spacing_1.spacing,
    typography: typography_1.typography,
});
/**
 * Wraps your application and provides design tokens via React context.
 */
const ThemeProvider = ({ children, mode = 'light' }) => {
    const value = {
        colors: colors_1.colors[mode],
        spacing: spacing_1.spacing,
        typography: typography_1.typography,
    };
    return react_1.default.createElement(ThemeContext.Provider, { value: value }, children);
};
exports.ThemeProvider = ThemeProvider;
/** Hook to access the current {@link Theme}. */
const useTheme = () => (0, react_1.useContext)(ThemeContext);
exports.useTheme = useTheme;
