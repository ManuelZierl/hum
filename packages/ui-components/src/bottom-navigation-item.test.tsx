import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  BottomNavItem,
  type BottomNavItemProps,
} from './bottom-navigation-item';
import { Icon } from './theme/icon';
import { ThemeProvider } from './theme/theme-provider';
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
    const { toJSON } = renderItem();
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderItem('light', { onPress });
    fireEvent.press(getByLabelText('Inbox'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows badge when badgeCount > 0', () => {
    const { UNSAFE_getByProps } = renderItem('light', { badgeCount: 3 });
    expect(UNSAFE_getByProps({ children: 3 })).toBeTruthy();
  });

  it('limits badge text to 9+', () => {
    const { UNSAFE_getByProps } = renderItem('light', { badgeCount: 12 });
    expect(UNSAFE_getByProps({ children: '9+' })).toBeTruthy();
  });

  it('applies active styling', () => {
    const { UNSAFE_getByProps, rerender } = renderItem();
    const label = UNSAFE_getByProps({ children: 'Inbox' });
    expect(label.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.light.mutedForeground }),
      ]),
    );
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomNavItem icon={<Icon name="chat" />} label="Inbox" isActive />
      </ThemeProvider>,
    );
    const active = UNSAFE_getByProps({ children: 'Inbox' });
    expect(active.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.light.humPrimary }),
      ]),
    );
  });

  it('applies theme colors', () => {
    const { UNSAFE_getByProps, rerender } = renderItem('light');
    expect(UNSAFE_getByProps({ children: 'Inbox' }).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.light.mutedForeground }),
      ]),
    );
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavItem icon={<Icon name="chat" />} label="Inbox" />
      </ThemeProvider>,
    );
    expect(UNSAFE_getByProps({ children: 'Inbox' }).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.dark.mutedForeground }),
      ]),
    );
  });
});
