import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from '@hum/ui-screens';

const meta: Meta<typeof ChatScreen> = {
  title: 'Screens/ChatScreen',
  component: ChatScreen,
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

type Story = StoryObj<typeof ChatScreen>;

export const Basic: Story = {};
export const Empty: Story = {
  args: { messages: [] },
};
