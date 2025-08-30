/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { Text, Pressable } from 'react-native';
import { Badge, type BadgeProps } from './badge';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

function renderBadge(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<BadgeProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Badge testID="badge" {...props}>
        Badge
      </Badge>
    </ThemeProvider>,
  );
}

describe('Badge', () => {
  it('renders default and matches snapshot', () => {
    const { toJSON, UNSAFE_getByType } = renderBadge();
    expect(UNSAFE_getByType(Text).props.children).toBe('Badge');
    expect(toJSON()).toMatchSnapshot();
  });

  it('supports variants', () => {
    const { UNSAFE_getByType, rerender } = renderBadge('light', {
      variant: 'secondary',
    });
    expect(UNSAFE_getByType(Text)).toHaveStyle({
      color: colors.light.secondaryForeground,
    });
    rerender(
      <ThemeProvider forcedScheme="light">
        <Badge testID="badge" variant="destructive">
          Badge
        </Badge>
      </ThemeProvider>,
    );
    expect(UNSAFE_getByType(Text)).toHaveStyle({
      color: colors.light.destructiveForeground,
    });
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = renderBadge('light', { onPress });
    fireEvent.press(UNSAFE_getByType(Pressable));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { UNSAFE_getByType, unmount } = renderBadge('light');
    expect(UNSAFE_getByType(Text)).toHaveStyle({
      color: colors.light.humPrimaryForeground,
    });
    unmount();
    const { UNSAFE_getByType: getByTypeDark } = renderBadge('dark');
    expect(getByTypeDark(Text)).toHaveStyle({
      color: colors.dark.humPrimaryForeground,
    });
  });
});
