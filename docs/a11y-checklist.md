# Accessibility Baseline Checklist

- **Color contrast:** Ensure text and interactive elements meet at least a 4.5:1 contrast ratio (3:1 for large text) and verify in both light and dark themes.
- **Dynamic type:** Respect system font-size settings. Use scalable units and avoid fixed font sizes so content adapts to user preferences.
- **Screen reader labels:** Every interactive element provides a descriptive `accessibilityLabel` and, where helpful, an `accessibilityHint` without duplicating visible text.
- **Hit areas:** Touch targets are at least 44\u00d744 dp. Use `hitSlop` to expand smaller elements' touch areas when layout constraints exist.
- **Haptics:** Critical actions trigger appropriate haptic feedback and respect the user's global haptics/ vibration settings.
