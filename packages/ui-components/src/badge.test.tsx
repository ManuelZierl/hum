/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    const { getByText, asFragment } = renderBadge();
    expect(getByText('Badge')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('supports variants', () => {
    const { getByText, rerender } = renderBadge('light', {
      variant: 'secondary',
    });
    expect(getByText('Badge')).toHaveStyle({
      color: colors.light.secondaryForeground,
    });
    rerender(
      <ThemeProvider forcedScheme="light">
        <Badge testID="badge" variant="destructive">
          Badge
        </Badge>
      </ThemeProvider>,
    );
    expect(getByText('Badge')).toHaveStyle({
      color: colors.light.destructiveForeground,
    });
  });

  it('calls onPress when provided', () => {
    const onPress = jest.fn();
    const { getByTestId } = renderBadge('light', { onPress });
    fireEvent.click(getByTestId('badge'));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { getByText, unmount } = renderBadge('light');
    expect(getByText('Badge')).toHaveStyle({
      color: colors.light.humPrimaryForeground,
    });
    unmount();
    const { getByText: getByTextDark } = renderBadge('dark');
    expect(getByTextDark('Badge')).toHaveStyle({
      color: colors.dark.humPrimaryForeground,
    });
  });
});
