import { EventEmitter } from 'events';
import type {
  Balance,
  LspInfo,
  LightningClientApi,
  LightningEvent,
} from './types';
import { normalizeError } from './errors';

interface BreezSDK {
  initServices?: () => Promise<void>;
  getLspInfo?: () => Promise<{ setupFee?: number; proportionalFee?: number }>;
  createInvoice?: (args: {
    amount: number;
    description: string;
  }) => Promise<{ bolt11?: string }>;
  payInvoice?: (args: { bolt11: string }) => Promise<void>;
  getBalance?: () => Promise<{ onchain?: number; offchain?: number }>;
}

let sdk: BreezSDK | undefined;

export const events$ = new EventEmitter();

export async function initLightning(): Promise<void> {
  if (!sdk) {
    sdk = (await import('@breeztech/react-native-breez-sdk')) as BreezSDK;
    await sdk.initServices?.();
  }
}

export async function getLspInfo(): Promise<LspInfo> {
  if (!sdk) throw new Error('Lightning not initialized');
  try {
    const info = await sdk.getLspInfo?.();
    return {
      setupFee: info?.setupFee ?? 0,
      proportionalFee: info?.proportionalFee ?? 0,
    };
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function createInvoice(
  amount: number,
  description: string,
): Promise<string> {
  if (!sdk) throw new Error('Lightning not initialized');
  try {
    const inv = await sdk.createInvoice?.({ amount, description });
    return inv?.bolt11 ?? '';
  } catch (e) {
    throw normalizeError(e);
  }
}

export async function payInvoice(invoice: string): Promise<void> {
  if (!sdk) throw new Error('Lightning not initialized');
  try {
    await sdk.payInvoice?.({ bolt11: invoice });
    events$.emit('payment-succeeded', {
      type: 'payment-succeeded',
      invoice,
    } satisfies LightningEvent);
  } catch (e) {
    const err = normalizeError(e);
    events$.emit('payment-failed', {
      type: 'payment-failed',
      invoice,
      error: err,
    } satisfies LightningEvent);
    throw err;
  }
}

export async function getBalance(): Promise<Balance> {
  if (!sdk) throw new Error('Lightning not initialized');
  try {
    const bal = await sdk.getBalance?.();
    return { onChain: bal?.onchain ?? 0, lightning: bal?.offchain ?? 0 };
  } catch (e) {
    throw normalizeError(e);
  }
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

export type {
  LspInfo,
  Balance,
  LightningError,
  LightningEvent,
  LightningClientApi,
} from './types';
export { normalizeError } from './errors';
export default service;
