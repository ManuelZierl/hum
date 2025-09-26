import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { ActivatePaymentScreen } from './ActivatePaymentScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 20, left: 0, right: 0 }),
}));
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => {}),
}));
const clipboardSetStringAsync = Clipboard.setStringAsync as jest.Mock;

const translationMock = {
  t: (key: string) => key,
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

jest.mock('./utils/mnemonic', () => ({
  generateMnemonic: jest.fn(
    () => 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
  ),
  WORDLIST: [
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'zeta',
    'eta',
    'theta',
    'iota',
    'kappa',
    'lambda',
    'mu',
  ],
}));

describe('ActivatePaymentScreen', () => {
  it('reserves space for bottom actions on mnemonic display', () => {
    const { getByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <ActivatePaymentScreen onActivated={jest.fn()} />
      </ThemeProvider>,
    );

    const actionBar = getByLabelText('activate-bottom-actions');
    const style = StyleSheet.flatten(actionBar.props.style);
    const paddingBottom =
      typeof style?.paddingBottom === 'string'
        ? parseFloat(style.paddingBottom)
        : style?.paddingBottom;
    const marginBottom =
      typeof style?.marginBottom === 'string'
        ? parseFloat(style.marginBottom)
        : style?.marginBottom;
    expect(paddingBottom).toBeGreaterThan(20);
    expect(marginBottom).toBeGreaterThan(50);
  });

  it('navigates to confirmation flow when continuing', () => {
    const onActivated = jest.fn();
    const { getByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <ActivatePaymentScreen onActivated={onActivated} />
      </ThemeProvider>,
    );

    fireEvent.press(
      getByLabelText('payments.activate.actions.confirm_written'),
    );

    const input = getByLabelText('payments.activate.confirmation.placeholder');
    expect(input).toBeTruthy();
  });

  it('copies the mnemonic to the clipboard', async () => {
    const { getByLabelText, findByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <ActivatePaymentScreen onActivated={jest.fn()} />
      </ThemeProvider>,
    );

    await act(async () => {
      fireEvent.press(getByLabelText('payments.activate.actions.copy'));
    });

    expect(clipboardSetStringAsync).toHaveBeenCalledWith(
      'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
    );
    expect(
      await findByLabelText('payments.activate.actions.copied'),
    ).toBeTruthy();
  });

  it('regenerates the mnemonic and displays the new words', async () => {
    const utils = jest.requireMock('./utils/mnemonic') as {
      generateMnemonic: jest.Mock;
    };
    utils.generateMnemonic
      .mockImplementationOnce(
        () =>
          'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
      )
      .mockImplementationOnce(
        () =>
          'aware badge canyon dawn eager fancy giant hotel ivory jazz knife lime',
      );

    const { getByLabelText, queryByText, findByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <ActivatePaymentScreen onActivated={jest.fn()} />
      </ThemeProvider>,
    );

    expect(await findByLabelText('01 alpha')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByLabelText('payments.activate.actions.regenerate'));
    });

    await waitFor(() => {
      expect(queryByText('alpha')).toBeNull();
    });
    expect(await findByLabelText('01 aware')).toBeTruthy();
  });
});
