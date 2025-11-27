import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { TextInput } from 'react-native';
import { ThemeProvider } from '@hum/ui-components/theme/theme-provider';
import { PaymentScreen, type PaymentScreenProps } from './PaymentScreen';
import type { Payment, PaymentEvent } from '@hum/payment-client';

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

  it('refreshes balances and payments when the refresh button is pressed', async () => {
    const storage = createStorage('seed words');
    mockGetBalances.mockResolvedValueOnce([
      { asset: 'L-BTC', spendable: 1n, pending: 0n },
    ]);
    mockListPayments.mockResolvedValueOnce({ items: [] });

    const { getByLabelText } = renderScreen({ storage });

    await waitFor(() =>
      expect(getByLabelText('payments.history.refresh')).toBeTruthy(),
    );

    mockGetBalances.mockClear();
    mockListPayments.mockClear();
    mockGetBalances.mockResolvedValue([]);
    mockListPayments.mockResolvedValue({ items: [] });

    await act(async () => {
      fireEvent.press(getByLabelText('payments.history.refresh'));
    });

    await waitFor(() => expect(mockGetBalances).toHaveBeenCalled());
    expect(mockListPayments).toHaveBeenCalled();
  });

  it('retries initialization when retry is pressed on error', async () => {
    const storage = {
      getItem: jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce(null),
      setItem: jest.fn(),
    } satisfies PaymentScreenProps['storage'];

    const { getByLabelText } = renderScreen({ storage });

    await waitFor(() =>
      expect(getByLabelText('payments.errors.retry')).toBeTruthy(),
    );

    await act(async () => {
      fireEvent.press(getByLabelText('payments.errors.retry'));
    });

    await waitFor(() => expect(storage.getItem).toHaveBeenCalledTimes(2));
  });

  it('reacts to balance and payment update events', async () => {
    const storage = createStorage('seed words');
    mockGetBalances.mockResolvedValueOnce([
      { asset: 'L-BTC', spendable: 1n, pending: 0n },
    ]);
    mockListPayments.mockResolvedValueOnce({ items: [] });

    const { findByLabelText } = renderScreen({ storage });

    await waitFor(() => expect(mockOn).toHaveBeenCalled());
    const listener = mockOn.mock.calls[0][0] as (event: PaymentEvent) => void;
    await waitFor(() => {
      expect(mockListPayments).toHaveBeenCalled();
    });

    await act(async () => {
      listener({
        type: 'BALANCE_CHANGED',
        balances: [{ asset: 'L-BTC', spendable: 42n, pending: 0n }],
      });
    });

    expect(await findByLabelText('42 sats L-BTC')).toBeTruthy();

    const updatedPayment: Payment = {
      id: 'p-1',
      direction: 'OUTBOUND',
      rail: 'lightning',
      asset: 'L-BTC',
      amount: { sats: 2n, asset: 'L-BTC' },
      createdAt: 1,
      updatedAt: 1,
      status: 'SUCCEEDED',
      raw: {},
    };

    await act(async () => {
      listener({
        type: 'PAYMENT_UPDATED',
        payment: updatedPayment,
      });
    });

    expect(await findByLabelText('2 sats')).toBeTruthy();
  });

  it('logs destroy errors during cleanup', async () => {
    const storage = createStorage('seed words');
    mockGetBalances.mockResolvedValueOnce([
      { asset: 'L-BTC', spendable: 1n, pending: 0n },
    ]);
    mockListPayments.mockResolvedValueOnce({ items: [] });
    mockDestroy.mockRejectedValueOnce(new Error('kaboom'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { unmount } = renderScreen({ storage });

    await waitFor(() => expect(mockInit).toHaveBeenCalled());
    unmount();

    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        '[PaymentScreen] destroy failed',
        expect.any(Error),
      ),
    );

    warnSpy.mockRestore();
  });

  it('logs refresh failures', async () => {
    const storage = createStorage('seed words');
    mockGetBalances.mockResolvedValueOnce([
      { asset: 'L-BTC', spendable: 1n, pending: 0n },
    ]);
    mockListPayments.mockResolvedValueOnce({ items: [] });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByLabelText } = renderScreen({ storage });
    await waitFor(() => expect(mockInit).toHaveBeenCalled());

    mockGetBalances.mockRejectedValueOnce(new Error('refresh fail'));
    mockListPayments.mockRejectedValueOnce(new Error('refresh fail'));

    await act(async () => {
      fireEvent.press(getByLabelText('payments.history.refresh'));
    });

    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        '[PaymentScreen] refresh failed',
        expect.any(Error),
      ),
    );

    warnSpy.mockRestore();
  });

  it('shows an error when retrying initialization fails', async () => {
    const storage = {
      getItem: jest
        .fn()
        .mockResolvedValueOnce('seed words')
        .mockRejectedValueOnce(new Error('read fail')),
      setItem: jest.fn(),
    } satisfies PaymentScreenProps['storage'];
    mockInit.mockRejectedValueOnce(new Error('initial fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { getByLabelText } = renderScreen({ storage });

    await waitFor(() =>
      expect(getByLabelText('payments.errors.retry')).toBeTruthy(),
    );

    await act(async () => {
      fireEvent.press(getByLabelText('payments.errors.retry'));
    });

    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        '[PaymentScreen] retry failed',
        expect.any(Error),
      ),
    );

    warnSpy.mockRestore();
  });

  it('falls back to in-memory storage when none is provided', async () => {
    const { getByLabelText } = render(
      <ThemeProvider forcedScheme="light">
        <PaymentScreen apiKey="test" />
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByLabelText('payments.activate.cta')).toBeTruthy(),
    );
  });

  it('logs payment client errors reported during initialization', async () => {
    const storage = createStorage('seed words');
    mockInit.mockImplementationOnce(async ({ logger }) => {
      logger?.('error', 'bad news');
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    renderScreen({ storage });

    await waitFor(() => expect(mockInit).toHaveBeenCalled());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith('[PaymentClient]', 'bad news'),
    );

    warnSpy.mockRestore();
  });
});
