import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  createDefaultTheme,
  renderRichTextToNative,
  sanitizeRichTextHtml,
} from '../index';

describe('renderRichTextToNative', () => {
  const theme = createDefaultTheme({
    textColor: '#111',
    headingColor: '#222',
    linkColor: '#0070f3',
    codeBackground: '#f5f5f5',
    codeColor: '#111',
    blockquoteBorder: '#ccc',
    mutedColor: '#666',
  });

  it('renders basic paragraph content', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    const node = renderRichTextToNative(html, { theme });
    let root: renderer.ReactTestRenderer | undefined;
    act(() => {
      root = renderer.create(<>{node}</>);
    });
    expect(root?.toJSON()).toMatchSnapshot();
  });

  it('renders lists and blockquotes', () => {
    const html = sanitizeRichTextHtml(
      '<blockquote><p>Quote</p></blockquote><ul><li>First</li><li>Second</li></ul>',
    );
    const node = renderRichTextToNative(html, { theme });
    let root: renderer.ReactTestRenderer | undefined;
    act(() => {
      root = renderer.create(<>{node}</>);
    });
    expect(root?.toJSON()).toMatchSnapshot();
  });
});
