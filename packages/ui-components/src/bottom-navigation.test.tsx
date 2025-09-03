import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    const { asFragment } = renderNav();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onTabChange when a tab is pressed', () => {
    const onTabChange = jest.fn();
    const { getByLabelText } = renderNav('light', { onTabChange });
    fireEvent.click(getByLabelText('Lightning'));
    expect(onTabChange).toHaveBeenCalledWith('lightning');
  });

  it('shows badge count', () => {
    const { getByText } = renderNav('light', { chatsBadgeCount: 4 });
    expect(getByText('4')).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    const { getByText, rerender } = renderNav('light');
    expect(getByText('Lightning')).toHaveStyle({
      color: colors.light.mutedForeground,
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavigation {...baseProps} />
      </ThemeProvider>,
    );
    expect(getByText('Lightning')).toHaveStyle({
      color: colors.dark.mutedForeground,
    });
  });
});
