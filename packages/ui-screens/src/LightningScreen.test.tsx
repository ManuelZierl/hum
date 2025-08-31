import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { LightningScreen, type LightningScreenProps } from './LightningScreen';
import { ThemeProvider } from '@hum/ui-components/theme/ThemeProvider';
import type { ReactTestRendererJSON } from 'react-test-renderer';

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
  it('renders and matches snapshot', () => {
    const { toJSON } = renderScreen();
    expect(toJSON()).toMatchSnapshot();
  });

  it('calls onBack when back button pressed', () => {
    const onBack = jest.fn();
    const { getByLabelText } = renderScreen('light', { onBack });
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { toJSON, rerender } = renderScreen('light');
    let tree = toJSON() as ReactTestRendererJSON;
    expect(tree.props.style).toMatchObject({
      backgroundColor: 'rgba(255,255,255,1.00)',
    });
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <LightningScreen />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    tree = toJSON() as ReactTestRendererJSON;
    expect(tree.props.style).toMatchObject({
      backgroundColor: 'rgba(0,0,0,1.00)',
    });
  });
});
