import {
  createMatrixMessageContent,
  isSafeUrl,
  sanitizeRichContent,
  sanitizeRichTextHtml,
} from '@hum/rich-text';

describe('sanitizeRichTextHtml', () => {
  it('removes disallowed tags and attributes', () => {
    const dirty =
      '<script>alert(1)</script><p onclick="alert(2)">Hello <strong>World</strong> <a href="javascript:bad()">click</a></p>';
    const cleaned = sanitizeRichTextHtml(dirty);
    expect(cleaned).toBe('<p>Hello <strong>World</strong> <a>click</a></p>');
  });

  it('preserves allowed structures', () => {
    const input =
      '<h2>Title</h2><ul><li>One</li><li>Two</li></ul><blockquote>Quote</blockquote>';
    const cleaned = sanitizeRichTextHtml(input);
    expect(cleaned).toBe(input);
  });
});

describe('isSafeUrl', () => {
  it('accepts https and mailto links', () => {
    expect(isSafeUrl('https://example.org')).toBe(true);
    expect(isSafeUrl('mailto:test@example.org')).toBe(true);
  });

  it('rejects javascript or data urls', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('data:text/html;base64,AAAA')).toBe(false);
  });
});

describe('rich text payloads', () => {
  it('produces sanitized matrix message content', () => {
    const content = createMatrixMessageContent({
      html: '<h1>Hi</h1><script>bad()</script>',
      text: 'Hi',
    });
    expect(content).toEqual({
      msgtype: 'm.text',
      body: 'Hi',
      format: 'org.matrix.custom.html',
      formatted_body: '<h1>Hi</h1>',
    });
  });

  it('derives plain text when not provided', () => {
    const { sanitizedHtml, plainText } = sanitizeRichContent(
      '<p>Hello <strong>World</strong></p>',
    );
    expect(sanitizedHtml).toBe('<p>Hello <strong>World</strong></p>');
    expect(plainText).toBe('Hello World');
  });
});
