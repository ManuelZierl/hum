import React from 'react';
import Avatar from '../../../../../apps/mobile/src/components/chats/Avatar';

jest.mock('react-native', () => {
  const React = jest.requireActual('react');
  const create = (name: string) => ({ children, ...props }: any) =>
    React.createElement(name, props, children);
  return {
    View: create('View'),
    Text: create('Text'),
    Image: create('Image'),
    StyleSheet: { create: (styles: any) => styles },
  };
});

describe('Avatar', () => {
  it('renders initials when no avatarUri', () => {
    const element = Avatar({ title: 'John Doe' });
    const text = element.props.children;
    expect(text.props.children).toBe('JD');
  });

  it('renders image when avatarUri provided', () => {
    const uri = 'http://example.com/img.png';
    const element = Avatar({ title: 'John', avatarUri: uri, size: 32 });
    expect(element.props.source.uri).toBe(uri);
  });
});
