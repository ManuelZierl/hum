import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import {
  BottomNavItem,
  type BottomNavItemProps,
} from './bottom-navigation-item';
import { Icon } from './theme/icon';
import { ThemeProvider } from './theme/theme-provider';

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
    const { getByRole } = renderItem('light', { onPress });
    fireEvent.click(getByRole('button', { name: 'Inbox' }));
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
    expect(getByText('Inbox')).toHaveStyle({
      color: 'rgb(113, 113, 130)',
    });
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomNavItem icon={<Icon name="chat" />} label="Inbox" isActive />
      </ThemeProvider>,
    );
    expect(getByText('Inbox')).toHaveStyle({
      color: 'rgb(254, 202, 26)',
    });
  });

  it('applies theme colors', () => {
    const light = renderItem('light');
    expect(light.getByText('Inbox')).toHaveStyle({
      color: 'rgb(113, 113, 130)',
    });
    light.unmount();
    const dark = renderItem('dark');
    expect(dark.getByText('Inbox')).toHaveStyle({
      color: 'rgb(181, 181, 181)',
    });
  });
});
