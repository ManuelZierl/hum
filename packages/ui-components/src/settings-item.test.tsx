import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('lucide-react-native', () => {
  return new Proxy({}, { get: () => () => React.createElement('svg') });
});

import { SettingsItem, type SettingsItemProps } from './settings-item';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderItem(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<SettingsItemProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <SettingsItem
        icon={<Text>I</Text>}
        title="Account"
        subtitle="Subtitle"
        {...props}
      />
    </ThemeProvider>,
  );
}

describe('SettingsItem', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderItem();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    renderItem('light', {
      onPress,
      accessibilityLabel: 'press',
    });
    fireEvent.click(screen.getByLabelText('press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports accessibility props', () => {
    renderItem('light', {
      accessibilityLabel: 'item',
      testID: 'settings-item',
    });
    const btn = screen.getByLabelText('item');
    expect(btn).toHaveAttribute('data-testid', 'settings-item');
  });

  it('applies theme colors', () => {
    const { rerender } = renderItem('light');
    expect(screen.getByText('Account')).toHaveStyle({
      color: hexToRgba(colors.light.foreground),
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <SettingsItem
          icon={<Text>I</Text>}
          title="Account"
          subtitle="Subtitle"
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('Account')).toHaveStyle({
      color: hexToRgba(colors.dark.foreground),
    });
  });
});
