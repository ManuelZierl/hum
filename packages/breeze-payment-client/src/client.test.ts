import type {
  EventListener as BreezEventListener,
  GetInfoResponse,
  LiquidNetwork,
  Payment as BreezPayment,
  PreparePayOnchainResponse,
  PrepareReceiveResponse,
  ReceivePaymentResponse,
  RecommendedFees,
  SdkEvent,
} from '@breeztech/react-native-breez-sdk-liquid';

jest.mock(
  '@breeztech/react-native-breez-sdk-liquid',
  () => {
    const listeners: BreezEventListener[] = [];

    const addEventListener = jest.fn(
      async (listener: BreezEventListener): Promise<string> => {
        listeners.push(listener);
        return 'listener-id';
      },
    );

    const removeEventListener = jest.fn(async () => {
      listeners.length = 0;
    });

    const setLogger = jest.fn(async () => ({ remove: jest.fn() }));

    const paymentSample = {
      timestamp: 1700000000,
      amountSat: 1234,
      feesSat: 10,
      paymentType: 'send',
      status: 'complete',
      details: {
        type: 'lightning',
        swapId: 'swap-1',
        description: 'test payment',
        paymentHash: 'hash-1',
        destinationPubkey: 'peer',
      },
    } satisfies BreezPayment;

    return {
      __esModule: true,
      defaultConfig: jest.fn(async () => ({
        workingDir: '/tmp',
        network: 'mainnet',
      })),
      connect: jest.fn(async () => undefined),
      disconnect: jest.fn(async () => undefined),
      setLogger,
      addEventListener,
      removeEventListener,
      getInfo: jest.fn(async () => ({
        walletInfo: {
          balanceSat: 1000,
          pendingSendSat: 100,
          pendingReceiveSat: 50,
          pubkey: 'node',
          assetBalances: [{ assetId: 'USDT-LQ', balanceSat: 500 }],
        },
      })),
      prepareReceivePayment: jest.fn(async () => ({
        paymentMethod: 'bolt11Invoice',
        feesSat: 12,
      })),
      receivePayment: jest.fn(async () => ({ destination: 'bolt123' })),
      parseInvoice: jest.fn(async () => ({
        bolt11: 'bolt123',
        description: 'desc',
        amountMsat: 2000,
        expiry: 1700000100,
        timestamp: 1700000000,
        payeePubkey: 'peer',
        paymentHash: 'hash-1',
      })),
      prepareSendPayment: jest.fn(async () => ({
        destination: { type: 'bolt11', invoice: { bolt11: 'bolt123' } },
        feesSat: 5,
      })),
      sendPayment: jest.fn(async () => ({ payment: paymentSample })),
      preparePayOnchain: jest.fn(async () => ({
        receiverAmountSat: 100,
        claimFeesSat: 3,
        totalFeesSat: 4,
      })),
      payOnchain: jest.fn(async () => ({
        payment: { ...paymentSample, txId: 'tx123' },
      })),
      recommendedFees: jest.fn(async () => ({
        fastestFee: 10,
        halfHourFee: 7,
        hourFee: 4,
        economyFee: 2,
        minimumFee: 1,
      })),
      listPayments: jest.fn(async () => [paymentSample]),
      __listeners: listeners,
    };
  },
  { virtual: true },
);

import * as ReactNative from 'react-native';
import { createBreezePaymentClient } from '@hum/breeze-payment-client';
import { PaymentError } from '@hum/payment-client';
import type { PaymentEvent } from '@hum/payment-client';

type LoggerSubscription = { remove: () => void };

