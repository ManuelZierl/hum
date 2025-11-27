import * as ReactNative from 'react-native';
import type {
  Amount,
  AssetCode,
  Balance,
  Capability,
  FeeEstimate,
  Invoice,
  Network,
  Payment,
  PaymentClient,
  PaymentDirection,
  PaymentEvent,
  PaymentStatus,
} from '@hum/payment-client';
import { PaymentError } from '@hum/payment-client';
import type {
  Config,
  LiquidNetwork,
  PayAmount,
  Payment as BreezPayment,
  PaymentDetails,
  PaymentState,
  PaymentType,
  PreparePayOnchainResponse,
  PrepareReceiveResponse,
  RecommendedFees,
  ReceiveAmount,
  SdkEvent,
} from '@breeztech/react-native-breez-sdk-liquid';

export interface BreezPaymentClientOptions {
  mnemonic: string;
  apiKey: string;
  workingDir?: string;
  passphrase?: string;
  seed?: number[];
  /** Additional fields to merge into the Breez config before connecting. */
  configOverrides?: Partial<Config>;
}

type BreezSdk = typeof import('@breeztech/react-native-breez-sdk-liquid');

type LoggerFn = NonNullable<Parameters<PaymentClient['init']>[0]['logger']>;

type InternalListener = (event: PaymentEvent) => void;

const DEFAULT_ASSET: AssetCode = 'L-BTC';

const CAPABILITIES: Capability[] = [
  'PAY_INVOICE',
  'CREATE_INVOICE',
  'DECODE_INVOICE',
  'ONCHAIN_DEPOSIT',
  'ONCHAIN_WITHDRAW',
  'LIST_PAYMENTS',
  'FEE_ESTIMATE',
];

const STATUS_MAP: Record<PaymentState, PaymentStatus> = {
  created: 'PENDING',
  pending: 'IN_FLIGHT',
  complete: 'SUCCEEDED',
  failed: 'FAILED',
  timedOut: 'EXPIRED',
  refundable: 'PENDING',
  refundPending: 'PENDING',
  waitingFeeAcceptance: 'PENDING',
};

const TYPE_TO_DIRECTION: Record<PaymentType, PaymentDirection> = {
  receive: 'INBOUND',
  send: 'OUTBOUND',
};

const READY_TRUE_EVENT: PaymentEvent = { type: 'READY_CHANGED', ready: true };
const READY_FALSE_EVENT: PaymentEvent = { type: 'READY_CHANGED', ready: false };

const { NativeModules } = ReactNative as unknown as {
  NativeModules: Record<string, unknown>;
};

const BREEZ_NATIVE_MODULE = 'RNBreezSDKLiquid';

function isBreezNativeModuleLinked(): boolean {
  const module = (NativeModules as Record<string, unknown>)[
    BREEZ_NATIVE_MODULE
  ];
  if (module) return true;

  const maybeTurboProxy = (
    globalThis as { __turboModuleProxy?: (name: string) => unknown }
  ).__turboModuleProxy;
  if (typeof maybeTurboProxy === 'function') {
    try {
      const turboModule = maybeTurboProxy(BREEZ_NATIVE_MODULE);
      if (turboModule) {
        return true;
      }
    } catch {
      // ignore turbo module resolution failures
    }
  }

  return false;
}

function toLiquidNetwork(network: Network): LiquidNetwork {
  switch (network) {
    case 'mainnet':
      return 'mainnet';
    case 'regtest':
      return 'regtest';
    case 'testnet':
    default:
      return 'testnet';
  }
}

function safeNumberFromAmount(amount: Amount): number {
  const value = Number(amount.sats);
  if (!Number.isSafeInteger(value)) {
    throw new PaymentError(
      'INVALID_INVOICE',
      `Amount ${amount.sats.toString()} is outside safe number range`,
    );
  }
  return value;
}

function toReceiveAmount(amount: Amount): ReceiveAmount {
  if (amount.asset === 'L-BTC' || amount.asset === 'BTC') {
    return { type: 'bitcoin', payerAmountSat: safeNumberFromAmount(amount) };
  }
  return {
    type: 'asset',
    assetId: amount.asset,
    payerAmount: safeNumberFromAmount(amount),
  };
}

function toPayAmount(amount: Amount): PayAmount {
  if (amount.asset === 'L-BTC' || amount.asset === 'BTC') {
    return { type: 'bitcoin', receiverAmountSat: safeNumberFromAmount(amount) };
  }
  return {
    type: 'asset',
    toAsset: amount.asset,
    receiverAmount: safeNumberFromAmount(amount),
  };
}

