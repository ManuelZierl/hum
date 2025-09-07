import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
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
    const { getByText, getByTestId } = renderBar('light', {
      title: 'Hello',
      titleIconName: 'chat',
    });
    expect(getByText('Hello')).toBeTruthy();
    expect(getByTestId('title-icon')).toBeTruthy();
  });

  it('expands back button hit area to at least 44x44', () => {
    const { getByTestId } = renderBar('light', { backButton: true });
    const back = getByTestId('back-button');
    expect(back.props.hitSlop).toEqual({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    });
  });

  it('renders search row when enabled and forwards handlers', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByTestId } = renderBar('light', {
      showSearch: true,
      searchPlaceholder: 'Search',
      searchValue: 'abc',
      onChangeSearch: onChange,
      onSubmitSearch: onSubmit,
    });

    const input = getByPlaceholderText('Search');
    expect(input).toBeTruthy();
    // assert testID as well
    expect(getByTestId('topbar-search-input')).toBeTruthy();

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
    const { toJSON, rerender } = renderBar('light');
    let tree = toJSON() as unknown as {
      props: { style: { backgroundColor: string } };
    };
    expect(tree.props.style.backgroundColor).toBe('rgba(255,255,255,1.00)');
    rerender(
      <SafeAreaProvider>
        <ThemeProvider forcedScheme="dark">
          <TopBar />
        </ThemeProvider>
      </SafeAreaProvider>,
    );
    tree = toJSON() as unknown as {
      props: { style: { backgroundColor: string } };
    };
    expect(tree.props.style.backgroundColor).toBe('rgba(0,0,0,1.00)');
  });
});
