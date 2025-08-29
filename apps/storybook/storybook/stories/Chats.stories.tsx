import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Avatar, ChatListItem, UnreadBadge } from '@mchat/message-ui';

const meta: Meta = { title: 'Chats/Components' };
export default meta;

type Story = StoryObj;

export const AvatarDemo: Story = {
  render: () => <Avatar title="Alice Example" />,
};

export const ChatListItemDemo: Story = {
  render: () => (
    <ChatListItem
      title="Alice"
      preview="Hey there!"
      time="09:41"
      unreadCount={2}
    />
  ),
};

export const UnreadBadgeDemo: Story = {
  render: () => <UnreadBadge count={5} />,
};
