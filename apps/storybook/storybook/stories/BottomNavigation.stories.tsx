import type { Meta, StoryObj } from '@storybook/react-vite';
import { BottomNavigation } from '@hum/ui-screens';

const meta: Meta<typeof BottomNavigation> = {
  title: 'Screens/BottomNavigation',
  component: BottomNavigation,
  argTypes: {
    activeTab: {
      control: 'select',
      options: ['chats', 'lightning', 'settings'],
    },
    chatsBadgeCount: { control: { type: 'number' } },
  },
  args: {
    activeTab: 'chats',
    chatsBadgeCount: 0,
  },
};
export default meta;

type Story = StoryObj<typeof BottomNavigation>;

export const Default: Story = {};
export const WithBadge: Story = { args: { chatsBadgeCount: 12 } };
export const LightningActive: Story = { args: { activeTab: 'lightning' } };
