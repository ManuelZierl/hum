import { spacing } from './spacing';

describe('spacing', () => {
  it('matches design tokens', () => {
    expect(spacing).toEqual({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24 });
  });
});
