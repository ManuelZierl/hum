import UnreadBadge from './UnreadBadge';

jest.mock('react-native', () => {
  type ElementProps = Record<string, unknown> & { children?: unknown };
  const create =
    (name: string) =>
    ({ children, ...props }: ElementProps) => ({
      type: name,
      props: { ...props, children },
    });
  return {
    View: create('View'),
    Text: create('Text'),
    StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  };
});

describe('UnreadBadge', () => {
  it('renders count', () => {
    const element = UnreadBadge({ count: 5 });
    expect(element.props.children.props.children).toBe('5');
  });

  it('caps count at 99+', () => {
    const element = UnreadBadge({ count: 150 });
    expect(element.props.children.props.children).toBe('99+');
  });
});
