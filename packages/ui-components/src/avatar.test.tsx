/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
// Temporary workaround for missing Jest Native matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarProps,
} from './avatar';
import { ThemeProvider } from './theme/ThemeProvider';
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
    const { baseElement } = renderAvatar();
    expectAny(screen.getByTestId('fallback')).toBeInTheDocument();
    expectAny(baseElement).toMatchSnapshot();
  });

  it('supports custom size', () => {
    renderAvatar('light', { size: 80 });
    expectAny(screen.getByTestId('avatar')).toHaveStyle({
      width: '80px',
      height: '80px',
    });
  });

  it('shows fallback when image fails to load', () => {
    renderAvatar('light', undefined, true);
    const img = screen.getByAltText('');
    fireEvent.error(img);
    expectAny(screen.getByTestId('fallback')).toBeInTheDocument();
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    renderAvatar('light', { onPress }, true);
    fireEvent.click(screen.getByTestId('avatar'));
    expectAny(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount } = renderAvatar('light');
    expectAny(screen.getByTestId('fallback')).toHaveStyle({
      backgroundColor: colors.light.muted,
    });
    unmount();
    renderAvatar('dark');
    expectAny(screen.getByTestId('fallback')).toHaveStyle({
      backgroundColor: colors.dark.muted,
    });
  });

  it('has appropriate accessibility role', () => {
    renderAvatar();
    expectAny(screen.getByTestId('avatar')).toHaveAttribute('role', 'img');
  });
});
