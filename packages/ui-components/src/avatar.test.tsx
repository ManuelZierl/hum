/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// Temporary workaround for missing Jest Native matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarProps,
} from './avatar';
import { ThemeProvider } from './theme/theme-provider';
import { colors } from './theme/colors';

function renderAvatar(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AvatarProps>,
  withImage = false,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Avatar testID="avatar" {...props}>
        {withImage && (
          <AvatarImage
            testID="image"
            source={{ uri: 'https://example.com/avatar.png' }}
          />
        )}
        <AvatarFallback testID="fallback">AB</AvatarFallback>
      </Avatar>
    </ThemeProvider>,
  );
}

describe('Avatar', () => {
  it('renders fallback and matches snapshot', () => {
    const { toJSON, UNSAFE_getByProps } = renderAvatar();
    expectAny(UNSAFE_getByProps({ 'data-testid': 'fallback' })).toBeTruthy();
    expectAny(toJSON()).toMatchSnapshot();
  });

  it('supports custom size', () => {
    const { UNSAFE_getByProps } = renderAvatar('light', { size: 80 });
    const avatar = UNSAFE_getByProps({ 'data-testid': 'avatar' });
    expectAny(avatar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 80, height: 80 }),
      ]),
    );
  });

  it('shows fallback when image fails to load', () => {
    const { UNSAFE_getByProps } = renderAvatar('light', undefined, true);
    const image = UNSAFE_getByProps({ 'data-testid': 'image' });
    fireEvent(image, 'error');
    expectAny(UNSAFE_getByProps({ 'data-testid': 'fallback' })).toBeTruthy();
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByProps } = renderAvatar('light', { onPress }, true);
    fireEvent.press(UNSAFE_getByProps({ 'data-testid': 'avatar' }));
    expectAny(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount, UNSAFE_getByProps } = renderAvatar('light');
    expectAny(
      UNSAFE_getByProps({ 'data-testid': 'fallback' }).props.style,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.light.muted }),
      ]),
    );
    unmount();
    const { UNSAFE_getByProps: getByPropsDark } = renderAvatar('dark');
    expectAny(
      getByPropsDark({ 'data-testid': 'fallback' }).props.style,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.dark.muted }),
      ]),
    );
  });

  it('has appropriate accessibility role', () => {
    const { UNSAFE_getByProps } = renderAvatar();
    expectAny(
      UNSAFE_getByProps({ 'data-testid': 'avatar' }).props.accessibilityRole,
    ).toBe('image');
  });
});
