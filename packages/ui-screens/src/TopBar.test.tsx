import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import '@testing-library/jest-native/extend-expect';
import { TopBar, type TopBarProps } from './TopBar';
import { ThemeProvider } from '@hum/ui-components/theme/ThemeProvider';
import { colors } from '@hum/ui-components/theme/colors';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

type Scheme = 'light' | 'dark';

function renderBar(scheme: Scheme = 'light', props?: Partial<TopBarProps>) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <TopBar {...props} />
    </ThemeProvider>,
  );
}

describe('TopBar Screen', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderBar();
    expect(toJSON()).toMatchSnapshot();
  });

  it('fires callbacks when icons are pressed', () => {
    const handlers = {
      onMorePress: jest.fn(),
      onCameraPress: jest.fn(),
      onPlusPress: jest.fn(),
    };
    const { getByLabelText } = renderBar('light', handlers);
    fireEvent.press(getByLabelText('More options'));
    fireEvent.press(getByLabelText('Open camera'));
    fireEvent.press(getByLabelText('Create new'));
    expect(handlers.onMorePress).toHaveBeenCalled();
    expect(handlers.onCameraPress).toHaveBeenCalled();
    expect(handlers.onPlusPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { UNSAFE_getByType, rerender } = renderBar('light');
    expect(UNSAFE_getByType(View)).toHaveStyle({
      backgroundColor: colors.light.background,
    });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <TopBar />
      </ThemeProvider>,
    );
    expect(UNSAFE_getByType(View)).toHaveStyle({
      backgroundColor: colors.dark.background,
    });
  });
});
