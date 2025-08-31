import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  BottomNavItem,
  type BottomNavItemProps,
} from './bottom-navigation-item';
import { Icon } from './theme/Icon';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

type Scheme = 'light' | 'dark';

function renderItem(
  scheme: Scheme = 'light',
  props?: Partial<BottomNavItemProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <BottomNavItem icon={<Icon name="chat" />} label="Inbox" {...props} />
    </ThemeProvider>,
  );
}

describe('BottomNavItem', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderItem();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderItem('light', { onPress });
    fireEvent.click(getByLabelText('Inbox'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows badge when badgeCount > 0', () => {
    const { getByText } = renderItem('light', { badgeCount: 3 });
    expect(getByText('3')).toBeInTheDocument();
  });

  it('limits badge text to 9+', () => {
    const { getByText } = renderItem('light', { badgeCount: 12 });
    expect(getByText('9+')).toBeInTheDocument();
  });

  it('applies active styling', () => {
    const { getByText, rerender } = renderItem();
    const label = getByText('Inbox');
    expect(label).toHaveStyle({ color: colors.light.mutedForeground });
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomNavItem icon={<Icon name="chat" />} label="Inbox" isActive />
      </ThemeProvider>,
    );
    expect(getByText('Inbox')).toHaveStyle({ color: colors.light.humPrimary });
  });

  it('applies theme colors', () => {
    const { getByText, rerender } = renderItem('light');
    expect(getByText('Inbox')).toHaveStyle({
      color: colors.light.mutedForeground,
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavItem icon={<Icon name="chat" />} label="Inbox" />
      </ThemeProvider>,
    );
    expect(getByText('Inbox')).toHaveStyle({
      color: colors.dark.mutedForeground,
    });
  });
});
