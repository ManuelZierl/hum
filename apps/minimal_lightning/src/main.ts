import { LightningClient, MockProvider } from '@hum/lightning-client';

const client = new LightningClient(new MockProvider());
const log = document.getElementById('log')!;

function append(message: string) {
  log.textContent += message + '\n';
}

document.getElementById('init')!.addEventListener('click', async () => {
  await client.init();
  append('client initialized');
  client.subscribePayments((p) => append('payment: ' + JSON.stringify(p)));
  client.subscribeInvoices((i) => append('invoice: ' + JSON.stringify(i)));
});

document.getElementById('info')!.addEventListener('click', async () => {
  const info = await client.getNodeInfo();
  append('node: ' + JSON.stringify(info));
  const bal = await client.getBalances();
  append('balances: ' + JSON.stringify(bal));
});

let lastInvoice: string | undefined;
document.getElementById('invoice')!.addEventListener('click', async () => {
  const inv = await client.createInvoice({ amountSat: 100, memo: 'demo' });
  lastInvoice = inv.bolt11;
  append('invoice: ' + inv.bolt11);
});

document.getElementById('pay')!.addEventListener('click', async () => {
  if (!lastInvoice) return;
  await client.payInvoice({ bolt11: lastInvoice });
  append('paid invoice');
});

document.getElementById('lnurl')!.addEventListener('click', async () => {
  const res = await client.lnurlPay({
    lightningAddress: 'test@example.com',
    amountSat: 1,
  });
  append('lnurl pay: ' + JSON.stringify(res));
});
