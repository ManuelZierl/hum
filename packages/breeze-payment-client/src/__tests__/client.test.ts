import type { PaymentEvent } from '@hum/payment-client';
import { PaymentError } from '@hum/payment-client';
import type {
  Payment as BreezPayment,
  PreparePayOnchainResponse,
  RecommendedFees,
  SdkEvent,
  SendPaymentResponse,
} from '@breeztech/react-native-breez-sdk-liquid';

const mockSdk = {
  defaultConfig: jest.fn<Promise<{ base: string }>, [string, string]>(),
  connect: jest.fn<Promise<void>, [Record<string, unknown>]>(),
  disconnect: jest.fn<Promise<void>, []>(),
  addEventListener: jest.fn<Promise<string>, [(event: SdkEvent) => void]>(),
  removeEventListener: jest.fn<Promise<void>, [string]>(),
  setLogger: jest.fn<
    Promise<{ remove: () => void }>,
    [((entry: { level: string; line: string }) => void) | undefined]
  >(),
  getInfo: jest.fn<
    Promise<{
      walletInfo: {
        balanceSat: number;
        pendingReceiveSat: number;
        pendingSendSat: number;
        assetBalances: Array<{
          assetId?: string;
          ticker?: string;
          balanceSat: number;
        }>;
        pubkey: string;
      };
    }>,
    []
  >(),
  prepareReceivePayment: jest.fn(),
  receivePayment: jest.fn(),
  prepareSendPayment: jest.fn(),
  sendPayment: jest.fn(),
  preparePayOnchain: jest.fn<Promise<PreparePayOnchainResponse>, [unknown]>(),
  payOnchain: jest.fn<Promise<SendPaymentResponse>, [unknown]>(),
  recommendedFees: jest.fn<Promise<RecommendedFees>, []>(),
  listPayments: jest.fn<Promise<BreezPayment[]>, [unknown]>(),
  parseInvoice: jest.fn(),
};

jest.mock('@breeztech/react-native-breez-sdk-liquid', () => mockSdk, {
  virtual: true,
});

const resetSdkMocks = () => {
  for (const value of Object.values(mockSdk)) {
    if ('mockReset' in value) {
      value.mockReset();
    }
  }
};

const loadModule = async (nativeModules: Record<string, unknown>) => {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    __esModule: true,
    ...jest.requireActual('react-native'),
    NativeModules: nativeModules,
  }));
  return import('../client');
};

describe('BreezePaymentClient', () => {
  beforeEach(() => {
    resetSdkMocks();
    delete (global as { __turboModuleProxy?: unknown }).__turboModuleProxy;
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('throws when the Breez native module is missing', async () => {
    const { createBreezePaymentClient } = await loadModule({});
    expect(() =>
      createBreezePaymentClient({ apiKey: 'key', mnemonic: 'seed words' }),
    ).toThrow(
      new PaymentError(
        'UNSUPPORTED',
        'Breez payments require a custom native build. Run the app from a dev build or standalone build to enable payments.',
      ),
    );
  });

  it('initializes, fetches data, handles events, and tears down cleanly', async () => {
    const events: PaymentEvent[] = [];
    const { BreezePaymentClientImpl } = await loadModule({
      RNBreezSDKLiquid: {},
    });

    mockSdk.defaultConfig.mockResolvedValue({ base: 'config' });
    mockSdk.connect.mockResolvedValue(undefined);
    mockSdk.disconnect.mockResolvedValue(undefined);
    mockSdk.setLogger.mockResolvedValue({ remove: jest.fn() });
    let eventHandler: ((ev: SdkEvent) => void) | undefined;
    mockSdk.addEventListener.mockImplementation(
      async (handler: (ev: SdkEvent) => void) => {
        eventHandler = handler;
        return 'listener-id';
      },
    );
    mockSdk.removeEventListener.mockResolvedValue(undefined);
    mockSdk.getInfo.mockResolvedValue({
      walletInfo: {
        balanceSat: 1_000,
        pendingReceiveSat: 25,
        pendingSendSat: 5,
        assetBalances: [
          { assetId: 'USDt', balanceSat: 200 },
          { ticker: 'EURx', balanceSat: 50 },
        ],
        pubkey: 'pub',
      },
    });
    const breezPayment: BreezPayment = {
      amountSat: 500,
      feesSat: 0,
      paymentType: 'receive',
      status: 'complete',
      timestamp: 100,
      details: {
        type: 'lightning',
        swapId: 'swap-1',
        description: 'invoice',
        invoice: 'lnbc',
        paymentHash: 'hash',
      },
      txId: 'p1',
    };
    mockSdk.listPayments.mockResolvedValue([breezPayment]);
    mockSdk.recommendedFees.mockResolvedValue({
      fastestFee: 3.4,
      halfHourFee: 2.2,
      hourFee: 1.1,
      economyFee: 0.9,
      minimumFee: 0.5,
    });
    mockSdk.preparePayOnchain.mockResolvedValue({
      receiverAmountSat: 10,
      claimFeesSat: 1,
      totalFeesSat: 1,
    });
    mockSdk.payOnchain.mockResolvedValue({
      payment: {
        amountSat: 10,
        feesSat: 1,
        paymentType: 'send',
        status: 'complete',
        timestamp: Date.now(),
        txId: 'tx123',
        details: {
          type: 'bitcoin',
          swapId: 'swap-2',
          bitcoinAddress: 'addr',
          description: 'withdrawal',
        },
      },
    });

    const client = new BreezePaymentClientImpl({
      apiKey: 'key',
      mnemonic: 'seed words',
    });
    const unsubscribe = client.on((event) => events.push(event));

    await client.init({ network: 'testnet', logger: jest.fn() });

    expect(mockSdk.defaultConfig).toHaveBeenCalledWith('testnet', 'key');
    expect(mockSdk.connect).toHaveBeenCalled();

    const balances = await client.getBalances();
    expect(balances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ asset: 'L-BTC', spendable: 1_000n }),
        expect.objectContaining({ asset: 'USDt', spendable: 200n }),
      ]),
    );

    const history = await client.listPayments({
      limit: 1,
      status: ['SUCCEEDED'],
    });
    expect(mockSdk.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 1,
        states: expect.arrayContaining(['complete']),
      }),
    );
    expect(history.items).toHaveLength(1);

    const fees = await client.estimateFees('withdraw', {
      sats: 10n,
      asset: 'L-BTC',
    });
    expect(fees.fast).toBe(3n);

    const tx = await client.withdrawOnchain({
      address: 'addr',
      amount: { sats: 10n, asset: 'L-BTC' },
    });
    expect(tx).toEqual({ txid: 'tx123' });

    await eventHandler?.({ type: 'synced' });
    await eventHandler?.({ type: 'paymentSucceeded', details: breezPayment });
    expect(events.some((ev) => ev.type === 'CONNECTIVITY')).toBe(true);
    expect(events.some((ev) => ev.type === 'PAYMENT_UPDATED')).toBe(true);

    await client.destroy();
    unsubscribe();
    expect(mockSdk.disconnect).toHaveBeenCalled();
  });
});
