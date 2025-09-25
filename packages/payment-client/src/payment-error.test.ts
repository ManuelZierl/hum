import { PaymentError } from '@hum/payment-client';

describe('PaymentError', () => {
  it('preserves message and code', () => {
    const err = new PaymentError('NOT_READY', 'client not initialized');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('client not initialized');
    expect(err.code).toBe('NOT_READY');
  });

  it('stores optional details payload', () => {
    const details = { foo: 'bar' };
    const err = new PaymentError('PROVIDER', 'provider failed', details);
    expect(err.details).toBe(details);
  });
});
