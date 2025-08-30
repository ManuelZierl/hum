import type { Meta, StoryObj } from '@storybook/react-vite';
import { MessageBubble } from '@hum/ui-components';

const meta: Meta<typeof MessageBubble> = {
  title: 'Components/MessageBubble',
  component: MessageBubble,
  args: {
    text: 'Hello there!',
    time: '14:00',
    isOutgoing: false,
  },
  argTypes: {
    isOutgoing: { control: 'boolean' },
    isRead: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof MessageBubble>;

export const Incoming: Story = {};
export const OutgoingRead: Story = {
  args: { isOutgoing: true, isRead: true },
};
