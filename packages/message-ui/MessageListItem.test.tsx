/* eslint-disable @typescript-eslint/no-explicit-any */
import MessageListItem from './MessageListItem';
import { MessageListItemProps } from './MessageListItem';

jest.mock('react-native', () => {
  const View = (props: any) => ({ type: 'View', props });
  const Text = (props: any) => ({ type: 'Text', props });
  const StyleSheet = { create: (styles: any) => styles };
  return { View, Text, StyleSheet };
});

jest.mock(
  '@hum/ui-tokens',
  () => ({
    spacing: { xs: 2, sm: 4, md: 8 },
    typography: { fontSize: { xs: 10, md: 14 } },
    useTheme: () => ({
      colors: { primary: 'blue', surface: 'white', text: 'black' },
    }),
  }),
  { virtual: true },
);

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
    ? children.reduce(
        (acc: any[], cur: any) => acc.concat(extractText(cur)),
        [] as any[],
      )
    : extractText(children);
}

function flatten(style: any): any {
  return Array.isArray(style)
    ? style.reduce((acc: any, cur: any) => Object.assign(acc, cur), {})
    : style;
}

describe('MessageListItem', () => {
  const baseProps: MessageListItemProps = {
    sender: 'me',
    text: 'Howdy',
    timestamp: '11:00',
  };

  it('wraps message bubble with padding', () => {
    const tree = render(MessageListItem(baseProps));
    const style = flatten(tree.props.style);
    expect(style.paddingHorizontal).toBe(4);
    expect(style.paddingVertical).toBe(1);
    const bubble = tree.props.children[0];
    const texts = extractText(bubble);
    expect(texts).toContain('Howdy');
  });
});
