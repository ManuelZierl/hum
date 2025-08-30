import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatItem } from '@hum/ui-screens';

type Story = StoryObj<typeof ChatItem>;

const meta: Meta<typeof ChatItem> = {
  title: 'Screens/ChatItem',
  component: ChatItem,
  argTypes: {
    onPress: { action: 'pressed' },
  },
  args: {
    name: 'Alice',
    message: 'Hello there',
    time: '09:41',
    avatar: 'https://placekitten.com/100/100',
    unreadCount: 2,
    isRead: true,
    hasHeart: true,
    hasLocation: true,
  },
};

export default meta;

export const Basic: Story = {};
export const Unread: Story = {
  args: { unreadCount: 5, isRead: false },
};
export const NoIcons: Story = {
  args: { hasHeart: false, hasLocation: false },
};
