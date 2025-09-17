/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Icon, type IconProps } from './icon';
import { ThemeProvider } from './theme-provider';
import { colors } from './colors';
import ChatIcon from '../../../../assets/icons/chat.svg';

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
    const { UNSAFE_getByType } = renderIcon();
    const svg = UNSAFE_getByType(ChatIcon);
    expectAny(svg.props.fill).toBe(colors.light.foreground);
  });

  it('allows overriding color', () => {
    const custom = '#123456';
    const { UNSAFE_getByType } = renderIcon({ color: custom });
    const svg = UNSAFE_getByType(ChatIcon);
    expectAny(svg.props.fill).toBe(custom);
  });

  it('applies size to width and height', () => {
    const { UNSAFE_getByType } = renderIcon({ size: 32 });
    const svg = UNSAFE_getByType(ChatIcon);
    expectAny(svg.props.width).toBe(32);
    expectAny(svg.props.height).toBe(32);
  });
});