function mapPayment(payment: BreezPayment, defaultAsset: AssetCode): Payment {
  const details = payment.details as PaymentDetails;
  const asset: AssetCode =
    details.type === 'liquid' && details.assetId
      ? (details.assetId as AssetCode)
      : defaultAsset;
  const rail = details.type === 'lightning' ? 'lightning' : 'onchain';
  const id =
    payment.txId ||
    ('paymentHash' in details && details.paymentHash) ||
    ('swapId' in details && details.swapId) ||
    (typeof payment.timestamp === 'number'
      ? `${payment.timestamp}`
      : `${Date.now()}`);

  const direction = TYPE_TO_DIRECTION[payment.paymentType];

  const fee =
    payment.feesSat != null
      ? { sats: BigInt(payment.feesSat), asset }
      : undefined;

  const description =
    ('description' in details && details.description) ||
    (details.type === 'lightning' && details.invoice) ||
    payment.destination;

  const counterparty =
    details.type === 'lightning'
      ? details.destinationPubkey || undefined
      : details.type === 'liquid'
        ? details.destination
        : details.type === 'bitcoin'
          ? details.bitcoinAddress
          : undefined;

  return {
    id,
    direction,
    rail,
    asset,
    amount: { sats: BigInt(payment.amountSat ?? 0), asset },
    fee,
    description: description || undefined,
    counterparty,
    createdAt: payment.timestamp,
    updatedAt: payment.timestamp,
    status: STATUS_MAP[payment.status] ?? 'FAILED',
    raw: payment,
  };
}

function mapRecommendedFees(
  fees: RecommendedFees,
  asset: AssetCode,
): FeeEstimate {
  return {
    fast: BigInt(Math.max(0, Math.round(fees.fastestFee))),
    normal: BigInt(Math.max(0, Math.round(fees.halfHourFee))),
    slow: BigInt(Math.max(0, Math.round(fees.hourFee))),
    asset,
  };
}

function levelToLoggerLevel(level: string): Parameters<LoggerFn>[0] {
  const normalized = level.toLowerCase();
  if (normalized.includes('error')) return 'error';
  if (normalized.includes('warn')) return 'warn';
  if (normalized.includes('debug')) return 'debug';
  return 'info';
}

export class BreezePaymentClientImpl implements PaymentClient {
  private sdk?: BreezSdk;
  private ready = false;
  private networkValue: Network = 'mainnet';
  private preferredAsset: AssetCode = DEFAULT_ASSET;
  private listeners = new Set<InternalListener>();
  private breezListenerId?: string;
  private loggerSubscription?: { remove: () => void } | null;
  private logger?: LoggerFn;

  constructor(private readonly options: BreezPaymentClientOptions) {}

  async init(opts: {
    network: Network;
    preferredAsset?: AssetCode;
    logger?: LoggerFn;
    storage?: {
      get(k: string): Promise<string | undefined>;
      set(k: string, v: string): Promise<void>;
    };
  }): Promise<void> {
    if (this.ready && this.networkValue === opts.network) {
      this.preferredAsset = opts.preferredAsset ?? DEFAULT_ASSET;
      if (opts.logger && opts.logger !== this.logger) {
        await this.attachLogger(opts.logger);
      }
      return;
    }

    if (this.ready) {
      await this.destroy();
    }

    this.preferredAsset = opts.preferredAsset ?? DEFAULT_ASSET;
    this.networkValue = opts.network;

    const sdk = await this.ensureSdk();
    try {
      let config = await sdk.defaultConfig(
        toLiquidNetwork(opts.network),
        this.options.apiKey,
      );
      if (this.options.workingDir)
        config = { ...config, workingDir: this.options.workingDir };
      if (this.options.configOverrides)
        config = { ...config, ...this.options.configOverrides };

      await sdk.connect({
        config,
        mnemonic: this.options.mnemonic,
        passphrase: this.options.passphrase,
        seed: this.options.seed,
      });

      if (opts.logger) {
        await this.attachLogger(opts.logger);
      }

      this.ready = true;
      this.emit(READY_TRUE_EVENT);
      if (this.listeners.size > 0) {
        await this.ensureEventStream();
      }
    } catch (error) {
      throw this.normalizeError(error, 'INIT_FAILED');
    }
  }

