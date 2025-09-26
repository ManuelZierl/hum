import React from 'react';
import { StyleSheet } from 'react-native';
import * as ReactNative from 'react-native';

const { Keyboard } = ReactNative as unknown as {
  Keyboard: {
    addListener: (
      event: 'keyboardDidShow' | 'keyboardDidHide',
      listener: () => void,
    ) => { remove(): void };
  };
};
import { render, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { ConfirmMnemonicScreen } from './ConfirmMnemonicScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 12, left: 0, right: 0 }),
}));

const translationMock = {
  t: (key: string, opts?: Record<string, unknown>) =>
    typeof opts?.word === 'string' ? `${key}:${opts.word}` : key,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

const MNEMONIC =
  'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
const DICTIONARY = MNEMONIC.split(' ');

const keyboardListeners: Record<string, Array<() => void>> = {};

beforeEach(() => {
  keyboardListeners.keyboardDidShow = [];
  keyboardListeners.keyboardDidHide = [];
  jest
    .spyOn(Keyboard, 'addListener')
    .mockImplementation((event: string, listener: () => void) => {
      if (!keyboardListeners[event]) keyboardListeners[event] = [];
      keyboardListeners[event].push(listener);
      return { remove: jest.fn() } as unknown as { remove(): void };
    });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderScreen = (onComplete: jest.Mock) =>
  render(
    <ThemeProvider forcedScheme="light">
      <ConfirmMnemonicScreen
        mnemonic={MNEMONIC}
        dictionary={DICTIONARY}
        onComplete={onComplete}
        bottomOffset={64}
      />
    </ThemeProvider>,
  );

describe('ConfirmMnemonicScreen', () => {
  it('enables finishing after pasting the full mnemonic', () => {
    const onComplete = jest.fn();
    const { getByLabelText } = renderScreen(onComplete);

    const input = getByLabelText('payments.activate.confirmation.placeholder');
    fireEvent.changeText(input, MNEMONIC);

    const finishButton = getByLabelText('payments.activate.actions.finish');
    const disabled = finishButton.props.accessibilityState?.disabled ?? false;
    expect(disabled).toBe(false);

    fireEvent.press(finishButton);
    expect(onComplete).toHaveBeenCalled();
  });

  it('adds safe bottom padding for the action bar', () => {
    const { getByLabelText } = renderScreen(jest.fn());
    const actionBar = getByLabelText('confirm-bottom-actions');
    const style = StyleSheet.flatten(actionBar.props.style);
    const paddingBottom =
      typeof style?.paddingBottom === 'string'
        ? parseFloat(style.paddingBottom)
        : style?.paddingBottom;
    const marginBottom =
      typeof style?.marginBottom === 'string'
        ? parseFloat(style.marginBottom)
        : style?.marginBottom;
    expect(paddingBottom).toBeGreaterThan(12);
    expect(marginBottom).toBeGreaterThan(50);
  });

  it('surfaces an error when an invalid word is entered', async () => {
    const { getByLabelText, findByLabelText } = renderScreen(jest.fn());
    const input = getByLabelText('payments.activate.confirmation.placeholder');
    await act(async () => {
      fireEvent.changeText(input, 'wrong ');
    });
    expect(
      await findByLabelText(
        'payments.activate.confirmation.invalid_word:wrong',
      ),
    ).toBeTruthy();
  });

  it('allows completing the mnemonic using suggestions', async () => {
    const onComplete = jest.fn();
    const { getByLabelText, findByLabelText } = renderScreen(onComplete);
    const input = getByLabelText('payments.activate.confirmation.placeholder');
    for (const word of MNEMONIC.split(' ')) {
      const prefix = word.slice(0, Math.min(3, word.length));
      await act(async () => {
        fireEvent.changeText(input, prefix);
      });
      const suggestion = await findByLabelText(
        `payments.activate.confirmation.use_suggestion:${word}`,
      );
      fireEvent.press(suggestion);
    }
    fireEvent.press(getByLabelText('payments.activate.actions.finish'));
    expect(onComplete).toHaveBeenCalled();
  });

  it('removes confirmed words and clears pending input', async () => {
    const { getByLabelText, queryByText } = renderScreen(jest.fn());
    const input = getByLabelText('payments.activate.confirmation.placeholder');

    await act(async () => {
      fireEvent.changeText(input, 'alpha ');
    });

    await act(async () => {
      fireEvent.changeText(input, 'bet');
    });

    const removeButton = getByLabelText(
      'payments.activate.confirmation.remove_word',
    );
    fireEvent.press(removeButton);

    expect(queryByText('01 alpha')).toBeNull();
    const updatedInput = getByLabelText(
      'payments.activate.confirmation.placeholder',
    );
    expect(updatedInput.props.value).toBe('');
  });

  it('validates the current input when submitting editing', async () => {
    const { getByLabelText, findByLabelText } = renderScreen(jest.fn());
    const input = getByLabelText('payments.activate.confirmation.placeholder');

    fireEvent.changeText(input, 'wrong');
    fireEvent(input, 'submitEditing');

    expect(
      await findByLabelText(
        'payments.activate.confirmation.invalid_word:wrong',
      ),
    ).toBeTruthy();
  });

  it('collapses the bottom margin when the keyboard is visible', async () => {
    const { getByLabelText } = renderScreen(jest.fn());
    const getMargin = () => {
      const style = StyleSheet.flatten(
        getByLabelText('confirm-bottom-actions').props.style,
      );
      const marginBottom =
        typeof style?.marginBottom === 'string'
          ? parseFloat(style.marginBottom)
          : (style?.marginBottom ?? 0);
      return marginBottom;
    };
    expect(getMargin()).toBeGreaterThan(50);
    await act(async () => {
      keyboardListeners.keyboardDidShow?.forEach((listener) => listener());
    });
    expect(getMargin()).toBe(0);
    await act(async () => {
      keyboardListeners.keyboardDidHide?.forEach((listener) => listener());
    });
    expect(getMargin()).toBeGreaterThan(50);
  });
});
