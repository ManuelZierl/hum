/**
 * Types of payment strings that can be detected.
 */
export type PaymentStringType = 'bolt11' | 'bolt12' | 'lnurl' | 'lightning';

/**
 * Result of detecting a payment string in a piece of text.
 */
export interface PaymentString {
  type: PaymentStringType;
  value: string;
}

// Character class for Bech32 encodings used by Lightning payment strings.
const BECH32_CHARS = '[02-9ac-hj-np-z]';

// Base patterns without anchors. These are reused for validation and extraction.
const BOLT11_PATTERN = `ln(?!url|o|r|i)[a-z0-9]+1${BECH32_CHARS}+`;
const BOLT12_PATTERN = `ln(?:o|r|i)[a-z0-9]*1${BECH32_CHARS}+`;
const LNURL_PATTERN = `lnurl1${BECH32_CHARS}{10,}`;

// Compiled regexes for strict validation of individual strings.
const bolt11Regex = new RegExp(`^${BOLT11_PATTERN}$`, 'i');
const bolt12Regex = new RegExp(`^${BOLT12_PATTERN}$`, 'i');
const lnurlRegex = new RegExp(`^${LNURL_PATTERN}$`, 'i');

function isBolt11(str: string): boolean {
  return bolt11Regex.test(str);
}

function isBolt12(str: string): boolean {
  return bolt12Regex.test(str);
}

function isLnurl(str: string): boolean {
  return lnurlRegex.test(str);
}

/**
 * Normalise a lightning invoice by removing any `lightning:` prefix,
 * trimming surrounding whitespace and lowercasing the result.
 */
export function normalizeInvoice(str: string): string {
  return str
    .trim()
    .replace(/^lightning:/i, '')
    .toLowerCase();
}

/**
 * Detect Lightning payment strings in arbitrary text.
 *
 * Matches bare BOLT11, BOLT12 and LNURL strings as well as `lightning:` URIs.
 * Returns an array describing each match with its detected type and original
 * value as it appeared in the text.
 */
export function detectPaymentStrings(text: string): PaymentString[] {
  const results: PaymentString[] = [];

  // Detect `lightning:` URIs first.
  const lightningPattern = /lightning:([^\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = lightningPattern.exec(text))) {
    const candidate = normalizeInvoice(match[1]);
    if (isBolt11(candidate) || isBolt12(candidate) || isLnurl(candidate)) {
      results.push({ type: 'lightning', value: match[0] });
    }
  }

  // Remove `lightning:` URIs to avoid duplicate detection in later regexes.
  const sanitized = text.replace(/lightning:\s*[^\s]+/gi, ' ');

  // Detect bare payment strings.
  const bolt11Pattern = new RegExp(`\\b${BOLT11_PATTERN}\\b`, 'gi');
  while ((match = bolt11Pattern.exec(sanitized))) {
    results.push({ type: 'bolt11', value: match[0] });
  }

  const bolt12Pattern = new RegExp(`\\b${BOLT12_PATTERN}\\b`, 'gi');
  while ((match = bolt12Pattern.exec(sanitized))) {
    results.push({ type: 'bolt12', value: match[0] });
  }

  const lnurlPattern = new RegExp(`\\b${LNURL_PATTERN}\\b`, 'gi');
  while ((match = lnurlPattern.exec(sanitized))) {
    results.push({ type: 'lnurl', value: match[0] });
  }

  return results;
}
