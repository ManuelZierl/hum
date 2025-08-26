import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

let MessageBubble: React.ComponentType<any> | null = null;
try {
  // If your package exists, this will render it through react-native-web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MessageBubble = require('@mchat/message-ui/MessageBubble').default
    || require('@mchat/message-ui').MessageBubble;
} catch {
  // Fallback demo if package not yet built
  MessageBubble = null;
}

const Fallback: React.FC = () => (
  <div style={{ padding: 24 }}>Package <code>@mchat/message-ui</code> not found. Build it first.</div>
);

const meta: Meta = {
  title: 'Messages/MessageBubble',
};
export default meta;

type Story = StoryObj;

export const Demo: Story = {
  render: () =>
    MessageBubble ? (
      <div style={{ padding: 24, maxWidth: 420 }}>
        <MessageBubble
          text="This is a message bubble rendered via react-native-web."
          isMe
          timestamp={Date.now()}
        />
      </div>
    ) : (
      <Fallback />
    ),
};
