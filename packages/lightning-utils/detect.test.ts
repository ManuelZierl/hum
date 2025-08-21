import { detectPaymentStrings, normalizeInvoice } from './detect';

describe('detectPaymentStrings positives', () => {
  const positives = [
    { text: 'pay lnbc1p0pppppppp now', types: ['bolt11'] },
    { text: 'uppercase LNBC1P0PPPPPPPP works', types: ['bolt11'] },
    { text: 'offer lno1p0pppppppp available', types: ['bolt12'] },
    { text: 'invoice request lnr1p0pppppppp', types: ['bolt12'] },
    { text: 'invoice lni1p0pppppppp', types: ['bolt12'] },
    { text: 'scan lnurl1dp68gurn8ghj7mrww4exctnvd3skw', types: ['lnurl'] },
    { text: 'uppercase LNURL1DP68GURN8GHJ7MRWW4EXCTNVD3SKW', types: ['lnurl'] },
    { text: 'use lightning:lnbc1p0pppppppp', types: ['lightning'] },
    { text: 'lightning:LNURL1DP68GURN8GHJ7MRWW4EXCTNVD3SKW', types: ['lightning'] },
    { text: 'two invoices lnbc1p0pppppppp and lntb1p0pppppppp', types: ['bolt11', 'bolt11'] }
  ];

  test.each(positives)('%#', ({ text, types }) => {
    expect(detectPaymentStrings(text).map(r => r.type)).toEqual(types);
  });
});

describe('detectPaymentStrings negatives', () => {
  const negatives = [
    'lnbc',
    'lightning:invalid',
    'hello world',
    'lnurl',
    'lno1p0pppppppo',
    'lightning: lnbc1p0pppppppp',
    'bitcoin:bc1abc',
    'LNURL1DP68GU RN8GHJ7MRWW4EXCTNVD3SKW',
    'lightning:lnbc',
    'just text'
  ];

  test.each(negatives)('%#', text => {
    expect(detectPaymentStrings(text)).toHaveLength(0);
  });
});

describe('normalizeInvoice', () => {
  test('removes lightning prefix', () => {
    expect(normalizeInvoice('lightning:LNBC1P0PPPPPPPP')).toBe('lnbc1p0pppppppp');
  });

  test('trims and lowercases', () => {
    expect(normalizeInvoice('  LNBC1P0PPPPPPPP  ')).toBe('lnbc1p0pppppppp');
  });

  test('handles lnurl', () => {
    expect(normalizeInvoice('LIGHTNING:lnurl1DP68GURN8GHJ7MRWW4EXCTNVD3SKW')).toBe(
      'lnurl1dp68gurn8ghj7mrww4exctnvd3skw'
    );
  });
});
