import { EventEmitter } from 'events';

export interface LspInfo {
  setupFee: number;
  proportionalFee: number;
}

export interface Balance {
  onChain: number;
  lightning: number;
}

export type LightningError =
  | { type: 'InsufficientFunds' }
  | { type: 'InvoiceExpired' }
  | { type: 'NetworkError' }
  | { type: 'Unknown'; error: unknown };

export type LightningEvent =
  | { type: 'channel-opened' }
  | { type: 'payment-succeeded'; invoice: string }
  | { type: 'payment-failed'; invoice: string; error: LightningError };

export interface LightningClientApi {
  initLightning: () => Promise<void>;
  getLspInfo: () => Promise<LspInfo>;
  createInvoice: (amount: number, description: string) => Promise<string>;
  payInvoice: (invoice: string) => Promise<void>;
  getBalance: () => Promise<Balance>;
  events$: EventEmitter;
}
