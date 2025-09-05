import { EventEmitter } from 'events';
import {
  Balances,
  Invoice,
  LnurlMeta,
  LightningClientApi,
  NodeInfo,
  Payment,
  ProviderInfo,
  ListPaymentsParams,
  PaymentListener,
  InvoiceListener,
} from './types';
import { normalizeError } from './errors';

/** Provider interface implemented by adapters */
export interface LightningProvider {
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
}

/** Facade client delegating to a provider */
export class LightningClient implements LightningClientApi {
  private ready = false;
  public events = new EventEmitter();

  constructor(private provider: LightningProvider) {}

  async init(config?: unknown): Promise<void> {
    try {
      await this.provider.init(config);
      this.ready = true;
    } catch (e) {
      throw normalizeError(e);
    }
  }

  isReady(): boolean {
    return this.ready && this.provider.isReady();
  }

  async getProviderInfo(): Promise<ProviderInfo> {
    try {
      return await this.provider.getProviderInfo();
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async getNodeInfo(): Promise<NodeInfo> {
    try {
      return await this.provider.getNodeInfo();
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async getBalances(): Promise<Balances> {
    try {
      return await this.provider.getBalances();
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async createInvoice(args: {
    amountSat: number;
    memo?: string;
    expirySec?: number;
  }): Promise<Invoice> {
    try {
      return await this.provider.createInvoice(args);
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async decodeInvoice(bolt11: string): Promise<Invoice> {
    try {
      return await this.provider.decodeInvoice(bolt11);
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async payInvoice(args: {
    bolt11: string;
    maxFeeSat?: number;
  }): Promise<Payment> {
    try {
      const result = await this.provider.payInvoice(args);
      this.events.emit('payment', result);
      return result;
    } catch (e) {
      const err = normalizeError(e);
      this.events.emit('payment', { bolt11: args.bolt11, status: 'failed' });
      throw err;
    }
  }

  async listPayments(params: ListPaymentsParams = {}): Promise<Payment[]> {
    try {
      return await this.provider.listPayments(params);
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async lnurlPay(args: {
    lnurl?: string;
    lightningAddress?: string;
    amountSat: number;
    comment?: string;
  }): Promise<Payment> {
    try {
      return await this.provider.lnurlPay(args);
    } catch (e) {
      throw normalizeError(e);
    }
  }

  async lnurlFetchMeta(target: string): Promise<LnurlMeta> {
    try {
      return await this.provider.lnurlFetchMeta(target);
    } catch (e) {
      throw normalizeError(e);
    }
  }

  subscribePayments(cb: PaymentListener): () => void {
    return this.provider.subscribePayments(cb);
  }

  subscribeInvoices(cb: InvoiceListener): () => void {
    return this.provider.subscribeInvoices(cb);
  }
}

/** Utilities */
export function validateAddress(addr: string): boolean {
  return /.+@.+/.test(addr);
}

export function parseAmount(input: string | number): number {
  if (typeof input === 'number') return Math.floor(input);
  const trimmed = input.trim().toLowerCase();
  const match = /^([0-9]+)([km]?)$/.exec(trimmed);
  if (!match) return NaN;
  const value = Number(match[1]);
  const suffix = match[2];
  if (suffix === 'k') return value * 1000;
  if (suffix === 'm') return value * 1_000_000;
  return value;
}

export function formatAmount(sat: number): string {
  return Intl.NumberFormat('en-US').format(sat);
}
