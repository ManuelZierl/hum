import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { PaymentScreen, type PaymentScreenProps } from './PaymentScreen';
import type { Payment } from '@hum/payment-client';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const translationMock = {
  t: (key: string) => key,
  i18n: { language: 'en', changeLanguage: jest.fn() },
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

jest.mock('./utils/mnemonic', () => ({
  generateMnemonic: jest.fn(
    () => 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
  ),
}));

const mockDestroy = jest.fn();
const mockInit = jest.fn();
const mockGetBalances = jest.fn();
const mockListPayments = jest.fn();
const mockOn = jest.fn();

jest.mock('@hum/breeze-payment-client', () => ({
  createBreezePaymentClient: jest.fn(() => ({
    init: mockInit,
    destroy: mockDestroy,
    getBalances: mockGetBalances,
    listPayments: mockListPayments,
    on: mockOn.mockImplementation(() => jest.fn()),
  })),
}));

const createStorage = (mnemonic: string | null = null) => {
  let stored = mnemonic;
  return {
    getItem: jest.fn(async () => stored),
    setItem: jest.fn(async (_key: string, value: string) => {
      stored = value;
    }),
  };
};

const renderScreen = (props?: Partial<PaymentScreenProps>) =>
  render(
    <ThemeProvider forcedScheme="light">
      <PaymentScreen apiKey="test" storage={createStorage()} {...props} />
    </ThemeProvider>,
  );

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInit.mockResolvedValue(undefined);
    mockDestroy.mockResolvedValue(undefined);
    mockGetBalances.mockResolvedValue([]);
    mockListPayments.mockResolvedValue({ items: [] });
    mockOn.mockImplementation(() => jest.fn());
  });

  it('shows activation call to action when inactive', async () => {
    const storage = createStorage(null);
    const { getByLabelText } = renderScreen({ storage });
    await waitFor(() =>
      expect(getByLabelText('payments.activate.cta')).toBeTruthy(),
    );
    expect(storage.getItem).toHaveBeenCalled();
  });

  it('renders error state when api key missing', async () => {
    const { UNSAFE_getByProps } = renderScreen({ apiKey: '' });
    await waitFor(() =>
      expect(
        UNSAFE_getByProps({ children: 'payments.errors.missing_api_key' }),
      ).toBeTruthy(),
    );
  });

  it('initializes client and shows balances when mnemonic exists', async () => {
    const storage = createStorage('seed words');
    mockGetBalances.mockResolvedValue([
      { asset: 'L-BTC', spendable: 1000n, pending: 0n },
    ]);
    const samplePayment: Payment = {
      id: '1',
      direction: 'OUTBOUND',
      rail: 'lightning',
      asset: 'L-BTC',
      amount: { sats: 500n, asset: 'L-BTC' },
      createdAt: 1_700_000_000,
      updatedAt: 1_700_000_000,
      status: 'SUCCEEDED',
      raw: {},
    };
    mockListPayments.mockResolvedValue({ items: [samplePayment] });

    const { UNSAFE_getByProps } = renderScreen({ storage });

    await waitFor(() => expect(mockInit).toHaveBeenCalled());
    await waitFor(() =>
      expect(UNSAFE_getByProps({ children: '1000 sats' })).toBeTruthy(),
    );
    await waitFor(() =>
      expect(UNSAFE_getByProps({ children: '500 sats' })).toBeTruthy(),
    );
  });

  it('stores mnemonic after activation flow', async () => {
    const storage = createStorage(null);
    mockGetBalances.mockResolvedValue([
      { asset: 'L-BTC', spendable: 123n, pending: 0n },
    ]);
    mockListPayments.mockResolvedValue({ items: [] });

    const { getByLabelText, UNSAFE_getByType } = renderScreen({
      storage,
    });

    await waitFor(() =>
      expect(getByLabelText('payments.activate.cta')).toBeTruthy(),
    );

    const activateButton = getByLabelText('payments.activate.cta');

    await act(async () => {
      fireEvent.press(activateButton);
    });

    await waitFor(() =>
      expect(
        getByLabelText('payments.activate.actions.confirm_written'),
      ).toBeTruthy(),
    );

    fireEvent.press(
      getByLabelText('payments.activate.actions.confirm_written'),
    );

    await waitFor(() => expect(UNSAFE_getByType(TextInput)).toBeTruthy());

    const confirmationInput = UNSAFE_getByType(TextInput);
    fireEvent.changeText(
      confirmationInput,
      'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
    );

    await waitFor(() =>
      expect(getByLabelText('payments.activate.actions.finish')).toBeTruthy(),
    );

    const finishButton = getByLabelText('payments.activate.actions.finish');
    await act(async () => {
      fireEvent.press(finishButton);
    });

    await waitFor(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        'payments.mnemonic',
        'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu',
      );
    });
    expect(mockInit).toHaveBeenCalled();
  });
});
