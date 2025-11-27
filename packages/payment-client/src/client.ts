import {
  Amount,
  AssetCode,
  Balance,
  Capability,
  FeeEstimate,
  Invoice,
  Network,
  Payment,
  PaymentDirection,
  PaymentEvent,
  PaymentStatus,
} from './types';

// packages/@hum/payments/src/client.ts
export interface PaymentClient {
  /** Initialize and hydrate; idempotent. */
  init(opts: {
    network: Network;
    preferredAsset?: AssetCode; // default "L-BTC"
    logger?: (
      lvl: 'debug' | 'info' | 'warn' | 'error',
      msg: string,
      meta?: unknown,
    ) => void;
    storage?: {
      get(k: string): Promise<string | undefined>;
      set(k: string, v: string): Promise<void>;
    };
  }): Promise<void>;

  destroy(): Promise<void>;
  isReady(): boolean;

  /** What can this provider do? e.g., Breez Liquid supports LN + Liquid on-chain. */
  capabilities(): Set<Capability>;
  network(): Network;

  // Balances & info
  getBalances(): Promise<Balance[]>;
  getNodeInfo(): Promise<{ pubkey?: string; alias?: string; urls?: string[] }>;

  // Invoices
  createInvoice(req: {
    amount?: Amount;
    description?: string;
    expirySecs?: number;
  }): Promise<Invoice>;
  decodeInvoice(bolt11: string): Promise<Invoice>;
  payInvoice(req: {
    invoice: string; // bolt11 or lnurl
    amountOverride?: Amount; // for zero-amount invoices
    comment?: string;
    feeLimitPercent?: number;
  }): Promise<Payment>;

  // Keysend (optional)
  keysend?(req: {
    pubkey: string;
    amount: Amount;
    tlvRecords?: Record<number, string>;
  }): Promise<Payment>;

  // On-chain (Liquid)
  getDepositAddress?(
    asset?: AssetCode,
  ): Promise<{ address: string; asset: AssetCode }>;
  withdrawOnchain?(req: {
    address: string;
    amount: Amount;
    feeRateSatVb?: number;
  }): Promise<{ txid: string }>;
  estimateFees?(
    kind: 'withdraw' | 'swapout',
    amount: Amount,
  ): Promise<FeeEstimate>;

  // Swaps (if needed)
  swapIn?(req: {
    address?: string;
    amount?: Amount;
  }): Promise<{ address: string }>;
  swapOut?(req: { invoice: string }): Promise<{ txid?: string }>;

  // History
  listPayments(filter?: {
    direction?: PaymentDirection;
    status?: PaymentStatus[];
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Payment[]; nextCursor?: string }>;

  // Events
  on(listener: (ev: PaymentEvent) => void): () => void; // returns unsubscribe
}
