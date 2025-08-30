import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatView } from '@hum/ui-screens';

const meta: Meta<typeof ChatView> = {
  title: 'Screens/ChatView',
  component: ChatView,
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Story />
      </SafeAreaProvider>
    ),
  ],
  argTypes: {
    onBack: { action: 'back' },
  },
  args: {
    chatName: 'Alice',
    chatAvatar: 'https://picsum.photos/200',
  },
};
export default meta;

type Story = StoryObj<typeof ChatView>;

export const Basic: Story = {};
export const Empty: Story = {
  args: { messages: [] },
};
