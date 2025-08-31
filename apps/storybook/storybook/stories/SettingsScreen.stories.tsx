import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsScreen } from '@hum/ui-screens';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
  argTypes: {
    onBack: { action: 'back' },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsScreen>;

export const Default: Story = {};

export const WithBackButton: Story = {
  args: { onBack: () => {} },
};
