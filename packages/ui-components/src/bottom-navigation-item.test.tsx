import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import '@testing-library/jest-native/extend-expect';
import {
  BottomNavItem,
  type BottomNavItemProps,
} from './bottom-navigation-item';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

type Scheme = 'light' | 'dark';

function renderItem(
  scheme: Scheme = 'light',
  props?: Partial<BottomNavItemProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <BottomNavItem
        icon={<Text testID="icon">I</Text>}
        label="Inbox"
        {...props}
      />
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
    const { UNSAFE_getAllByType } = renderItem('light', { badgeCount: 3 });
    const texts = UNSAFE_getAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain(3);
  });

  it('limits badge text to 9+', () => {
    const { UNSAFE_getAllByType } = renderItem('light', { badgeCount: 12 });
    const texts = UNSAFE_getAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain('9+');
  });

  it('applies active styling', () => {
    const { UNSAFE_getAllByType, rerender } = renderItem();
    const label = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Inbox',
    );
    expect(label).toHaveStyle({ color: colors.light.mutedForeground });
    rerender(
      <ThemeProvider forcedScheme="light">
        <BottomNavItem icon={<Text>I</Text>} label="Inbox" isActive />
      </ThemeProvider>,
    );
    const updated = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Inbox',
    );
    expect(updated).toHaveStyle({ color: colors.light.humPrimary });
  });

  it('applies theme colors', () => {
    const { UNSAFE_getAllByType, rerender } = renderItem('light');
    const label = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Inbox',
    );
    expect(label).toHaveStyle({ color: colors.light.mutedForeground });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavItem icon={<Text>I</Text>} label="Inbox" />
      </ThemeProvider>,
    );
    const updated = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Inbox',
    );
    expect(updated).toHaveStyle({ color: colors.dark.mutedForeground });
  });
});
