import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { ThemeProvider } from './theme/theme-provider';
import { TopBar, type TopBarProps } from './top-bar';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

type Scheme = 'light' | 'dark';

function renderBar(scheme: Scheme = 'light', props?: Partial<TopBarProps>) {
  return render(
    <SafeAreaProvider>
      <ThemeProvider forcedScheme={scheme}>
        <TopBar testID="bar" {...props} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('TopBar', () => {
  it('renders with and without back button', () => {
    const { getByLabelText, queryByLabelText, rerender } = renderBar('light', {
      backButton: true,
    });
    expect(getByLabelText('Go back')).toBeInTheDocument();
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="light">
          <TopBar testID="bar" />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(queryByLabelText('Go back')).toBeNull();
  });

  it('renders title and icon', () => {
    const { getByText, getByTestId } = renderBar('light', {
      title: 'Hello',
      titleIconName: 'chat',
    });
    expect(getByText('Hello')).toBeInTheDocument();
    expect(getByTestId('title-icon')).toBeInTheDocument();
  });

  it('renders back button with a11y label', () => {
    const { getByLabelText } = renderBar('light', { backButton: true });
    expect(getByLabelText('Go back')).toBeInTheDocument();
  });

  it('renders search row when enabled and forwards handlers', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { getByTestId } = renderBar('light', {
      showSearch: true,
      searchPlaceholder: 'Search',
      searchValue: 'abc',
      onChangeSearch: onChange,
      onSubmitSearch: onSubmit,
    });

    const input = getByTestId('topbar-search-input') as HTMLInputElement;
    expect(input.placeholder).toBe('Search');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('renders items and fires callbacks', () => {
    const left = jest.fn();
    const right = jest.fn();
    const { getByLabelText } = renderBar('light', {
      leftItems: [
        { type: 'text', label: 'A', a11yLabel: 'left', onPress: left },
      ],
      rightItems: [
        { type: 'icon', name: 'camera', a11yLabel: 'right', onPress: right },
      ],
    });
    fireEvent.click(getByLabelText('left'));
    fireEvent.click(getByLabelText('right'));
    expect(left).toHaveBeenCalled();
    expect(right).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { rerender, getByTestId } = renderBar('light');
    expect(getByTestId('bar')).toHaveStyle({
      backgroundColor: 'rgb(255, 255, 255)',
    });
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <TopBar testID="bar" />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    expect(getByTestId('bar')).toHaveStyle({ backgroundColor: 'rgb(0, 0, 0)' });
  });
});
