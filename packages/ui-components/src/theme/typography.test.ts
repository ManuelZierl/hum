import { type as typography } from './typography';

describe('typography', () => {
  it('includes expected tokens', () => {
    expect(typography.size.md).toBe(16);
    expect(typography.weight.bold).toBe('700');
    expect(typography.lineHeight.relaxed).toBe(24);
  });
});
