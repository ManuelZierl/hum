import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatsScreen, mockChats } from '@hum/ui-screens';

const meta: Meta<typeof ChatsScreen> = {
  title: 'Screens/ChatsScreen',
  component: ChatsScreen,
  argTypes: {
    onNavigateToChat: { action: 'navigate' },
  },
  args: {
    chats: mockChats,
  },
};

export default meta;

export type Story = StoryObj<typeof ChatsScreen>;

export const Default: Story = {};

export const Empty: Story = {
  args: { chats: [] },
};

export const LightMode: Story = {
  args: { initialScheme: 'light' },
};
