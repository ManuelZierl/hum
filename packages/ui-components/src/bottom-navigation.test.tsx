import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  BottomNavigation,
  type BottomNavigationProps,
} from './bottom-navigation';
import { ThemeProvider } from './theme/theme-provider';
import { colors } from './theme/colors';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const baseProps: BottomNavigationProps = {
  activeTab: 'chats',
};

type Scheme = 'light' | 'dark';

function renderNav(
  scheme: Scheme = 'light',
  props?: Partial<BottomNavigationProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <BottomNavigation {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('BottomNavigation Component', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderNav();
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onTabChange when a tab is pressed', () => {
    const onTabChange = jest.fn();
    const { getByLabelText } = renderNav('light', { onTabChange });
    fireEvent.press(getByLabelText('Payments'));
    expect(onTabChange).toHaveBeenCalledWith('payments');
  });

  it('renders Calls tab and it is selectable', () => {
    // this works!
    const onTabChange = jest.fn();
    const { getByLabelText } = renderNav('light', { onTabChange });
    fireEvent.press(getByLabelText('Calls'));
    expect(onTabChange).toHaveBeenCalledWith('calls');
  });

  it('shows badge count', () => {
    const { UNSAFE_getByProps } = renderNav('light', { chatsBadgeCount: 4 });
    expect(UNSAFE_getByProps({ children: 4 })).toBeTruthy();
  });

  it('applies theme colors', () => {
    const { UNSAFE_getByProps, rerender } = renderNav('light');
    expect(UNSAFE_getByProps({ children: 'Payments' }).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.light.mutedForeground }),
      ]),
    );
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavigation {...baseProps} />
      </ThemeProvider>,
    );
    expect(UNSAFE_getByProps({ children: 'Payments' }).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: colors.dark.mutedForeground }),
      ]),
    );
  });
});