type BreezSdkMock = {
  defaultConfig: jest.Mock<
    Promise<{ workingDir: string; network: LiquidNetwork }>,
    [LiquidNetwork, string?]
  >;
  connect: jest.Mock<
    Promise<void>,
    [
      {
        config: Record<string, unknown>;
        mnemonic?: string;
        passphrase?: string;
        seed?: number[];
      },
    ]
  >;
  disconnect: jest.Mock<Promise<void>, []>;
  setLogger: jest.Mock<
    Promise<LoggerSubscription>,
    [(entry: { level: string; line: string }) => void]
  >;
  addEventListener: jest.Mock<Promise<string>, [BreezEventListener]>;
  removeEventListener: jest.Mock<Promise<void>, [string?]>;
  getInfo: jest.Mock<Promise<GetInfoResponse>, []>;
  prepareReceivePayment: jest.Mock<
    Promise<PrepareReceiveResponse>,
    [Record<string, unknown>]
  >;
  receivePayment: jest.Mock<
    Promise<ReceivePaymentResponse>,
    [Record<string, unknown>]
  >;
  parseInvoice: jest.Mock<
    Promise<{
      bolt11: string;
      description?: string;
      amountMsat?: number;
      expiry: number;
      timestamp: number;
      payeePubkey: string;
      paymentHash: string;
    }>,
    [string]
  >;
  prepareSendPayment: jest.Mock<
    Promise<{ destination: unknown; feesSat?: number }>,
    [Record<string, unknown>]
  >;
  sendPayment: jest.Mock<
    Promise<{ payment: BreezPayment }>,
    [Record<string, unknown>]
  >;
  preparePayOnchain: jest.Mock<
    Promise<PreparePayOnchainResponse>,
    [Record<string, unknown>]
  >;
  payOnchain: jest.Mock<
    Promise<{ payment: BreezPayment }>,
    [Record<string, unknown>]
  >;
  recommendedFees: jest.Mock<Promise<RecommendedFees>, []>;
  listPayments: jest.Mock<Promise<BreezPayment[]>, [Record<string, unknown>]>;
  __listeners: BreezEventListener[];
};

const sdk = jest.requireMock(
  '@breeztech/react-native-breez-sdk-liquid',
) as unknown as BreezSdkMock;

const { NativeModules } = ReactNative as unknown as {
  NativeModules: Record<string, Record<string, unknown>>;
};

type ClientOptions = Parameters<typeof createBreezePaymentClient>[0];

const defaultClientOptions: ClientOptions = {
  apiKey: 'key',
  mnemonic: 'words',
};

const createClient = (options: Partial<ClientOptions> = {}) =>
  createBreezePaymentClient({ ...defaultClientOptions, ...options });

