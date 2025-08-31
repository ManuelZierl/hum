import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import { ThemeProvider } from './theme/ThemeProvider';
import { TopBar, type TopBarProps } from './TopBar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

type Scheme = 'light' | 'dark';

function renderTopBar(scheme: Scheme = 'light', props?: Partial<TopBarProps>) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={scheme}>
        <TopBar {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('TopBar Component', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderTopBar();
    expect(toJSON()).toMatchSnapshot();
  });

  it('fires callbacks when actions are pressed', () => {
    const onMenuPress = jest.fn();
    const onCameraPress = jest.fn();
    const onAddPress = jest.fn();
    const { getByLabelText } = renderTopBar('light', {
      onMenuPress,
      onCameraPress,
      onAddPress,
    });
    fireEvent.press(getByLabelText('More options'));
    fireEvent.press(getByLabelText('Open camera'));
    fireEvent.press(getByLabelText('Add'));
    expect(onMenuPress).toHaveBeenCalled();
    expect(onCameraPress).toHaveBeenCalled();
    expect(onAddPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { getByLabelText, rerender } = renderTopBar('light');
    expect(getByLabelText('Add')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <TopBar />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByLabelText('Add')).toHaveStyle({
      backgroundColor: 'rgba(254,202,26,1.00)',
    });
  });
});
