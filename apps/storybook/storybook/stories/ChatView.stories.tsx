import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatView } from '@hum/ui-screens';

const meta: Meta<typeof ChatView> = {
  title: 'Screens/ChatView',
  component: ChatView,
  args: {
    chatName: 'Jane Doe',
    chatAvatar: 'https://placekitten.com/200/200',
    onBack: () => {},
  },
  argTypes: {
    onBack: { action: 'back' },
  },
};
export default meta;

type Story = StoryObj<typeof ChatView>;

export const Basic: Story = {};
export const Empty: Story = {
  args: { messages: [] },
};
