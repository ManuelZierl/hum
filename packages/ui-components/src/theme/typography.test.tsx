import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import {
  type as typography,
  TypographyProvider,
  useTypography,
  TYPOGRAPHY_SCALE_OPTIONS,
} from './typography';

describe('typography', () => {
  it('includes expected tokens', () => {
    expect(typography.size.md).toBe(16);
    expect(typography.weight.bold).toBe('700');
    expect(typography.lineHeight.relaxed).toBe(24);
  });

  it('scales tokens through the provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TypographyProvider initialScaleIndex={0}>{children}</TypographyProvider>
    );
    const { result } = renderHook(() => useTypography(), { wrapper });
    const smallMultiplier = TYPOGRAPHY_SCALE_OPTIONS[0].multiplier;
    expect(result.current.scaleIndex).toBe(0);
    expect(result.current.type.size.md).toBe(Math.round(16 * smallMultiplier));

    act(() => {
      result.current.setScaleIndex(4);
    });
    const largeMultiplier = TYPOGRAPHY_SCALE_OPTIONS[4].multiplier;
    expect(result.current.scaleIndex).toBe(4);
    expect(result.current.type.size.md).toBe(Math.round(16 * largeMultiplier));
  });
});
