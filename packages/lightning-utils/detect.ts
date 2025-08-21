export type PaymentStringType = 'bolt11' | 'bolt12' | 'lnurl' | 'lightning';

const BECH32_CHARS = '[02-9ac-hj-np-z]';

const bolt11Regex = new RegExp(`^ln(?!url|o|r|i)[a-z0-9]+1${BECH32_CHARS}+$`, 'i');
const bolt12Regex = new RegExp(`^ln(o|r|i)[a-z0-9]*1${BECH32_CHARS}+$`, 'i');
const lnurlRegex = new RegExp(`^lnurl1${BECH32_CHARS}{10,}$`, 'i');
// Extracted regex pattern strings for consistency
const BOLT11_PATTERN_STR = `ln(?!url|o|r|i)[a-z0-9]+1${BECH32_CHARS}+`;
const BOLT12_PATTERN_STR = `ln(o|r|i)[a-z0-9]*1${BECH32_CHARS}+`;
const LNURL_PATTERN_STR = `lnurl1${BECH32_CHARS}{10,}`;

const bolt11Regex = new RegExp(`^${BOLT11_PATTERN_STR}$`, 'i');
const bolt12Regex = new RegExp(`^${BOLT12_PATTERN_STR}$`, 'i');
const lnurlRegex = new RegExp(`^${LNURL_PATTERN_STR}$`, 'i');
function isBolt11(str: string): boolean {
  return bolt11Regex.test(str);
}

function isBolt12(str: string): boolean {
  return bolt12Regex.test(str);
}

function isLnurl(str: string): boolean {
  return lnurlRegex.test(str);
}

export function normalizeInvoice(str: string): string {
  return str.trim().replace(/^lightning:/i, '').toLowerCase();
}

export function detectPaymentStrings(text: string): { type: PaymentStringType; value: string }[] {
  const results: { type: PaymentStringType; value: string }[] = [];

  // Detect lightning: URIs first
  const lightningPattern = /lightning:([^\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = lightningPattern.exec(text))) {
    const candidate = normalizeInvoice(match[1]);
    if (isBolt11(candidate) || isBolt12(candidate) || isLnurl(candidate)) {
      results.push({ type: 'lightning', value: match[0] });
    }
  }

  // Remove lightning: URIs to avoid duplicate detection
  const sanitized = text.replace(/lightning:\s*[^\s]+/gi, ' ');

  const bolt11Pattern = /\bln(?!url|o|r|i)[a-z0-9]+1[02-9ac-hj-np-z]+\b/gi;
  while ((match = bolt11Pattern.exec(sanitized))) {
    results.push({ type: 'bolt11', value: match[0] });
  }

  const bolt12Pattern = /\bln(o|r|i)[a-z0-9]*1[02-9ac-hj-np-z]+\b/gi;
  while ((match = bolt12Pattern.exec(sanitized))) {
    results.push({ type: 'bolt12', value: match[0] });
  }

  const bolt11Pattern = new RegExp(`\\b${BOLT11_REGEX_STR}\\b`, 'gi');
  while ((match = bolt11Pattern.exec(sanitized))) {
    results.push({ type: 'bolt11', value: match[0] });
  }

  const bolt12Pattern = new RegExp(`\\b${BOLT12_REGEX_STR}\\b`, 'gi');
  while ((match = bolt12Pattern.exec(sanitized))) {
    results.push({ type: 'bolt12', value: match[0] });
  }

  const lnurlPattern = new RegExp(`\\b${LNURL_REGEX_STR}\\b`, 'gi');
  while ((match = lnurlPattern.exec(sanitized))) {
    results.push({ type: 'lnurl', value: match[0] });
  }

  return results;
}
