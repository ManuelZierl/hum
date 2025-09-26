import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
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
    const { getByLabelText } = renderScreen();
    // TopBar search input exists on this screen
    expect(getByLabelText('Search')).toBeOnTheScreen();
  });

  it('updates search input text', () => {
    const { getByLabelText } = renderScreen();
    const input = getByLabelText('Search');
    fireEvent.changeText(input, 'hello');
    expect(input).toHaveProp('value', 'hello');
  });

  it('fires onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderScreen('light', { onBack });
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders children', () => {
    const { getByLabelText } = renderScreen('light', {
      children: <SettingsItem title="Theme" />,
    });
    expect(getByLabelText('Theme')).toBeOnTheScreen();
  });

  it('renders in light and dark themes', () => {
    const { rerender, getByLabelText } = renderScreen('light');
    rerender(
      <ThemeProvider forcedScheme="dark">
        <SettingsScreen />
      </ThemeProvider>,
    );
    expect(getByLabelText('Search')).toBeOnTheScreen();
  });

  it('calls onClearStorage when button pressed', async () => {
    const onClearStorage = jest.fn();
    const { getByLabelText } = renderScreen('light', { onClearStorage });

    await act(async () => {
      fireEvent.press(getByLabelText('settings.actions.clear_storage'));
    });

    expect(onClearStorage).toHaveBeenCalled();
  });
});
