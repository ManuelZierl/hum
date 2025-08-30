import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { AspectRatio, type AspectRatioProps } from './aspect-ratio';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderAspectRatio(
  scheme: 'light' | 'dark' = 'light',
  props?: AspectRatioProps,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <AspectRatio testID="ratio" {...props}>
        <View testID="inner" />
      </AspectRatio>
    </ThemeProvider>,
  );
}

describe('AspectRatio', () => {
  it('renders with default ratio and matches snapshot', () => {
    const { toJSON } = renderAspectRatio();
    expect(toJSON()).toMatchSnapshot();
  });

  it('applies custom ratio', () => {
    renderAspectRatio('light', { ratio: 16 / 9, accessibilityLabel: 'ratio' });
    expect(screen.getByLabelText('ratio')).toHaveStyle({
      aspectRatio: `${16 / 9}`,
    });
  });

  it('fires onLayout callback', () => {
    const onLayout = jest.fn();
    renderAspectRatio('light', { onLayout, accessibilityLabel: 'ratio' });
    fireEvent(screen.getByLabelText('ratio'), 'layout', {
      nativeEvent: { layout: { width: 100, height: 100, x: 0, y: 0 } },
    });
    expect(onLayout).toHaveBeenCalled();
  });

  it('supports accessibility props and testID', () => {
    const { toJSON } = renderAspectRatio('light', {
      accessible: true,
      accessibilityLabel: 'media',
      testID: 'ratio',
    });
    expect(screen.getByLabelText('media')).toBeTruthy();
    expect(toJSON()?.props['data-testid']).toBe('ratio');
  });

  it('applies theme colors', () => {
    const { unmount } = renderAspectRatio('light', {
      accessibilityLabel: 'ratio',
    });
    expect(screen.getByLabelText('ratio')).toHaveStyle({
      backgroundColor: hexToRgba(colors.light.background),
    });
    unmount();
    renderAspectRatio('dark', { accessibilityLabel: 'ratio' });
    expect(screen.getByLabelText('ratio')).toHaveStyle({
      backgroundColor: hexToRgba(colors.dark.background),
    });
  });
});
