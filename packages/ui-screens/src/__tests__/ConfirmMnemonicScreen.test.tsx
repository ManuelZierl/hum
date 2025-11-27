import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import * as ReactNative from 'react-native';
import { ConfirmMnemonicScreen } from '../ConfirmMnemonicScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const translationMock = {
  t: (key: string, params?: Record<string, unknown>) =>
    params && 'word' in params ? `${key}:${String(params.word)}` : key,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

type MockButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
};

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  Button: ({
    children,
    onPress,
    disabled,
    testID,
    accessibilityLabel,
  }: MockButtonProps) => (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      testID={testID}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  ),
  useTheme: () => ({
    colors: {
      background: '#000',
      foreground: '#fff',
      mutedForeground: '#ccc',
      card: '#111',
      border: '#222',
      destructive: '#f00',
    },
    spacing: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
    radius: { lg: 12 },
    type: {
      size: { base: 14, sm: 12 },
      weight: { medium: '500' },
    },
  }),
}));

const dictionary = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];

const getTextContent = (
  node: { props?: { children?: unknown } } | undefined,
): string => {
  const children = node?.props?.children;
  if (children == null) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children
      .map((child) =>
        getTextContent(
          typeof child === 'object' && child != null
            ? (child as { props?: { children?: unknown } })
            : { props: { children: child } },
        ),
      )
      .join('');
  }
  if (typeof children === 'object' && children != null) {
    return getTextContent(children as { props?: { children?: unknown } });
  }
  return '';
};

describe('ConfirmMnemonicScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('commits words with whitespace-separated input and finishes successfully', () => {
    const onComplete = jest.fn();
    const screen = render(
      <ConfirmMnemonicScreen
        mnemonic="alpha beta gamma"
        dictionary={dictionary}
        onComplete={onComplete}
      />,
    );

    const input = screen.getByLabelText(
      'payments.activate.confirmation.placeholder',
    );
    fireEvent.changeText(input, 'alpha ');
    let chips = screen.getAllByLabelText(
      'payments.activate.confirmation.remove_word',
    );
    expect(chips).toHaveLength(1);
    expect(getTextContent(chips[0])).toContain('alpha');

    fireEvent.changeText(input, 'beta ');
    chips = screen.getAllByLabelText(
      'payments.activate.confirmation.remove_word',
    );
    expect(chips).toHaveLength(2);
    expect(getTextContent(chips[1])).toContain('beta');

    fireEvent.changeText(input, 'gamma');
    fireEvent(input, 'submitEditing');
    chips = screen.getAllByLabelText(
      'payments.activate.confirmation.remove_word',
    );
    expect(chips).toHaveLength(3);
    expect(getTextContent(chips[2])).toContain('gamma');

    const finish = screen.UNSAFE_getByProps({
      accessibilityLabel: 'payments.activate.actions.finish',
    });
    fireEvent.press(finish);
    expect(onComplete).toHaveBeenCalled();
  });

  it('shows validation errors and suggestion ordering', () => {
    const screen = render(
      <ConfirmMnemonicScreen
        mnemonic="alpha beta gamma"
        dictionary={[...dictionary, 'alphabet']}
        onComplete={jest.fn()}
      />,
    );

    const input = screen.getByLabelText(
      'payments.activate.confirmation.placeholder',
    );
    fireEvent.changeText(input, 'wrong ');
    const error = screen.getByLabelText(
      'payments.activate.confirmation.invalid_word:wrong',
    );
    expect(getTextContent(error)).toContain('wrong');

    fireEvent.changeText(input, 'a');
    expect(
      screen.getByLabelText(
        'payments.activate.confirmation.use_suggestion:alpha',
      ),
    ).toBeTruthy();
    expect(
      screen.getByLabelText(
        'payments.activate.confirmation.use_suggestion:alphabet',
      ),
    ).toBeTruthy();
  });

  it('removes confirmed words on chip press', () => {
    const screen = render(
      <ConfirmMnemonicScreen
        mnemonic="alpha beta"
        dictionary={dictionary}
        onComplete={jest.fn()}
      />,
    );

    const input = screen.getByLabelText(
      'payments.activate.confirmation.placeholder',
    );
    fireEvent.changeText(input, 'alpha ');
    fireEvent.changeText(input, 'beta ');

    const [firstChip] = screen.getAllByLabelText(
      'payments.activate.confirmation.remove_word',
    );
    fireEvent.press(firstChip);
    expect(screen.queryByText('01 alpha')).toBeNull();
    expect(
      screen.getByLabelText('payments.activate.confirmation.placeholder').props
        .value,
    ).toBe('');
  });

  it('registers keyboard listeners when available', () => {
    const removeShow = jest.fn();
    const removeHide = jest.fn();
    const addListener = jest
      .fn()
      .mockImplementation((event: string) =>
        event === 'keyboardDidShow'
          ? { remove: removeShow }
          : { remove: removeHide },
      );
    const reactNativeModule = ReactNative as unknown as {
      Keyboard?: { addListener: typeof addListener };
    };
    reactNativeModule.Keyboard = {
      addListener,
    };

    const { unmount } = render(
      <ConfirmMnemonicScreen
        mnemonic="alpha beta"
        dictionary={dictionary}
        onComplete={jest.fn()}
      />,
    );

    expect(addListener).toHaveBeenCalledWith(
      'keyboardDidShow',
      expect.any(Function),
    );
    expect(addListener).toHaveBeenCalledWith(
      'keyboardDidHide',
      expect.any(Function),
    );

    unmount();
    expect(removeShow).toHaveBeenCalled();
    expect(removeHide).toHaveBeenCalled();
  });
});
