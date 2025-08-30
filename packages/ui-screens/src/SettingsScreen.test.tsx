import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('lucide-react-native', () => {
  return new Proxy({}, { get: () => () => React.createElement('svg') });
});

import { SettingsScreen } from './SettingsScreen';
import { ThemeProvider } from '@hum/ui-components';
import { colors } from '../../ui-components/src/theme/colors';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderScreen(scheme: 'light' | 'dark' = 'light') {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <SettingsScreen />
    </ThemeProvider>,
  );
}

describe('SettingsScreen', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderScreen();
    expect(asFragment()).toMatchSnapshot();
  });

  it('allows entering text in search bar', () => {
    renderScreen();
    const input = screen.getByPlaceholderText('Search');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input).toHaveValue('hello');
  });

  it('applies theme colors', () => {
    const { rerender } = renderScreen('light');
    expect(screen.getByText('Settings')).toHaveStyle({
      color: hexToRgba(colors.light.foreground),
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <SettingsScreen />
      </ThemeProvider>,
    );
    expect(screen.getByText('Settings')).toHaveStyle({
      color: hexToRgba(colors.dark.foreground),
    });
  });
});
