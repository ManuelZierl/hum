import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
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
  it('renders and matches snapshot', () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });

  it('updates search input text', () => {
    const { getByLabelText } = renderScreen();
    const input = getByLabelText('Search');
    fireEvent.changeText(input, 'hello');
    expect(input.props.value).toBe('hello');
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
    expect(getByLabelText('Theme')).toBeTruthy();
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
