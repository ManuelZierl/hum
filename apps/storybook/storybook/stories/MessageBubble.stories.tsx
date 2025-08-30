import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageBubble } from '@hum/ui-components/message-bubble';

const meta: Meta<typeof MessageBubble> = {
  title: 'Components/MessageBubble',
  component: MessageBubble,
  argTypes: {
    isOutgoing: { control: 'boolean' },
    isRead: { control: 'boolean' },
  },
  args: {
    text: 'Hello there',
    time: '14:15',
    isOutgoing: true,
    isRead: true,
  },
};
export default meta;

type Story = StoryObj<typeof MessageBubble>;

export const OutgoingRead: Story = {};
export const OutgoingUnread: Story = {
  args: { isRead: false },
};
export const Incoming: Story = {
  args: { isOutgoing: false },
};
