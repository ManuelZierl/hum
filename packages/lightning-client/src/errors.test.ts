import { normalizeError } from './errors';

describe('normalizeError', () => {
  it('maps insufficient funds', () => {
    expect(normalizeError({ message: 'Insufficient funds' })).toEqual({
      type: 'InsufficientFunds',
    });
  });

  it('maps invoice expired', () => {
    expect(normalizeError({ code: 'invoice_expired' })).toEqual({
      type: 'InvoiceExpired',
    });
  });

  it('maps network error', () => {
    expect(normalizeError({ message: 'Network unreachable' })).toEqual({
      type: 'NetworkError',
    });
  });

  it('maps unknown error', () => {
    const err = { message: 'other' };
    expect(normalizeError(err)).toEqual({ type: 'Unknown', error: err });
  });
});
