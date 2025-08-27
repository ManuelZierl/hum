import React from 'react';
import UnreadBadge from '../../../../../apps/mobile/src/components/chats/UnreadBadge';

jest.mock('react-native', () => {
  const React = jest.requireActual('react');
  const create = (name: string) => ({ children, ...props }: any) =>
    React.createElement(name, props, children);
  return {
    View: create('View'),
    Text: create('Text'),
    StyleSheet: { create: (styles: any) => styles },
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