  async destroy(): Promise<void> {
    if (!this.ready) {
      return;
    }
    const sdk = await this.ensureSdk();
    try {
      if (this.breezListenerId) {
        await sdk.removeEventListener(this.breezListenerId);
        this.breezListenerId = undefined;
      }
      if (this.loggerSubscription) {
        this.loggerSubscription.remove?.();
        this.loggerSubscription = null;
      }
      await sdk.disconnect();
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    } finally {
      this.ready = false;
      this.emit(READY_FALSE_EVENT);
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  capabilities(): Set<Capability> {
    return new Set(CAPABILITIES);
  }

  network(): Network {
    return this.networkValue;
  }

  async getBalances(): Promise<Balance[]> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const info = await sdk.getInfo();
      const balances: Balance[] = [];
      const main = {
        asset: this.preferredAsset,
        spendable: BigInt(info.walletInfo.balanceSat ?? 0),
        pending: BigInt(
          (info.walletInfo.pendingReceiveSat ?? 0) +
            (info.walletInfo.pendingSendSat ?? 0),
        ),
      } satisfies Balance;
      balances.push(main);
      for (const asset of info.walletInfo.assetBalances ?? []) {
        balances.push({
          asset: (asset.assetId || asset.ticker || DEFAULT_ASSET) as AssetCode,
          spendable: BigInt(asset.balanceSat ?? 0),
          pending: BigInt(0),
        });
      }
      return balances;
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async getNodeInfo(): Promise<{
    pubkey?: string;
    alias?: string;
    urls?: string[];
  }> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const info = await sdk.getInfo();
      return { pubkey: info.walletInfo.pubkey };
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async createInvoice(req: {
    amount?: Amount;
    description?: string;
    expirySecs?: number;
  }): Promise<Invoice> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const prepareResponse: PrepareReceiveResponse =
        await sdk.prepareReceivePayment({
          paymentMethod: 'bolt11Invoice',
          amount: req.amount ? toReceiveAmount(req.amount) : undefined,
        });
      const result = await sdk.receivePayment({
        prepareResponse,
        description: req.description,
      });
      return {
        id: result.destination,
        bolt11: result.destination,
        description: req.description,
        amount: req.amount ?? null,
        expiresAt: req.expirySecs
          ? Math.floor(Date.now() / 1000) + req.expirySecs
          : undefined,
        metadata: { fees: prepareResponse.feesSat },
      };
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async decodeInvoice(bolt11: string): Promise<Invoice> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const parsed = await sdk.parseInvoice(bolt11);
      return {
        id: parsed.paymentHash,
        bolt11: parsed.bolt11,
        description: parsed.description,
        amount:
          parsed.amountMsat != null
            ? {
                sats: BigInt(Math.round(parsed.amountMsat / 1000)),
                asset: this.preferredAsset,
              }
            : null,
        expiresAt: parsed.expiry,
        metadata: { payee: parsed.payeePubkey },
      };
    } catch (error) {
      throw this.normalizeError(error, 'INVALID_INVOICE');
    }
  }

