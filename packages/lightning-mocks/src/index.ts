import { EventEmitter } from 'events';
import type {
  Balance,
  LspInfo,
  LightningClientApi,
} from '@hum/lightning-client';

export const events$ = new EventEmitter();

export async function initLightning(): Promise<void> {
  // no-op for mocks
}

export async function getLspInfo(): Promise<LspInfo> {
  return { setupFee: 1000, proportionalFee: 0.01 };
}

export async function createInvoice(
  amount: number,
  description: string,
): Promise<string> {
  return `lnmock_${amount}_${description}`;
}

export async function payInvoice(invoice: string): Promise<void> {
  events$.emit('payment-succeeded', { type: 'payment-succeeded', invoice });
}

export async function getBalance(): Promise<Balance> {
  return { onChain: 1234, lightning: 5678 };
}

const service: LightningClientApi = {
  initLightning,
  getLspInfo,
  createInvoice,
  payInvoice,
  getBalance,
  events$,
};

export function useLightning(): LightningClientApi {
  return service;
}

export type { LightningError, LightningEvent } from '@hum/lightning-client';
export default service;
