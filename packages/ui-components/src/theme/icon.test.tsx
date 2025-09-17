import React from 'react';
import { render } from '@testing-library/react';

import { Icon, type IconProps } from './icon';
import { ThemeProvider } from './theme-provider';
import { colors } from './colors';

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
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('fill')).toBe(colors.light.foreground);
  });

  it('allows overriding color', () => {
    const custom = '#123456';
    const { container } = renderIcon({ color: custom });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('fill')).toBe(custom);
  });

  it('applies size to width and height', () => {
    const { container } = renderIcon({ size: 32 });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('width')).toBe('32');
    expect(svg?.getAttribute('height')).toBe('32');
  });
});
