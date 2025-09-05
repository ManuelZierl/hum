import { EventEmitter } from 'events';
import type { LightningError } from './errors';

export interface ProviderInfo {
  name: string;
  version: string;
  /** list of optional feature flags supported by the provider */
  features: string[];
}

export interface NodeInfo {
  pubkey: string;
  alias: string;
  network: string;
  uris: string[];
}

export interface Balances {
  onchainConfirmed: number;
  onchainUnconfirmed: number;
  lightningConfirmed: number;
  lightningUnconfirmed: number;
}

export interface Invoice {
  bolt11: string;
  hash: string;
  amountSat: number;
  memo?: string;
  /** unix timestamp in seconds */
  expiry: number;
}

export interface Payment {
  bolt11: string;
  preimage?: string;
  feeSat?: number;
  status: 'succeeded' | 'failed';
}

export interface LnurlMeta {
  description: string;
  minSendable: number;
  maxSendable: number;
  name?: string;
}

export interface ListPaymentsParams {
  direction?: 'in' | 'out';
  limit?: number;
  since?: number; // unix timestamp seconds
}

export type PaymentListener = (payment: Payment) => void;
export type InvoiceListener = (invoice: Invoice) => void;

/** Public API of the LightningClient */
export interface LightningClientApi {
  init(config?: unknown): Promise<void>;
  isReady(): boolean;
  getProviderInfo(): Promise<ProviderInfo>;
  getNodeInfo(): Promise<NodeInfo>;
  getBalances(): Promise<Balances>;
  createInvoice(args: {
    amountSat: number;
    memo?: string;
    expirySec?: number;
  }): Promise<Invoice>;
  decodeInvoice(bolt11: string): Promise<Invoice>;
  payInvoice(args: { bolt11: string; maxFeeSat?: number }): Promise<Payment>;
  listPayments(params?: ListPaymentsParams): Promise<Payment[]>;
  lnurlPay(args: {
    lnurl?: string;
    lightningAddress?: string;
    amountSat: number;
    comment?: string;
  }): Promise<Payment>;
  lnurlFetchMeta(target: string): Promise<LnurlMeta>;
  subscribePayments(cb: PaymentListener): () => void;
  subscribeInvoices(cb: InvoiceListener): () => void;
  events: EventEmitter;
}

export type { LightningError };
