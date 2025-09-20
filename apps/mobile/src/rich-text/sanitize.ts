const UNSAFE_CONTENT_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
] as const;

const VOID_TAGS = new Set(['br']);

const ALLOWED_TAGS = new Set([
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'a',
  'p',
  'br',
]);

const ALLOWED_ATTRS: Record<string, readonly string[]> = {
  a: ['href', 'title'],
};

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'matrix:'];

const COMMENT_PATTERN = /<!--([\s\S]*?)-->/g;
const UNSAFE_CONTENT_PATTERN = new RegExp(
  `<\\s*(?:${UNSAFE_CONTENT_TAGS.join('|')})[^>]*>[\\s\\S]*?<\\s*/\\s*(?:${UNSAFE_CONTENT_TAGS.join('|')})\\s*>`,
  'gi',
);
const UNSAFE_SELF_CLOSING_PATTERN = new RegExp(
  `<\\s*(?:${UNSAFE_CONTENT_TAGS.join('|')})[^>]*?/?>`,
  'gi',
);

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('/')) return true;
  const colonIndex = trimmed.indexOf(':');
  if (colonIndex === -1) return true;
  const protocol = trimmed.slice(0, colonIndex + 1).toLowerCase();
  return SAFE_PROTOCOLS.includes(protocol);
}

function sanitizeAttributes(tag: string, rawAttrs: string | undefined): string {
  if (!rawAttrs) return '';
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed || allowed.length === 0) return '';
  const attrRegex =
    /([a-zA-Z0-9:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let result = '';
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawAttrs))) {
    const name = match[1].toLowerCase();
    if (!allowed.includes(name)) continue;
    if (name.startsWith('on')) continue;
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    if (name === 'href' && !isSafeUrl(value)) continue;
    result += ` ${name}="${escapeAttribute(value)}"`;
  }
  return result;
}

export function sanitizeRichTextHtml(input: string): string {
  if (!input) return '';
  let sanitized = input
    .replace(COMMENT_PATTERN, '')
    .replace(UNSAFE_CONTENT_PATTERN, '')
    .replace(UNSAFE_SELF_CLOSING_PATTERN, '')
    .replace(/<![\s\S]*?>/g, '')
    .replace(/<\?(?:[\s\S]*?)\?>/g, '');

  sanitized = sanitized.replace(
    /<([a-zA-Z0-9]+)([^>]*)>/g,
    (match, tag: string, attrs: string) => {
      const lowerTag = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(lowerTag)) return '';
      const sanitizedAttrs = sanitizeAttributes(lowerTag, attrs);
      if (VOID_TAGS.has(lowerTag)) {
        return `<${lowerTag}${sanitizedAttrs} />`;
      }
      return `<${lowerTag}${sanitizedAttrs}>`;
    },
  );

  sanitized = sanitized.replace(
    /<\/(\s*[a-zA-Z0-9]+)\s*>/g,
    (match, tag: string) => {
      const lowerTag = tag.trim().toLowerCase();
      if (!ALLOWED_TAGS.has(lowerTag) || VOID_TAGS.has(lowerTag)) return '';
      return `</${lowerTag}>`;
    },
  );

  return sanitized;
}

export function stripHtmlTags(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]+>/g, '');
}

export type SanitizedPayload = {
  sanitizedHtml: string;
  plainText: string;
};

export function sanitizeRichContent(
  html: string,
  text?: string,
): SanitizedPayload {
  const sanitizedHtml = sanitizeRichTextHtml(html);
  const plainText = (text ?? stripHtmlTags(sanitizedHtml))
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
  return { sanitizedHtml, plainText };
}

export default sanitizeRichTextHtml;
