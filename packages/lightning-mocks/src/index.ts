import {
  LightningClient,
  MockProvider,
  validateAddress,
  parseAmount,
  formatAmount,
} from '@hum/lightning-client';

// single client instance for consumers
const client = new LightningClient(new MockProvider());

export const events = client.events;

export async function init(config?: unknown): Promise<void> {
  await client.init(config);
}

export function isReady(): boolean {
  return client.isReady();
}

export const getProviderInfo = () => client.getProviderInfo();
export const getNodeInfo = () => client.getNodeInfo();
export const getBalances = () => client.getBalances();
export const createInvoice = client.createInvoice.bind(client);
export const decodeInvoice = client.decodeInvoice.bind(client);
export const payInvoice = client.payInvoice.bind(client);
export const listPayments = client.listPayments.bind(client);
export const lnurlPay = client.lnurlPay.bind(client);
export const lnurlFetchMeta = client.lnurlFetchMeta.bind(client);
export const subscribePayments = client.subscribePayments.bind(client);
export const subscribeInvoices = client.subscribeInvoices.bind(client);

export { validateAddress, parseAmount, formatAmount };

export default client;
