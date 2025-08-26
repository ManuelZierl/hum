/* eslint-disable @typescript-eslint/no-explicit-any */
import MessageBubble, { MessageBubbleProps } from './MessageBubble';

jest.mock('react-native', () => {
  const View = (props: any) => ({ type: 'View', props });
  const Text = (props: any) => ({ type: 'Text', props });
  const StyleSheet = { create: (styles: any) => styles };
  return { View, Text, StyleSheet };
});

jest.mock('@mchat/ui-tokens', () => ({
  spacing: { xs: 2, sm: 4, md: 8 },
  typography: { fontSize: { xs: 10, md: 14 } },
  useTheme: () => ({ colors: { primary: 'blue', surface: 'white', text: 'black' } }),
}), { virtual: true });

function render(element: any): any {
  if (element == null || typeof element !== 'object') return element;
  if (typeof element.type === 'function') {
    return render(element.type(element.props));
  }
  const { children, ...rest } = element.props || {};
  const renderedChildren = Array.isArray(children)
    ? children.map(render)
    : children !== undefined
      ? [render(children)]
      : [];
  return { type: element.type, props: { ...rest, children: renderedChildren } };
}

function extractText(node: any): any[] {
  if (node == null) return [];
  if (typeof node === 'string' || typeof node === 'number') return [node];
  const children = node.props?.children || [];
  return Array.isArray(children)
    ? children.reduce((acc: any[], cur: any) => acc.concat(extractText(cur)), [] as any[])
    : extractText(children);
}

function flatten(style: any): any {
  return Array.isArray(style) ? style.reduce((acc: any, cur: any) => Object.assign(acc, cur), {}) : style;
}

describe('MessageBubble', () => {
  const baseProps: MessageBubbleProps = {
    sender: 'me',
    text: 'Hello',
    timestamp: '10:00',
  };

  it('renders text, timestamp, and status for sender "me"', () => {
    const tree = render(
      MessageBubble({ ...baseProps, status: 'read' })
    );
    const texts = extractText(tree);
    expect(texts).toEqual(expect.arrayContaining(['Hello', '10:00', 'read']));
  });

  it('omits status for sender "them"', () => {
    const tree = render(
      MessageBubble({ ...baseProps, sender: 'them', status: 'read' })
    );
    const texts = extractText(tree);
    expect(texts).toEqual(expect.arrayContaining(['Hello', '10:00']));
    expect(texts).not.toContain('read');
  });

  it('renders reply indicator when isReply is true', () => {
    const tree = render(
      MessageBubble({ ...baseProps, isReply: true })
    );
    const texts = extractText(tree);
    expect(texts).toContain('Reply');
  });

  it('applies selection styles when selected', () => {
    const tree = render(
      MessageBubble({ ...baseProps, isSelected: true })
    );
    const style = flatten(tree.props.style);
    expect(style.borderWidth).toBeDefined();
    expect(style.borderColor).toBe('blue');
  });
});

