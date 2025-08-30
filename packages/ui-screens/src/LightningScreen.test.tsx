import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@hum/ui-components';
import { LightningScreen, type LightningScreenProps } from './LightningScreen';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderScreen(props?: Partial<LightningScreenProps>) {
  return render(
    <ThemeProvider forcedScheme="light">
      <LightningScreen {...props} />
    </ThemeProvider>,
  );
}

describe('LightningScreen', () => {
  it('renders and matches snapshot', () => {
    const { container } = renderScreen();
    expect(container).toMatchSnapshot();
  });

  it('renders feature cards', () => {
    const { getByText } = renderScreen();
    expect(getByText('Lightning Wallet')).toBeTruthy();
    expect(getByText('Send & Receive')).toBeTruthy();
  });

  it('handles back button press', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderScreen({ onBack });
    fireEvent.click(getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
