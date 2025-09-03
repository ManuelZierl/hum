import {
  initLightning,
  getLspInfo,
  createInvoice,
  payInvoice,
  getBalance,
  events$,
} from './index';

describe('lightning-mocks', () => {
  beforeEach(() => {
    events$.removeAllListeners();
  });

  it('provides deterministic responses', async () => {
    await initLightning();
    expect(await getLspInfo()).toEqual({
      setupFee: 1000,
      proportionalFee: 0.01,
    });
    const invoice = await createInvoice(5, 'test');
    expect(invoice).toBe('lnmock_5_test');

    const handler = jest.fn();
    events$.once('payment-succeeded', handler);
    await payInvoice(invoice);
    expect(handler).toHaveBeenCalledWith({
      type: 'payment-succeeded',
      invoice,
    });

    expect(await getBalance()).toEqual({ onChain: 1234, lightning: 5678 });
  });
});
