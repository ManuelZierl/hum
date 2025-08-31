/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icon, type IconProps } from './Icon';
import { ThemeProvider } from './ThemeProvider';
import { colors } from './colors';

const expectAny = expect as any;

describe('Icon', () => {
  function renderIcon(props?: Partial<IconProps>) {
    return render(
      <ThemeProvider forcedScheme="light">
        <Icon name="chat" {...props} />
      </ThemeProvider>,
    );
  }

  it('uses theme foreground color by default', () => {
    const { container } = renderIcon();
    const svg = (container as any).querySelector('svg');
    expectAny(svg).toHaveAttribute('fill', colors.light.foreground);
  });

  it('allows overriding color', () => {
    const custom = '#123456';
    const { container } = renderIcon({ color: custom });
    const svg = (container as any).querySelector('svg');
    expectAny(svg).toHaveAttribute('fill', custom);
  });

  it('applies size to width and height', () => {
    const { container } = renderIcon({ size: 32 });
    const svg = (container as any).querySelector('svg');
    expectAny(svg).toHaveAttribute('width', '32');
    expectAny(svg).toHaveAttribute('height', '32');
  });
});
