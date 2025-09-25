// packages/@hum/payments/src/types.ts
export type Network = 'mainnet' | 'testnet' | 'regtest';
export type AssetCode = 'L-BTC' | 'BTC' | 'USDT-LQ' | string;

export type PaymentRail = 'lightning' | 'onchain';
export type Capability =
  | 'PAY_INVOICE' // pay BOLT11 / LNURL-pay
  | 'CREATE_INVOICE' // BOLT11 / LNURL-withdraw
  | 'DECODE_INVOICE'
  | 'KEYSEND'
  | 'ONCHAIN_DEPOSIT'
  | 'ONCHAIN_WITHDRAW'
  | 'SWAP_IN'
  | 'SWAP_OUT'
  | 'LIST_PAYMENTS'
  | 'FEE_ESTIMATE'
  | 'ROUTING_INFO'
  | 'EXPORT_BACKUP'
  | 'IMPORT_BACKUP';

export type Amount = { sats: bigint; asset: AssetCode };
export type FiatAmount = { currency: string; minor: number };

export type Balance = {
  asset: AssetCode;
  spendable: bigint; // sats/asset base units
  pending: bigint;
};

export type Invoice = {
  id: string; // provider id/bolt11 hash
  bolt11?: string;
  description?: string;
  amount?: Amount | null; // null = user chooses (zero-amount invoice)
  expiresAt?: number; // epoch seconds
  metadata?: Record<string, unknown>;
};

export type PaymentStatus =
  | 'PENDING'
  | 'IN_FLIGHT'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELED';

export type PaymentDirection = 'INBOUND' | 'OUTBOUND';

export type Payment = {
  id: string;
  direction: PaymentDirection;
  rail: PaymentRail;
  asset: AssetCode;
  amount: Amount; // sent/received
  fee?: Amount;
  description?: string;
  counterparty?: string; // node pubkey / address
  createdAt: number; // epoch seconds
  updatedAt: number;
  status: PaymentStatus;
  raw?: unknown; // provider-specific payload
};

export type FeeEstimate = {
  fast: bigint;
  normal: bigint;
  slow: bigint;
  asset: AssetCode;
};

export type PaymentEvent =
  | { type: 'READY_CHANGED'; ready: boolean }
  | { type: 'BALANCE_CHANGED'; balances: Balance[] }
  | { type: 'PAYMENT_UPDATED'; payment: Payment }
  | { type: 'CONNECTIVITY'; online: boolean }
  | { type: 'ERROR'; error: PaymentError };

export class PaymentError extends Error {
  code:
    | 'INIT_FAILED'
    | 'NOT_READY'
    | 'UNSUPPORTED'
    | 'INVALID_INVOICE'
    | 'INSUFFICIENT_FUNDS'
    | 'ROUTE_NOT_FOUND'
    | 'TIMEOUT'
    | 'NETWORK'
    | 'PROVIDER'
    | 'CANCELED'
    | 'UNKNOWN';
  details?: unknown;
  constructor(code: PaymentError['code'], message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
