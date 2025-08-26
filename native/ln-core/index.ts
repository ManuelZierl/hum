import {
  EventEmitter,
  Subscription,
  requireNativeModule,
} from 'expo-modules-core';

export type LnInitOptions = {
  dataDir?: string;
  network?: 'mainnet' | 'testnet' | 'signet';
};
export type LnInvoice = { bolt11: string; amountSats?: number; memo?: string };
export type Payment = {
  id: string;
  bolt11: string;
  status: 'pending' | 'succeeded' | 'failed';
  amountSats: number;
  timestamp: number;
};
export type PaymentUpdatedEvent = {
  id: string;
  status: 'pending' | 'succeeded' | 'failed';
};

export interface LnCore {
  init(opts: LnInitOptions): Promise<{ ok: true }>;
  isReady(): Promise<boolean>;
  nodeInfo(): Promise<{ pubkey: string; alias: string; connected: boolean }>;
  createInvoice(params: {
    amountSats: number;
    memo?: string;
  }): Promise<LnInvoice>;
  payInvoice(bolt11: string): Promise<{ preimage: string; feesSats: number }>;
  estimateFees(bolt11: string): Promise<{ maxFeesSats: number }>;
  listPayments(): Promise<Payment[]>;
}

const LnCoreModule = requireNativeModule<LnCore>('LnCore');
const emitter = new EventEmitter(LnCoreModule);

export function addPaymentUpdatedListener(
  listener: (event: PaymentUpdatedEvent) => void,
): Subscription {
  return emitter.addListener('PaymentUpdated', listener);
}

export const LnCore = {
  init: (opts: LnInitOptions) => LnCoreModule.init(opts),
  isReady: () => LnCoreModule.isReady(),
  nodeInfo: () => LnCoreModule.nodeInfo(),
  createInvoice: (params: { amountSats: number; memo?: string }) =>
    LnCoreModule.createInvoice(params),
  payInvoice: (bolt11: string) => LnCoreModule.payInvoice(bolt11),
  estimateFees: (bolt11: string) => LnCoreModule.estimateFees(bolt11),
  listPayments: () => LnCoreModule.listPayments(),
  addPaymentUpdatedListener,
};

export default LnCore;
