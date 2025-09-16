import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react';
import { LightningScreen, type LightningScreenProps } from './LightningScreen';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <Text>{name}</Text>,
}));
const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

type Scheme = 'light' | 'dark';

function renderScreen(
  scheme: Scheme = 'light',
  props?: Partial<LightningScreenProps>,
) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={scheme}>
        <LightningScreen {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('LightningScreen', () => {
  it('calls onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderScreen('light', { onBack });
    fireEvent.click(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { rerender } = renderScreen('light');
    expect(screen.getByTestId('lightning-screen')).toHaveStyle({
      backgroundColor: 'rgba(255,255,255,1.00)',
    });
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <LightningScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('lightning-screen')).toHaveStyle({
      backgroundColor: 'rgba(0,0,0,1.00)',
    });
  });
});
