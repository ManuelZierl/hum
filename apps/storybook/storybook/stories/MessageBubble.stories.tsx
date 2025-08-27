import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { MessageBubble } from '@mchat/message-ui';

const meta: Meta = {
  title: 'Messages/MessageBubble',
};
export default meta;

type Story = StoryObj;

export const Demo: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <MessageBubble
        text="This is a message bubble rendered via react-native-web."
        isMe
        timestamp={Date.now()}
      />
    </div>
  ),
};
