import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { ChatItem, type ChatItemProps } from './chat-item';
import { ThemeProvider } from './theme/theme-provider';

type Scheme = 'light' | 'dark';

const baseProps: ChatItemProps = {
  name: 'Alice',
  message: 'Hello there',
  time: '09:41',
  avatar: 'https://example.com/avatar.png',
};

function renderChatItem(
  scheme: Scheme = 'light',
  props?: Partial<ChatItemProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <ChatItem {...baseProps} {...props} />
    </ThemeProvider>,
  );
}

describe('ChatItem Component', () => {
  it('renders and matches snapshot', () => {
    const { asFragment } = renderChatItem();
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderChatItem('light', { onPress });
    fireEvent.click(getByLabelText('Chat with Alice'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows unread badge', () => {
    const { getByLabelText } = renderChatItem('light', {
      unreadCount: 2,
      isRead: true,
    });
    expect(getByLabelText('2 unread messages')).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    const { getByLabelText, rerender } = renderChatItem('light', {
      unreadCount: 1,
    });
    const badge = getByLabelText('1 unread messages');
    expect(badge).toHaveStyle({ backgroundColor: 'rgb(254, 202, 26)' });
    rerender(
      <ThemeProvider forcedScheme="dark">
        <ChatItem {...baseProps} unreadCount={1} />
      </ThemeProvider>,
    );
    expect(getByLabelText('1 unread messages')).toHaveStyle({
      backgroundColor: 'rgb(254, 202, 26)',
    });
  });
});
