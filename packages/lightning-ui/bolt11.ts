// Minimal BOLT11 invoice utilities without external dependencies.
import { normalizeInvoice } from './detect';

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const CHARSET_REV: Record<string, number> = CHARSET.split('').reduce(
  (acc, c, i) => ({ ...acc, [c]: i }),
  {} as Record<string, number>,
);

function polymod(values: number[]): number {
  const GENERATORS = [
    0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3,
  ];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GENERATORS[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod([...hrpExpand(hrp), ...data]) === 1;
}

function createChecksum(hrp: string, data: number[]): number[] {
  const values = [...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const mod = polymod(values) ^ 1;
  const ret: number[] = [];
  for (let p = 0; p < 6; p++) {
    ret.push((mod >> (5 * (5 - p))) & 31);
  }
  return ret;
}

function bech32Decode(str: string): { hrp: string; words: number[] } {
  const pos = str.lastIndexOf('1');
  if (pos < 1) throw new Error('invalid bech32');
  const hrp = str.slice(0, pos);
  const data = str
    .slice(pos + 1)
    .toLowerCase()
    .split('')
    .map((c) => {
      const v = CHARSET_REV[c];
      if (v === undefined) throw new Error('invalid bech32 char');
      return v;
    });
  if (!verifyChecksum(hrp, data)) throw new Error('invalid checksum');
  return { hrp, words: data.slice(0, -6) };
}

function bech32Encode(hrp: string, words: number[]): string {
  const combined = [...words, ...createChecksum(hrp, words)];
  let out = `${hrp}1`;
  for (const w of combined) out += CHARSET[w];
  return out;
}

function convertBits(
  data: number[],
  from: number,
  to: number,
  pad: boolean,
): number[] {
  let acc = 0;
  let bits = 0;
  const maxv = (1 << to) - 1;
  const ret: number[] = [];
  for (const value of data) {
    if (value < 0 || value >> from) return [];
    acc = (acc << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad && bits) {
    ret.push((acc << (to - bits)) & maxv);
  } else if (!pad && (bits >= from || (acc << (to - bits)) & maxv)) {
    return [];
  }
  return ret;
}

function bytesToUtf8(bytes: number[]): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(new Uint8Array(bytes));
  }
  return String.fromCharCode(...bytes);
}

function utf8ToBytes(str: string): number[] {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(str));
  }
  return str.split('').map((c) => c.charCodeAt(0));
}

function parseAmount(amount: string | undefined): number | undefined {
  if (!amount) return undefined;
  const unit = amount.match(/[munp]$/i)?.[0];
  const num = Number(unit ? amount.slice(0, -1) : amount);
  if (!Number.isFinite(num)) return undefined;
  switch (unit) {
    case 'm':
      return num * 1e8;
    case 'u':
      return num * 1e5;
    case 'n':
      return num * 1e2;
    case 'p':
      return num / 10;
    default:
      return num * 1e11;
  }
}

function encodeAmount(msat: number): string {
  if (msat % 1e11 === 0) return `${msat / 1e11}`;
  if (msat % 1e8 === 0) return `${msat / 1e8}m`;
  if (msat % 1e5 === 0) return `${msat / 1e5}u`;
  if (msat % 1e2 === 0) return `${msat / 1e2}n`;
  return `${Math.round(msat * 10)}p`;
}

export interface ParsedBolt11 {
  amountSat?: number;
  memo?: string;
}

export function parseBolt11(invoice: string): ParsedBolt11 {
  try {
    const normalized = normalizeInvoice(invoice);
    const match = normalized.match(/^ln([a-z]{2,})(\d*[munp]?)1/);
    if (!match) return {};
    const amountMsat = parseAmount(match[2]);
    const { words } = bech32Decode(normalized);
    let memo: string | undefined;
    let idx = 7; // skip timestamp
    while (idx < words.length - 104) {
      const tag = words[idx];
      const len = (words[idx + 1] << 5) | words[idx + 2];
      idx += 3;
      const data = words.slice(idx, idx + len);
      idx += len;
      if (tag === 13) {
        const bytes = convertBits(data, 5, 8, false);
        memo = bytesToUtf8(bytes);
      }
    }
    return {
      amountSat: amountMsat ? Math.floor(amountMsat / 1000) : undefined,
      memo,
    };
  } catch {
    return {};
  }
}

export function createMockBolt11(amountSat: number, memo: string): string {
  const amountMsat = amountSat * 1000;
  const hrp = `lnbc${encodeAmount(amountMsat)}`;
  const words: number[] = [];
  // timestamp (7 words)
  words.push(0, 0, 0, 0, 0, 0, 0);
  // description tag
  const desc = convertBits(utf8ToBytes(memo), 8, 5, true);
  words.push(13, (desc.length >> 5) & 31, desc.length & 31, ...desc);
  // payment hash tag with zeros
  const ph = convertBits(new Array(32).fill(0), 8, 5, true);
  words.push(1, (ph.length >> 5) & 31, ph.length & 31, ...ph);
  // signature placeholder
  words.push(...new Array(104).fill(0));
  return bech32Encode(hrp, words);
}

export default parseBolt11;
