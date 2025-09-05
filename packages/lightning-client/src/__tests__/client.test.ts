import { LightningClient } from '../client';
import { MockProvider } from '../mockProvider';
import { LightningError } from '../errors';
import type { Payment } from '../types';

describe('LightningClient with MockProvider', () => {
  let client: LightningClient;
  beforeEach(async () => {
    client = new LightningClient(new MockProvider());
    await client.init();
  });

  test('invoice create/decode/pay flow', async () => {
    const events: Payment[] = [];
    client.subscribePayments((p) => events.push(p));
    const invoice = await client.createInvoice({
      amountSat: 1000,
      memo: 'test',
    });
    const decoded = await client.decodeInvoice(invoice.bolt11);
    expect(decoded.amountSat).toBe(1000);
    await client.payInvoice({ bolt11: invoice.bolt11 });
    expect(events[0].status).toBe('succeeded');
    const payments = await client.listPayments();
    expect(payments).toHaveLength(1);
  });

  test('lnurl pay happy path', async () => {
    const res = await client.lnurlPay({
      lightningAddress: 'test@example.com',
      amountSat: 1,
    });
    expect(res.status).toBe('succeeded');
  });

  test('lnurl pay invalid address', async () => {
    await expect(
      client.lnurlPay({ lightningAddress: 'invalid', amountSat: 1 }),
    ).rejects.toBeInstanceOf(LightningError);
  });

  test('expired invoice cannot be paid', async () => {
    const invoice = await client.createInvoice({ amountSat: 1, expirySec: 0 });
    await expect(
      client.payInvoice({ bolt11: invoice.bolt11 }),
    ).rejects.toBeInstanceOf(LightningError);
  });

  test('max fee exceeded', async () => {
    const invoice = await client.createInvoice({ amountSat: 1000 });
    await expect(
      client.payInvoice({ bolt11: invoice.bolt11, maxFeeSat: 1 }),
    ).rejects.toBeInstanceOf(LightningError);
  });
});
