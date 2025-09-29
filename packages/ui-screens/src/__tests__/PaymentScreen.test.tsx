import React from 'react';
import {
  act,
  fireEvent,
  render,
  waitFor,
  type RenderAPI,
} from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Payment, PaymentClient, PaymentEvent } from '@hum/payment-client';
import { PaymentScreen } from '../PaymentScreen';

const mockCreateClient = jest.fn();

const textContent = (node: { props?: { children?: unknown } }): string => {
  const children = node.props?.children;
  if (Array.isArray(children)) {
    return children.join('');
  }
  return children != null ? String(children) : '';
};
const findByTestID = async (api: RenderAPI, testID: string) => {
  await waitFor(() => {
    expect(api.UNSAFE_queryByProps({ testID })).not.toBeNull();
  });
  return api.UNSAFE_getByProps({ testID });
};

const getByTestID = (api: RenderAPI, testID: string) =>
  api.UNSAFE_getByProps({ testID });

const getAllByTestID = (api: RenderAPI, testID: string) =>
  api.UNSAFE_getAllByProps({ testID });

jest.mock('@hum/breeze-payment-client', () => ({
  __esModule: true,
  createBreezePaymentClient: (...args: unknown[]) => mockCreateClient(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

const translationMock = {
  t: (key: string, params?: Record<string, string | number>) => {
    if (params) {
      return `${key}:${Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')}`;
    }
    return key;
  },
  i18n: { language: 'en' },
};

jest.mock('react-i18next', () => ({
  useTranslation: () => translationMock,
}));

type MockButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
};

type MockTopBarProps = {
  title: string;
  onBackPress?: () => void;
};

jest.mock('@hum/ui-components', () => ({
  __esModule: true,
  Button: ({ children, onPress, disabled, testID }: MockButtonProps) => (
    <TouchableOpacity
      accessibilityLabel={typeof children === 'string' ? children : undefined}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      testID={testID}
    >
      <Text>{children}</Text>
    </TouchableOpacity>
  ),
  Icon: ({ name }: { name: string }) => (
    <Text testID={`icon-${name}`}>{name}</Text>
  ),
  TopBar: ({ title, onBackPress }: MockTopBarProps) => (
    <View>
      <Text>{title}</Text>
      {onBackPress ? (
        <TouchableOpacity testID="topbar-back" onPress={onBackPress}>
          <Text>back</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  ),
  useTheme: () => ({
    colors: {
      background: '#000',
      foreground: '#fff',
      mutedForeground: '#ccc',
      card: '#111',
      border: '#222',
      muted: '#333',
      humPrimary: '#f80',
      destructive: '#c00',
    },
    spacing: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
    },
    radius: {
      lg: 12,
    },
    type: {
      size: { sm: 12, base: 14, lg: 18 },
      weight: { medium: '500' },
    },
  }),
}));

let lastActivateProps: {
  onActivated?: (mnemonic: string) => void;
  onBack?: () => void;
} | null = null;

jest.mock('../ActivatePaymentScreen', () => ({
  __esModule: true,
  default: (props: {
    onActivated: (mnemonic: string) => void;
    onBack: () => void;
  }) => {
    lastActivateProps = props;
    return (
      <View testID="mock-activate-screen">
        <Text>activation</Text>
        <TouchableOpacity
          testID="mock-activation-complete"
          onPress={() => props.onActivated('fresh mnemonic')}
        >
          <Text>complete</Text>
        </TouchableOpacity>
      </View>
    );
  },
}));

interface MockClient extends PaymentClient {
  __emit?: (event: PaymentEvent) => void;
  __unsubscribe?: jest.Mock;
}

const createMockClient = (overrides: Partial<MockClient> = {}): MockClient => {
  let listener: ((event: PaymentEvent) => void) | null = null;
  const unsubscribe = jest.fn(() => {
    listener = null;
  });
  const client: MockClient = {
    init: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    getBalances: jest.fn().mockResolvedValue([]),
    listPayments: jest.fn().mockResolvedValue({ items: [] }),
    on: jest.fn((fn: (ev: PaymentEvent) => void) => {
      listener = fn;
      return unsubscribe;
    }),
    capabilities: jest.fn(() => new Set()),
    createInvoice: jest.fn(),
    decodeInvoice: jest.fn(),
    getNodeInfo: jest.fn(),
    isReady: jest.fn(() => true),
    network: jest.fn(() => 'testnet'),
    payInvoice: jest.fn(),
    ...overrides,
  } as unknown as MockClient;
  client.__emit = (event: PaymentEvent) => {
    listener?.(event);
  };
  client.__unsubscribe = unsubscribe;
  return client;
};

describe('PaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastActivateProps = null;
  });

  it('shows an error when the API key is missing', async () => {
    const storage = {
      getItem: jest.fn().mockResolvedValue('secret'),
      setItem: jest.fn(),
    };
    mockCreateClient.mockImplementation(() => createMockClient());

    const screen = render(<PaymentScreen apiKey="   " storage={storage} />);

    await waitFor(() => {
      expect(
        screen.UNSAFE_queryAllByProps({
          children: 'payments.errors.missing_api_key',
        }),
      ).not.toHaveLength(0);
    });
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('loads balances and payments and updates after events', async () => {
    const balances = [
      { asset: 'L-BTC', spendable: 1_500n, pending: 0n },
      { asset: 'USDt', spendable: 500n, pending: 0n },
      { asset: 'L-BTC', spendable: 500n, pending: 0n },
    ];
    const payments: Payment[] = [
      {
        id: 'p-1',
        amount: { sats: 1_000n, asset: 'L-BTC' },
        asset: 'L-BTC',
        counterparty: 'alice',
        createdAt: 123,
        updatedAt: 123,
        description: 'first',
        direction: 'INBOUND',
        fee: undefined,
        rail: 'lightning',
        status: 'SUCCEEDED',
        raw: {},
      },
    ];
    const listPayments = jest
      .fn()
      .mockResolvedValueOnce({ items: payments })
      .mockResolvedValueOnce({ items: payments })
      .mockResolvedValue({ items: payments });
    const client = createMockClient({
      getBalances: jest.fn().mockResolvedValue(balances),
      listPayments,
    });
    mockCreateClient.mockReturnValue(client);

    const storage = {
      getItem: jest.fn().mockResolvedValue('mnemonic words'),
      setItem: jest.fn().mockResolvedValue(undefined),
    };

    const screen = render(<PaymentScreen apiKey="api-123" storage={storage} />);

    await findByTestID(screen, 'balance-amount-L-BTC');

    expect(mockCreateClient).toHaveBeenCalledWith({
      apiKey: 'api-123',
      mnemonic: 'mnemonic words',
      workingDir: undefined,
    });
    expect(client.init).toHaveBeenCalledWith(
      expect.objectContaining({ network: 'testnet' }),
    );

    // Balances combine duplicate assets
    expect(textContent(getByTestID(screen, 'balance-amount-L-BTC'))).toContain(
      '2000',
    );
    expect(textContent(getByTestID(screen, 'balance-asset-L-BTC'))).toBe(
      'L-BTC',
    );
    expect(textContent(getByTestID(screen, 'balance-amount-USDt'))).toContain(
      '500',
    );

    // History renders rows
    expect(getByTestID(screen, 'payment-row-p-1')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('payments.history.refresh'));
    await waitFor(() => {
      expect(listPayments).toHaveBeenCalledTimes(2);
    });

    act(() => {
      client.__emit?.({
        type: 'PAYMENT_UPDATED',
        payment: {
          ...payments[0],
          id: 'p-2',
          amount: { sats: 2_000n, asset: 'L-BTC' },
        },
      });
    });

    await waitFor(() => {
      expect(getAllByTestID(screen, 'payment-row-p-1')).toHaveLength(1);
      expect(getByTestID(screen, 'payment-row-p-2')).toBeTruthy();
      expect(textContent(getByTestID(screen, 'payment-amount-p-2'))).toContain(
        '2000',
      );
    });
  });

  it('allows activating payments when inactive', async () => {
    const client = createMockClient({
      getBalances: jest.fn().mockResolvedValue([]),
      listPayments: jest.fn().mockResolvedValue({ items: [] }),
    });
    mockCreateClient.mockReturnValue(client);

    const storage = {
      getItem: jest
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValue('fresh mnemonic'),
      setItem: jest.fn().mockResolvedValue(undefined),
    };

    const screenInactive = render(
      <PaymentScreen apiKey="secret" storage={storage} onBack={jest.fn()} />,
    );

    await findByTestID(screenInactive, 'activate-payments');

    fireEvent.press(getByTestID(screenInactive, 'activate-payments'));

    await findByTestID(screenInactive, 'mock-activate-screen');

    expect(lastActivateProps).not.toBeNull();
    act(() => {
      lastActivateProps?.onActivated?.('fresh mnemonic');
    });

    await waitFor(() => {
      expect(client.init).toHaveBeenCalled();
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      'payments.mnemonic',
      'fresh mnemonic',
    );

    screenInactive.unmount();
    await waitFor(() => {
      expect(client.destroy).toHaveBeenCalled();
    });
    expect(client.__unsubscribe).toHaveBeenCalled();
  });
});
