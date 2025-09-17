/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  type AvatarProps,
} from './avatar';
import { ThemeProvider } from './theme/theme-provider';

function renderAvatar(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AvatarProps>,
  withImage = false,
) {
  const { testID, ...rest } = props ?? {};
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Avatar testID={testID ?? 'avatar-root'} {...rest}>
        {withImage && (
          <AvatarImage
            source={{ uri: 'https://example.com/avatar.png' }}
            testID="avatar-image"
          />
        )}
        <AvatarFallback testID="avatar-fallback">AB</AvatarFallback>
      </Avatar>
    </ThemeProvider>,
  );
}

describe('Avatar', () => {
  it('renders fallback and matches snapshot', () => {
    const { asFragment } = renderAvatar();
    expect(asFragment()).toMatchSnapshot();
  });

  it('supports custom size', () => {
    const { getByTestId } = renderAvatar('light', { size: 80 });
    expect(getByTestId('avatar-root')).toHaveStyle({
      width: '80px',
      height: '80px',
    });
  });

  it('shows fallback when image fails to load', () => {
    const { getByTestId } = renderAvatar('light', undefined, true);
    const image = getByTestId('avatar-image');
    fireEvent.error(image);
    expect(getByTestId('avatar-fallback')).toBeVisible();
    expect(getByTestId('avatar-fallback')).toHaveTextContent('AB');
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderAvatar('light', { onPress }, true);
    fireEvent.click(getByTestId('avatar-root'));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const light = renderAvatar('light');
    expect(light.getByTestId('avatar-fallback')).toHaveStyle({
      backgroundColor: 'rgb(236, 236, 240)',
    });
    light.unmount();
    const dark = renderAvatar('dark');
    expect(dark.getByTestId('avatar-fallback')).toHaveStyle({
      backgroundColor: 'rgb(67, 67, 67)',
    });
  });
});
