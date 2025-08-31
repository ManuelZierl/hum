import { radius } from './radius';

describe('radius', () => {
  it('matches design tokens', () => {
    expect(radius).toEqual({ sm: 6, md: 10, lg: 12, xl: 16 });
  });
});
