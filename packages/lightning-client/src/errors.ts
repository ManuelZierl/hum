export type LightningErrorCode =
  | 'CONFIG'
  | 'NETWORK'
  | 'PROVIDER'
  | 'VALIDATION'
  | 'TIMEOUT'
  | 'UNKNOWN';

/** Error thrown by the Lightning client */
export class LightningError extends Error {
  code: LightningErrorCode;
  /** optional original error */
  original?: unknown;

  constructor(code: LightningErrorCode, message: string, original?: unknown) {
    super(message);
    this.code = code;
    this.original = original;
  }
}

/** Convert unknown errors into LightningError */
export function normalizeError(err: unknown): LightningError {
  if (err instanceof LightningError) return err;
  const message = (err as { message?: string })?.message || String(err);
  const msg = message.toLowerCase();
  if (msg.includes('timeout'))
    return new LightningError('TIMEOUT', message, err);
  if (msg.includes('network'))
    return new LightningError('NETWORK', message, err);
  if (msg.includes('config')) return new LightningError('CONFIG', message, err);
  if (msg.includes('invalid') || msg.includes('expire'))
    return new LightningError('VALIDATION', message, err);
  return new LightningError('UNKNOWN', message, err);
}