describe('BreezePaymentClientImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sdk.__listeners.length = 0;
    NativeModules.RNBreezSDKLiquid = NativeModules.RNBreezSDKLiquid ?? {};
  });

  it('initializes breez sdk and exposes balances', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    expect(sdk.defaultConfig).toHaveBeenCalledWith('mainnet', 'key');
    expect(sdk.connect).toHaveBeenCalled();
    expect(client.isReady()).toBe(true);

    const balances = await client.getBalances();
    expect(balances[0]).toEqual({
      asset: 'L-BTC',
      spendable: BigInt(1000),
      pending: BigInt(150),
    });
  });

  it('throws UNSUPPORTED error when native module is unavailable', () => {
    delete NativeModules.RNBreezSDKLiquid;
    expect(() => createClient()).toThrowErrorMatchingInlineSnapshot(
      `"Breez payments require a custom native build. Run the app from a dev build or standalone build to enable payments."`,
    );
  });

  it('creates and decodes invoices', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    const invoice = await client.createInvoice({ description: 'test' });
    expect(sdk.prepareReceivePayment).toHaveBeenCalled();
    expect(invoice.bolt11).toBe('bolt123');

    const decoded = await client.decodeInvoice('bolt123');
    expect(decoded.id).toBe('hash-1');
    expect(decoded.amount?.sats).toBe(BigInt(2));
  });

  it('converts invoice amounts for bitcoin and asset invoices', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.prepareReceivePayment.mockClear();

    sdk.receivePayment.mockResolvedValueOnce({ destination: 'bolt-btc' });
    await client.createInvoice({
      description: 'btc',
      amount: { sats: BigInt(150), asset: 'L-BTC' },
    });
    expect(sdk.prepareReceivePayment).toHaveBeenLastCalledWith({
      paymentMethod: 'bolt11Invoice',
      amount: { type: 'bitcoin', payerAmountSat: 150 },
    });

    sdk.receivePayment.mockResolvedValueOnce({ destination: 'bolt-asset' });
    await client.createInvoice({
      amount: { sats: BigInt(250), asset: 'USDT-LQ' },
    });
    expect(sdk.prepareReceivePayment).toHaveBeenLastCalledWith({
      paymentMethod: 'bolt11Invoice',
      amount: { type: 'asset', assetId: 'USDT-LQ', payerAmount: 250 },
    });
  });

  it('rejects invoice amounts outside safe number range', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    await expect(
      client.createInvoice({
        amount: {
          sats: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
          asset: 'L-BTC',
        },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INVOICE' });
  });

  it('pays invoices and maps responses', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    const payment = await client.payInvoice({ invoice: 'bolt123' });
    expect(sdk.prepareSendPayment).toHaveBeenCalledWith({
      destination: 'bolt123',
      amount: undefined,
    });
    expect(payment.status).toBe('SUCCEEDED');
    expect(payment.direction).toBe('OUTBOUND');
  });

  it('converts asset overrides when paying invoices', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.prepareSendPayment.mockClear();

    await client.payInvoice({
      invoice: 'bolt123',
      amountOverride: { sats: BigInt(200), asset: 'USDT-LQ' },
    });

    expect(sdk.prepareSendPayment).toHaveBeenLastCalledWith(
      expect.objectContaining({
        destination: 'bolt123',
        amount: {
          type: 'asset',
          toAsset: 'USDT-LQ',
          receiverAmount: 200,
        },
      }),
    );
  });

  it('rejects unsafe payment overrides', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    await expect(
      client.payInvoice({
        invoice: 'bolt123',
        amountOverride: {
          sats: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
          asset: 'L-BTC',
        },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INVOICE' });
  });

  it('wraps decode invoice errors', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.parseInvoice.mockRejectedValueOnce('bad invoice');

    await expect(client.decodeInvoice('bad')).rejects.toMatchObject({
      code: 'INVALID_INVOICE',
    });
  });

  it('lists payments with pagination mapping', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    const result = await client.listPayments({
      limit: 1,
      direction: 'OUTBOUND',
    });
    expect(sdk.listPayments).toHaveBeenCalledWith({
      offset: 0,
      limit: 1,
      filters: ['send'],
      states: undefined,
      sortAscending: false,
    });
    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBe('1');
  });

  it('forwards sdk events to listeners', async () => {
    const client = createClient();
    const events: PaymentEvent[] = [];
    client.on((ev) => events.push(ev));
    await client.init({ network: 'mainnet' });

    const [listener] = sdk.__listeners as BreezEventListener[];
    await listener({
      type: 'paymentSucceeded',
      details: {
        timestamp: 1700000000,
        amountSat: 1234,
        paymentType: 'send',
        status: 'complete',
        details: {
          type: 'lightning',
          swapId: 'swap-1',
          description: 'ok',
        },
      },
    } satisfies SdkEvent);

    await listener({ type: 'synced' } as SdkEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await listener({ type: 'dataSynced', didPullNewRecords: true } as SdkEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(events.some((ev) => ev.type === 'PAYMENT_UPDATED')).toBe(true);
    expect(events.some((ev) => ev.type === 'CONNECTIVITY')).toBe(true);
    expect(events.some((ev) => ev.type === 'BALANCE_CHANGED')).toBe(true);
  });

  it('reuses sdk connection when reinitializing with same network', async () => {
    const client = createClient();
    const firstLogger = jest.fn();
    await client.init({ network: 'mainnet', logger: firstLogger });

    const secondLogger = jest.fn();
    await client.init({
      network: 'mainnet',
      logger: secondLogger,
      preferredAsset: 'USDT-LQ',
    });

    expect(sdk.connect).toHaveBeenCalledTimes(1);
    expect(sdk.setLogger).toHaveBeenCalledTimes(2);
    expect(client.isReady()).toBe(true);
  });

  it('merges config overrides and reconnects when network changes', async () => {
    const client = createClient({
      workingDir: '/data',
      configOverrides: {
        paymentTimeoutSec: 42,
      },
    });

    await client.init({ network: 'testnet' });
    expect(sdk.defaultConfig).toHaveBeenLastCalledWith('testnet', 'key');

    sdk.connect.mockClear();
    sdk.disconnect.mockClear();

    await client.init({ network: 'regtest' });

    expect(sdk.disconnect).toHaveBeenCalledTimes(1);
    expect(sdk.connect).toHaveBeenCalledTimes(1);

    const connectCall = sdk.connect.mock.calls[0] as Parameters<
      BreezSdkMock['connect']
    >;
    const config = connectCall[0].config as Record<string, unknown>;
    expect(config).toMatchObject({
      workingDir: '/data',
      paymentTimeoutSec: 42,
    });
    expect(sdk.defaultConfig).toHaveBeenLastCalledWith('regtest', 'key');
  });

  it('destroys sdk resources and resets readiness', async () => {
    const removeSpy = jest.fn();
    sdk.setLogger.mockResolvedValueOnce({ remove: removeSpy });
    const client = createClient();
    client.on(() => {});
    await client.init({ network: 'mainnet', logger: jest.fn() });

    await client.destroy();

    expect(removeSpy).toHaveBeenCalled();
    expect(sdk.removeEventListener).toHaveBeenCalled();
    expect(sdk.disconnect).toHaveBeenCalled();
    expect(client.isReady()).toBe(false);
  });

  it('ignores destroy calls when client is not ready', async () => {
    const client = createClient();
    await client.destroy();
    expect(sdk.disconnect).not.toHaveBeenCalled();
  });

  it('exposes capabilities and network value', async () => {
    const client = createClient();
    await client.init({ network: 'regtest' });
    expect(client.network()).toBe('regtest');
    expect(Array.from(client.capabilities()).sort()).toEqual(
      [
        'PAY_INVOICE',
        'CREATE_INVOICE',
        'DECODE_INVOICE',
        'ONCHAIN_DEPOSIT',
        'ONCHAIN_WITHDRAW',
        'LIST_PAYMENTS',
        'FEE_ESTIMATE',
      ].sort(),
    );
  });

  it('throws provider errors when destroy fails', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.disconnect.mockRejectedValueOnce(new Error('disconnect fail'));

    await expect(client.destroy()).rejects.toMatchObject({ code: 'PROVIDER' });
    expect(client.isReady()).toBe(false);
  });

  it('throws PaymentError when methods are used before init', async () => {
    const client = createClient();
    await expect(client.getBalances()).rejects.toBeInstanceOf(PaymentError);
  });

  it('creates deposit addresses for alternate assets', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.prepareReceivePayment.mockResolvedValueOnce({
      paymentMethod: 'liquidAddress',
      feesSat: 0,
    } as PrepareReceiveResponse);
    sdk.receivePayment.mockResolvedValueOnce({ destination: 'lq1address' });

    expect(client.getDepositAddress).toBeDefined();
    const deposit = await client.getDepositAddress!('USDT-LQ');

    expect(deposit).toEqual({ address: 'lq1address', asset: 'USDT-LQ' });
    expect(sdk.prepareReceivePayment).toHaveBeenLastCalledWith({
      paymentMethod: 'liquidAddress',
      amount: { type: 'asset', assetId: 'USDT-LQ' },
    });
  });

  it('returns payment errors from deposit operations unchanged', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    const failure = new PaymentError('PROVIDER', 'fail');
    sdk.prepareReceivePayment.mockRejectedValueOnce(failure);

    await expect(client.getDepositAddress!('L-BTC')).rejects.toBe(failure);
  });

  it('propagates provider errors from balances and node info', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    sdk.getInfo.mockRejectedValueOnce(new Error('balance fail'));
    await expect(client.getBalances()).rejects.toMatchObject({
      code: 'PROVIDER',
    });

    sdk.getInfo.mockRejectedValueOnce(new Error('node fail'));
    await expect(client.getNodeInfo()).rejects.toMatchObject({
      code: 'PROVIDER',
    });
  });

  it('returns blank txid when payOnchain response omits it', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    const paymentWithoutTx: BreezPayment = {
      timestamp: 1700000005,
      amountSat: 200,
      paymentType: 'send',
      status: 'complete',
      details: { type: 'lightning', swapId: 'swap-tx', description: 'no tx' },
    } as BreezPayment;
    sdk.payOnchain.mockResolvedValueOnce({
      payment: paymentWithoutTx,
    });

    expect(client.withdrawOnchain).toBeDefined();
    const result = await client.withdrawOnchain!({
      address: 'dest',
      amount: { sats: BigInt(500), asset: 'L-BTC' },
    });

    expect(result).toEqual({ txid: '' });
  });

  it('propagates withdraw errors from sdk', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.preparePayOnchain.mockRejectedValueOnce(new Error('prepare fail'));

    await expect(
      client.withdrawOnchain!({
        address: 'dest',
        amount: { sats: BigInt(100), asset: 'L-BTC' },
      }),
    ).rejects.toMatchObject({ code: 'PROVIDER' });
  });

  it('maps recommended fees into fee estimate', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.recommendedFees.mockResolvedValueOnce({
      fastestFee: 15,
      halfHourFee: 9,
      hourFee: 4,
      economyFee: 2,
      minimumFee: 1,
    });

    expect(client.estimateFees).toBeDefined();
    const estimate = await client.estimateFees!('withdraw', {
      sats: BigInt(1_000),
      asset: 'L-BTC',
    });

    expect(estimate).toEqual({
      fast: BigInt(15),
      normal: BigInt(9),
      slow: BigInt(4),
      asset: 'L-BTC',
    });
    expect(sdk.preparePayOnchain).toHaveBeenCalled();
  });

  it('maps status filters when listing payments', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.listPayments.mockResolvedValueOnce([
      {
        timestamp: 1700000001,
        amountSat: 321,
        paymentType: 'receive',
        status: 'pending',
        details: {
          type: 'lightning',
          swapId: 'swap-2',
          description: 'pending',
        },
      } as BreezPayment,
    ]);

    const result = await client.listPayments({
      limit: 2,
      cursor: '1',
      direction: 'INBOUND',
      status: ['FAILED', 'EXPIRED', 'IN_FLIGHT', 'SUCCEEDED', 'CANCELED'],
    });

    expect(sdk.listPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        offset: 1,
        filters: ['receive'],
        states: expect.arrayContaining([
          'failed',
          'timedOut',
          'pending',
          'waitingFeeAcceptance',
          'complete',
        ]),
      }),
    );
    expect(result.nextCursor).toBeUndefined();

    sdk.listPayments.mockResolvedValueOnce([]);
    await client.listPayments({ status: ['CANCELED'] });
    expect(sdk.listPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ states: ['failed'] }),
    );

    sdk.listPayments.mockResolvedValueOnce([]);
    await client.listPayments({ status: ['SUCCEEDED'] });
    expect(sdk.listPayments).toHaveBeenLastCalledWith(
      expect.objectContaining({ states: ['complete'] }),
    );
  });

  it('propagates errors from estimateFees and listPayments', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    sdk.recommendedFees.mockRejectedValueOnce(new Error('fee fail'));
    await expect(
      client.estimateFees!('withdraw', { sats: BigInt(1), asset: 'L-BTC' }),
    ).rejects.toMatchObject({ code: 'PROVIDER' });

    sdk.listPayments.mockRejectedValueOnce('list fail');
    await expect(client.listPayments()).rejects.toMatchObject({
      code: 'PROVIDER',
    });
  });

  it('tears down event stream when last listener unsubscribes', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });

    const unsubscribe = client.on(() => {});
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sdk.addEventListener).toHaveBeenCalled();

    sdk.removeEventListener.mockRejectedValueOnce(new Error('remove fail'));
    unsubscribe();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(sdk.removeEventListener).toHaveBeenCalled();
  });

  it('normalizes logger levels before forwarding', async () => {
    const client = createClient();
    const logger = jest.fn();
    await client.init({ network: 'mainnet', logger });

    const loggerCallback = sdk.setLogger.mock.calls[0][0];
    loggerCallback({ level: 'ERROR', line: 'boom' });
    loggerCallback({ level: 'warning', line: 'warn' });
    loggerCallback({ level: 'DEBUG', line: 'dbg' });
    loggerCallback({ level: 'info', line: 'info' });

    expect(logger).toHaveBeenNthCalledWith(1, 'error', 'boom');
    expect(logger).toHaveBeenNthCalledWith(2, 'warn', 'warn');
    expect(logger).toHaveBeenNthCalledWith(3, 'debug', 'dbg');
    expect(logger).toHaveBeenNthCalledWith(4, 'info', 'info');
  });

  it('wraps provider errors in PaymentError', async () => {
    const client = createClient();
    await client.init({ network: 'mainnet' });
    sdk.prepareSendPayment.mockRejectedValueOnce(new Error('boom'));

    await expect(
      client.payInvoice({ invoice: 'bolt123' }),
    ).rejects.toMatchObject({ code: 'PROVIDER' });
  });

  it('fails init with PaymentError when sdk connect fails', async () => {
    const client = createClient();
    sdk.connect.mockRejectedValueOnce(new Error('connect fail'));

    await expect(client.init({ network: 'mainnet' })).rejects.toMatchObject({
      code: 'INIT_FAILED',
    });
    expect(client.isReady()).toBe(false);
  });
});
