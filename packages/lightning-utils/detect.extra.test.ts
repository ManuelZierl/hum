import { detectPaymentStrings, normalizeInvoice } from '.';

describe('detectPaymentStrings additional cases', () => {
  test('returns original value for lightning URIs', () => {
    const text = 'send to Lightning:LNBC1P0PPPPPPPP asap';
    expect(detectPaymentStrings(text)).toEqual([
      { type: 'lightning', value: 'Lightning:LNBC1P0PPPPPPPP' },
    ]);
  });

  test('deduplicates lightning URIs from bare detection', () => {
    const text = 'lightning:lnbc1p0pppppppp and lnbc1p0pppppppp';
    expect(detectPaymentStrings(text)).toEqual([
      { type: 'lightning', value: 'lightning:lnbc1p0pppppppp' },
      { type: 'bolt11', value: 'lnbc1p0pppppppp' },
    ]);
  });

  test('handles punctuation boundaries', () => {
    const text = 'Pay lnbc1p0pppppppp, then use lno1p0pppppppp.';
    expect(detectPaymentStrings(text)).toEqual([
      { type: 'bolt11', value: 'lnbc1p0pppppppp' },
      { type: 'bolt12', value: 'lno1p0pppppppp' },
    ]);
  });

  test('detects lightning URIs with bolt12 invoice', () => {
    const text = 'lightning:LNO1P0PPPPPPPP for sale';
    expect(detectPaymentStrings(text)).toEqual([
      { type: 'lightning', value: 'lightning:LNO1P0PPPPPPPP' },
    ]);
  });
});

describe('normalizeInvoice additional cases', () => {
  test('trims tabs and newlines', () => {
    expect(normalizeInvoice('\n\tLNBC1P0PPPPPPPP\t')).toBe('lnbc1p0pppppppp');
  });
});
