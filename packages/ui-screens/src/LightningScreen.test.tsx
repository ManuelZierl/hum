import React from 'react';
import { Text, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
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
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { rerender, UNSAFE_getAllByType } = renderScreen('light');
    const getRoot = () =>
      UNSAFE_getAllByType(View).find((v) => v.props?.testID === 'lightning-screen')!;
    const flatten = (s: any) => (Array.isArray(s) ? Object.assign({}, ...s) : s);
    const bg1 = flatten(getRoot().props.style).backgroundColor;
    expect([bg1, String(bg1).toUpperCase()]).toContain('#FFFFFF');
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <LightningScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    const bg2 = flatten(getRoot().props.style).backgroundColor;
    expect([bg2, String(bg2).toUpperCase()]).toContain('#000000');
  });
});
