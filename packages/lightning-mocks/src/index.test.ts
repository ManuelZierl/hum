import {
  init,
  getProviderInfo,
  createInvoice,
  payInvoice,
  getBalances,
  events,
} from './index';

describe('lightning-mocks', () => {
  beforeEach(() => {
    events.removeAllListeners();
  });

  it('provides deterministic responses', async () => {
    await init();
    const info = await getProviderInfo();
    expect(info.name).toBe('mock');

    const invoice = await createInvoice({ amountSat: 5, memo: 'test' });

    const handler = jest.fn();
    events.once('payment', handler);
    await payInvoice({ bolt11: invoice.bolt11 });
    expect(handler).toHaveBeenCalled();

    const balance = await getBalances();
    expect(balance.lightningConfirmed).toBeGreaterThan(0);
  });
});
