import {
  createMatrixMessageContent,
  isSafeUrl,
  sanitizeRichContent,
  sanitizeRichTextHtml,
  stripHtmlTags,
} from '../index';

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

  it('drops unsupported elements while keeping inner text', () => {
    const input = '<p>Before<span style="color:red">Middle</span>After</p>';
    expect(sanitizeRichTextHtml(input)).toBe('<p>BeforeMiddleAfter</p>');
  });

  it('normalises void tags to self-closing form', () => {
    expect(sanitizeRichTextHtml('<p>Line<br>Break</p>')).toBe(
      '<p>Line<br />Break</p>',
    );
  });

  it('strips HTML comments and processing instructions', () => {
    const input = '<!--test--><?php?><p>Safe</p>';
    expect(sanitizeRichTextHtml(input)).toBe('<p>Safe</p>');
  });

  it('retains safe link attributes and escapes values', () => {
    const input =
      '<a href="https://example.org?q=1&v=2&deep" title="Example & More">Link</a>';
    const cleaned = sanitizeRichTextHtml(input);
    expect(cleaned).toBe(
      '<a href="https://example.org?q=1&amp;v=2&amp;deep" title="Example &amp; More">Link</a>',
    );
  });
});

describe('stripHtmlTags', () => {
  it('converts <br> elements into newlines', () => {
    expect(stripHtmlTags('<p>One<br>Two</p>')).toBe('One\nTwo');
  });

  it('collapses excessive blank lines', () => {
    expect(stripHtmlTags('<p>One</p>\n\n\n<p>Two</p>')).toBe('One\n\nTwo');
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

  it('allows fragment and relative links', () => {
    expect(isSafeUrl('#anchor')).toBe(true);
    expect(isSafeUrl('/relative/path')).toBe(true);
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

  it('normalises supplied text newlines', () => {
    const { plainText } = sanitizeRichContent(
      '<p>One<br/>Two</p>',
      'One\r\nTwo',
    );
    expect(plainText).toBe('One\nTwo');
  });

  it('drops unsafe markup while keeping plaintext fallback', () => {
    const content = createMatrixMessageContent({
      html: '<p>Safe<script>evil()</script></p>',
      text: 'Safe',
    });
    expect(content.formatted_body).toBe('<p>Safe</p>');
    expect(content.body).toBe('Safe');
  });
});
