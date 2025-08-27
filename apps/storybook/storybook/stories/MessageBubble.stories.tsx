import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '@mchat/ui-tokens';
import MessageBubble from '@mchat/message-ui/MessageBubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Messages/MessageBubble',
  component: MessageBubble,
};
export default meta;

type Story = StoryObj<typeof MessageBubble>;

export const Basic: Story = {
  render: (args) => (
    <ThemeProvider>
      <MessageBubble {...args} />
    </ThemeProvider>
  ),
  args: {
    sender: 'me',
    text: 'This is a message bubble rendered via react-native-web.',
    timestamp: new Date().toISOString(),
    status: 'sent',
  },
};
