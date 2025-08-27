import { colors, lightColors, darkColors } from './src/colors';
import { spacing } from './src/spacing';
import { typography } from './src/typography';

describe('color tokens', () => {
  test('light and dark palettes match exports', () => {
    expect(colors.light).toEqual(lightColors);
    expect(colors.dark).toEqual(darkColors);
  });

  test('light and dark share the same keys', () => {
    expect(Object.keys(lightColors)).toEqual(Object.keys(darkColors));
  });
});

describe('spacing tokens', () => {
  test('spacing scale is defined correctly', () => {
    expect(spacing).toEqual({
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    });
  });
});

describe('typography tokens', () => {
  test('typography values are correct', () => {
    expect(typography).toEqual({
      fontFamily: 'System',
      fontSize: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24 },
      fontWeight: { regular: '400', medium: '500', bold: '700' },
    });
  });
});
