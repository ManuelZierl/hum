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
    message: 'Hello there. My Name is Alice. Do you know me?',
    time: '09:41',
    avatar: 'https://picsum.photos/200/200',
    unreadCount: 2,
    isRead: false,
    hasHeart: false,
    hasLocation: false,
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
