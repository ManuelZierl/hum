import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { SettingsItem } from '@hum/ui-components';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { SettingsScreen, type SettingsScreenProps } from './SettingsScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

type Scheme = 'light' | 'dark';

function renderScreen(
  scheme: Scheme = 'light',
  props?: Partial<SettingsScreenProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <SettingsScreen {...props} />
    </ThemeProvider>,
  );
}

describe('SettingsScreen', () => {
  it('renders basic elements', () => {
    const { getByPlaceholderText } = renderScreen();
    expect(getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('updates search input text', () => {
    const { getByPlaceholderText } = renderScreen();
    const input = getByPlaceholderText('Search') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });

  it('fires onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderScreen('light', { onBack });
    fireEvent.click(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders children', () => {
    const { getByLabelText } = renderScreen('light', {
      children: <SettingsItem title="Theme" />,
    });
    expect(getByLabelText('Theme')).toBeInTheDocument();
  });

  it('renders in light and dark themes', () => {
    const { rerender } = renderScreen('light');
    rerender(
      <ThemeProvider forcedScheme="dark">
        <SettingsScreen />
      </ThemeProvider>,
    );
  });
});
