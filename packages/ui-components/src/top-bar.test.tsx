import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from './theme/theme-provider';
import { TopBar, type TopBarProps } from './top-bar';
import type { ReactTestRendererJSON } from 'react-test-renderer';

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
    const { queryByLabelText, rerender } = renderBar('light', {
      backButton: true,
    });
    expect(queryByLabelText('Go back')).toBeTruthy();
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
    const { UNSAFE_getByProps } = renderBar('light', {
      title: 'Hello',
      titleIconName: 'chat',
    });
    expect(UNSAFE_getByProps({ children: 'Hello' })).toBeTruthy();
    expect(UNSAFE_getByProps({ 'data-testid': 'title-icon' })).toBeTruthy();
  });

  it('renders back button with a11y label', () => {
    const { getByLabelText } = renderBar('light', { backButton: true });
    expect(getByLabelText('Go back')).toBeOnTheScreen();
  });

  it('renders search row when enabled and forwards handlers', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { UNSAFE_getByProps } = renderBar('light', {
      showSearch: true,
      searchPlaceholder: 'Search',
      searchValue: 'abc',
      onChangeSearch: onChange,
      onSubmitSearch: onSubmit,
    });

    const input = UNSAFE_getByProps({ 'data-testid': 'topbar-search-input' });
    expect(input).toBeTruthy();
    expect(input.props.placeholder).toBe('Search');

    // fire change and submit
    fireEvent.changeText(input, 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
    fireEvent(input, 'submitEditing');
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
    fireEvent.press(getByLabelText('left'));
    fireEvent.press(getByLabelText('right'));
    expect(left).toHaveBeenCalled();
    expect(right).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { rerender, toJSON } = renderBar('light');
    const initialTree = toJSON() as ReactTestRendererJSON | null;
    expect(initialTree?.props?.style).toEqual(
      expect.objectContaining({ backgroundColor: 'rgba(255,255,255,1.00)' }),
    );
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <TopBar testID="bar" />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    const darkTree = toJSON() as ReactTestRendererJSON | null;
    expect(darkTree?.props?.style).toEqual(
      expect.objectContaining({ backgroundColor: 'rgba(27,27,27,1.00)' }),
    );
  });
});
