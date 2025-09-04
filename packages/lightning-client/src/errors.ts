import type { LightningError } from './types';

export function normalizeError(err: unknown): LightningError {
  const error = err as { message?: string; code?: string } | undefined;
  const msg = String(error?.message || error?.code || '').toLowerCase();
  if (msg.includes('insufficient')) {
    return { type: 'InsufficientFunds' };
  }
  if (msg.includes('expire')) {
    return { type: 'InvoiceExpired' };
  }
  if (msg.includes('network')) {
    return { type: 'NetworkError' };
  }
  return { type: 'Unknown', error: err };
}
