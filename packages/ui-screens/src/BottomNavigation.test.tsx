import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import '@testing-library/jest-native/extend-expect';
import {
  BottomNavigation,
  type BottomNavigationProps,
} from './BottomNavigation';
import { ThemeProvider } from '@hum/ui-components/theme/ThemeProvider';
import { colors } from '../../ui-components/src/theme/colors';

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

describe('BottomNavigation Screen', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderNav();
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onTabChange when a tab is pressed', () => {
    const onTabChange = jest.fn();
    const { getByLabelText } = renderNav('light', { onTabChange });
    fireEvent.press(getByLabelText('Lightning'));
    expect(onTabChange).toHaveBeenCalledWith('lightning');
  });

  it('shows badge count', () => {
    const { UNSAFE_getAllByType } = renderNav('light', { chatsBadgeCount: 4 });
    const texts = UNSAFE_getAllByType(Text).map((t) => t.props.children);
    expect(texts).toContain(4);
  });

  it('applies theme colors', () => {
    const { UNSAFE_getAllByType, rerender } = renderNav('light');
    const label = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Lightning',
    );
    expect(label).toHaveStyle({ color: colors.light.mutedForeground });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <BottomNavigation {...baseProps} />
      </ThemeProvider>,
    );
    const updated = UNSAFE_getAllByType(Text).find(
      (t) => t.props.children === 'Lightning',
    );
    expect(updated).toHaveStyle({ color: colors.dark.mutedForeground });
  });
});
