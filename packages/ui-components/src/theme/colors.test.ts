import { colors } from './colors';

describe('colors', () => {
  it('defines light and dark schemes', () => {
    expect(colors.light.background).toBe('#FFFFFF');
    expect(colors.dark.background).toBe('#1b1b1bff');
  });
});
