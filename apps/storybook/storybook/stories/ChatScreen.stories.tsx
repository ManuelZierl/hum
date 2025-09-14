import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from '@hum/ui-screens';
import type { ChatMessage } from '@hum/ui-screens/ChatScreen';

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hey! How are you doing?',
    time: '14:15',
    isOutgoing: false,
  },
  {
    id: '2',
    text: "I'm doing great! Just finished work. What about you?",
    time: '14:17',
    isOutgoing: true,
    isRead: true,
  },
  {
    id: '3',
    text: 'Same here! Just wrapped up a big project',
    time: '14:18',
    isOutgoing: false,
  },
  {
    id: '4',
    text: "That's awesome! What kind of project was it?",
    time: '14:20',
    isOutgoing: true,
    isRead: true,
  },
];

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
    messages: mockMessages,
  },
};
export default meta;

type Story = StoryObj<typeof ChatScreen>;

export const Basic: Story = {};
export const Empty: Story = {
  args: { messages: [] },
};
