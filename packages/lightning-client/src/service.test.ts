jest.mock(
  '@breeztech/react-native-breez-sdk',
  () => ({
    initServices: jest.fn().mockResolvedValue(undefined),
    getLspInfo: jest
      .fn()
      .mockResolvedValue({ setupFee: 1, proportionalFee: 0.1 }),
    createInvoice: jest.fn().mockResolvedValue({ bolt11: 'bolt123' }),
    payInvoice: jest.fn().mockResolvedValue({}),
    getBalance: jest.fn().mockResolvedValue({ onchain: 2, offchain: 3 }),
  }),
  { virtual: true },
);

import {
  initLightning,
  getLspInfo,
  createInvoice,
  payInvoice,
  getBalance,
  events$,
} from './index';

describe('lightning-client service', () => {
  beforeEach(() => {
    events$.removeAllListeners();
  });

  it('initializes breez sdk', async () => {
    await initLightning();
    const sdk = await import('@breeztech/react-native-breez-sdk');
    expect(sdk.initServices).toHaveBeenCalled();
  });

  it('creates invoice and pays', async () => {
    await initLightning();
    const invoice = await createInvoice(10, 'test');
    expect(invoice).toBe('bolt123');

    const handler = jest.fn();
    events$.once('payment-succeeded', handler);
    await payInvoice(invoice);
    expect(handler).toHaveBeenCalledWith({
      type: 'payment-succeeded',
      invoice,
    });
  });

  it('gets lsp info and balance', async () => {
    await initLightning();
    const info = await getLspInfo();
    expect(info).toEqual({ setupFee: 1, proportionalFee: 0.1 });
    const balance = await getBalance();
    expect(balance).toEqual({ onChain: 2, lightning: 3 });
  });
});
