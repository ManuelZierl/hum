import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';

import { ThemeProvider } from '@hum/ui-components';
import { BottomNavigation, BottomNavigationProps } from './BottomNavigation';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { Text } from 'react-native';

jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name }: { name: string }) => <Text>{name}</Text>,
}));

type Scheme = 'light' | 'dark';

function renderBottomNav(
  scheme: Scheme = 'light',
  props?: Partial<BottomNavigationProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <BottomNavigation {...props} />
    </ThemeProvider>,
  );
}

describe('BottomNavigation', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderBottomNav();
    expect(toJSON()).toMatchSnapshot();
  });

  it('triggers onTabChange when a tab is pressed', () => {
    const onTabChange = jest.fn();
    const { getByLabelText } = renderBottomNav('light', { onTabChange });
    fireEvent(getByLabelText('Lightning'), 'press');
    expect(onTabChange).toHaveBeenCalledWith('lightning');
  });

  it('shows badge count and applies theme colors', () => {
    const { toJSON, rerender } = renderBottomNav('light', {
      chatsBadgeCount: 12,
      activeTab: 'chats',
    });
    expect(JSON.stringify(toJSON())).toContain('9+');

    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavigation activeTab="settings" />
      </ThemeProvider>,
    );
    const tree = toJSON() as {
      props: { style: { backgroundColor: string } };
    } | null;
    expect(tree?.props.style.backgroundColor).toBe('rgba(0,0,0,1.00)');
  });

  it('has accessible labels', () => {
    const { getByLabelText } = renderBottomNav();
    expect(getByLabelText('Settings')).toBeTruthy();
  });
});
