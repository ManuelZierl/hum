import { EventEmitter } from 'events';
import {
  Balances,
  Invoice,
  LightningClientApi,
  NodeInfo,
  Payment,
  ProviderInfo,
  LnurlMeta,
  ListPaymentsParams,
  PaymentListener,
  InvoiceListener,
} from './types';
import { LightningError } from './errors';
import { LightningClient } from './client';

/** In-memory mock provider used for tests and the demo app */
export class MockProvider {
  private ready = false;
  private invoices: Invoice[] = [];
  private payments: Payment[] = [];
  private emitter = new EventEmitter();

  async init(): Promise<void> {
    this.ready = true;
  }

  isReady(): boolean {
    return this.ready;
  }

  async getProviderInfo(): Promise<ProviderInfo> {
    return {
      name: 'mock',
      version: '0.1.0',
      features: ['invoices', 'payments'],
    };
  }

  async getNodeInfo(): Promise<NodeInfo> {
    return {
      pubkey: '00'.repeat(33),
      alias: 'mock-node',
      network: 'regtest',
      uris: [],
    };
  }

  async getBalances(): Promise<Balances> {
    return {
      onchainConfirmed: 1000,
      onchainUnconfirmed: 0,
      lightningConfirmed: 5000,
      lightningUnconfirmed: 0,
    };
  }

  async createInvoice({
    amountSat,
    memo,
    expirySec = 3600,
  }: {
    amountSat: number;
    memo?: string;
    expirySec?: number;
  }): Promise<Invoice> {
    const hash = Math.random().toString(16).slice(2, 10).padEnd(8, '0');
    const expiry = Math.floor(Date.now() / 1000) + expirySec;
    const bolt11 = `lnmock-${amountSat}-${hash}-${expiry}`;
    const invoice: Invoice = { bolt11, hash, amountSat, memo, expiry };
    this.invoices.push(invoice);
    this.emitter.emit('invoice', invoice);
    return invoice;
  }

  async decodeInvoice(bolt11: string): Promise<Invoice> {
    const parts = bolt11.split('-');
    if (parts.length < 4)
      throw new LightningError('VALIDATION', 'invalid invoice');
    const [, amountStr, hash, expiryStr] = parts;
    return {
      bolt11,
      amountSat: Number(amountStr),
      hash,
      expiry: Number(expiryStr),
    };
  }

  async payInvoice({
    bolt11,
    maxFeeSat,
  }: {
    bolt11: string;
    maxFeeSat?: number;
  }): Promise<Payment> {
    const invoice = this.invoices.find((i) => i.bolt11 === bolt11);
    if (!invoice) throw new LightningError('VALIDATION', 'unknown invoice');
    if (invoice.expiry <= Math.floor(Date.now() / 1000)) {
      throw new LightningError('VALIDATION', 'invoice expired');
    }
    const fee = Math.ceil(invoice.amountSat * 0.01);
    if (typeof maxFeeSat === 'number' && fee > maxFeeSat)
      throw new LightningError('VALIDATION', 'max fee exceeded');
    const payment: Payment = {
      bolt11,
      preimage: invoice.hash,
      feeSat: fee,
      status: 'succeeded',
    };
    this.payments.push(payment);
    this.emitter.emit('payment', payment);
    return payment;
  }

  async listPayments(params: ListPaymentsParams = {}): Promise<Payment[]> {
    void params;
    return [...this.payments];
  }

  async lnurlPay({
    lightningAddress,
    amountSat,
  }: {
    lightningAddress?: string;
    lnurl?: string;
    amountSat: number;
  }): Promise<Payment> {
    if (lightningAddress && !lightningAddress.includes('@'))
      throw new LightningError('VALIDATION', 'invalid lightning address');
    return {
      bolt11: `lnurl-${amountSat}`,
      feeSat: 0,
      status: 'succeeded',
    };
  }

  async lnurlFetchMeta(target: string): Promise<LnurlMeta> {
    void target;
    return {
      description: 'mock lnurl',
      minSendable: 1,
      maxSendable: 1000,
      name: 'mock',
    };
  }

  subscribePayments(cb: PaymentListener): () => void {
    this.emitter.on('payment', cb);
    return () => this.emitter.off('payment', cb);
  }

  subscribeInvoices(cb: InvoiceListener): () => void {
    this.emitter.on('invoice', cb);
    return () => this.emitter.off('invoice', cb);
  }
}

export function createMockClient(): LightningClientApi {
  const provider = new MockProvider();
  const client = new LightningClient(provider);
  return client;
}