  async payInvoice(req: {
    invoice: string;
    amountOverride?: Amount;
    comment?: string;
    feeLimitPercent?: number;
  }): Promise<Payment> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const prepare = await sdk.prepareSendPayment({
        destination: req.invoice,
        amount: req.amountOverride
          ? toPayAmount(req.amountOverride)
          : undefined,
      });
      const response = await sdk.sendPayment({
        prepareResponse: prepare,
        payerNote: req.comment,
      });
      return mapPayment(response.payment, this.preferredAsset);
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async getDepositAddress(
    asset?: AssetCode,
  ): Promise<{ address: string; asset: AssetCode }> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const prepare = await sdk.prepareReceivePayment({
        paymentMethod: 'liquidAddress',
        amount: asset
          ? ({ type: 'asset', assetId: asset } as ReceiveAmount)
          : undefined,
      });
      const result = await sdk.receivePayment({ prepareResponse: prepare });
      return {
        address: result.destination,
        asset: asset ?? this.preferredAsset,
      };
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async withdrawOnchain(req: {
    address: string;
    amount: Amount;
    feeRateSatVb?: number;
  }): Promise<{ txid: string }> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const prepare: PreparePayOnchainResponse = await sdk.preparePayOnchain({
        amount: toPayAmount(req.amount),
        feeRateSatPerVbyte: req.feeRateSatVb,
      });
      const response = await sdk.payOnchain({
        address: req.address,
        prepareResponse: prepare,
      });
      const payment = response.payment;
      return { txid: payment.txId ?? '' };
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async estimateFees(
    kind: 'withdraw' | 'swapout',
    amount: Amount,
  ): Promise<FeeEstimate> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      if (kind === 'withdraw' || kind === 'swapout') {
        await sdk.preparePayOnchain({ amount: toPayAmount(amount) });
      }
      const fees = await sdk.recommendedFees();
      return mapRecommendedFees(fees, amount.asset ?? this.preferredAsset);
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  async listPayments(filter?: {
    direction?: PaymentDirection;
    status?: PaymentStatus[];
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Payment[]; nextCursor?: string }> {
    const sdk = await this.requireReadySdk(
      'NOT_READY',
      'Breez client not initialized',
    );
    try {
      const offset = filter?.cursor ? Number.parseInt(filter.cursor, 10) : 0;
      const payments: BreezPayment[] = await sdk.listPayments({
        offset: Number.isNaN(offset) ? 0 : offset,
        limit: filter?.limit,
        filters: filter?.direction
          ? [filter.direction === 'INBOUND' ? 'receive' : 'send']
          : undefined,
        states: filter?.status ? this.mapStatuses(filter.status) : undefined,
        sortAscending: false,
      });
      const items = payments.map((payment) =>
        mapPayment(payment, this.preferredAsset),
      );
      let nextCursor: string | undefined;
      if (filter?.limit && payments.length === filter.limit) {
        const base = Number.isNaN(offset) ? 0 : offset;
        nextCursor = String(base + payments.length);
      }
      return { items, nextCursor };
    } catch (error) {
      throw this.normalizeError(error, 'PROVIDER');
    }
  }

  on(listener: (ev: PaymentEvent) => void): () => void {
    this.listeners.add(listener);
    if (this.ready) {
      void this.ensureEventStream();
    }
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        void this.teardownEventStream();
      }
    };
  }

  private async ensureSdk(): Promise<BreezSdk> {
    if (this.sdk) return this.sdk;
    this.sdk = (await import(
      '@breeztech/react-native-breez-sdk-liquid'
    )) as BreezSdk;
    return this.sdk;
  }

  private async requireReadySdk(
    code: PaymentError['code'],
    message: string,
  ): Promise<BreezSdk> {
    if (!this.ready) {
      throw new PaymentError(code, message);
    }
    return this.ensureSdk();
  }

  private async attachLogger(logger: LoggerFn): Promise<void> {
    const sdk = await this.ensureSdk();
    if (this.loggerSubscription) {
      this.loggerSubscription.remove?.();
      this.loggerSubscription = null;
    }
    this.logger = logger;
    this.loggerSubscription = await sdk.setLogger(
      (entry: { level: string; line: string }) => {
        try {
          logger(levelToLoggerLevel(entry.level), entry.line);
        } catch {
          // Ignore listener errors
        }
      },
    );
  }

  private async ensureEventStream(): Promise<void> {
    if (!this.ready) return;
    if (this.breezListenerId) return;
    const sdk = await this.ensureSdk();
    this.breezListenerId = await sdk.addEventListener((event: SdkEvent) => {
      this.handleSdkEvent(event).catch(() => {
        /* swallow */
      });
    });
  }

  private async teardownEventStream(): Promise<void> {
    if (!this.breezListenerId || !this.sdk) return;
    try {
      await this.sdk.removeEventListener(this.breezListenerId);
    } catch {
      // ignore
    }
    this.breezListenerId = undefined;
  }

  private async handleSdkEvent(event: SdkEvent): Promise<void> {
    if (event.type === 'synced') {
      this.emit({ type: 'CONNECTIVITY', online: true });
      await this.emitBalances();
      return;
    }
    if (event.type === 'dataSynced') {
      this.emit({ type: 'CONNECTIVITY', online: true });
      await this.emitBalances();
      return;
    }
    if ('details' in event && event.details) {
      const payment = mapPayment(event.details, this.preferredAsset);
      this.emit({ type: 'PAYMENT_UPDATED', payment });
    }
  }

  private async emitBalances(): Promise<void> {
    try {
      const balances = await this.getBalances();
      this.emit({ type: 'BALANCE_CHANGED', balances });
    } catch {
      // ignore balance fetch errors during events
    }
  }

  private emit(event: PaymentEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch {
        // listeners are userland; ignore errors to avoid breaking others
      }
    }
  }

  private mapStatuses(statuses: PaymentStatus[]): PaymentState[] {
    const results = new Set<PaymentState>();
    for (const status of statuses) {
      switch (status) {
        case 'SUCCEEDED':
          results.add('complete');
          break;
        case 'FAILED':
          results.add('failed');
          break;
        case 'EXPIRED':
          results.add('timedOut');
          break;
        case 'IN_FLIGHT':
        case 'PENDING':
          results.add('pending');
          results.add('waitingFeeAcceptance');
          break;
        case 'CANCELED':
          results.add('failed');
          break;
        default:
          break;
      }
    }
    return [...results];
  }

  private normalizeError(
    error: unknown,
    code: PaymentError['code'],
  ): PaymentError {
    if (error instanceof PaymentError) {
      return error;
    }
    if (error instanceof Error) {
      return new PaymentError(code, error.message, error);
    }
    return new PaymentError(code, 'Unknown Breez payment error', error);
  }
}

export function createBreezePaymentClient(
  options: BreezPaymentClientOptions,
): PaymentClient {
  if (!isBreezNativeModuleLinked()) {
    throw new PaymentError(
      'UNSUPPORTED',
      'Breez payments require a custom native build. Run the app from a dev build or standalone build to enable payments.',
    );
  }
  return new BreezePaymentClientImpl(options);
}
