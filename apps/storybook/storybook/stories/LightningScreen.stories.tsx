import type { Meta, StoryObj } from '@storybook/react-vite';
import { LightningScreen } from '@hum/ui-screens';

const meta: Meta<typeof LightningScreen> = {
  title: 'Screens/LightningScreen',
  component: LightningScreen,
  args: {
    onBack: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof LightningScreen>;

export const Basic: Story = {};
export const WithBack: Story = {
  args: { onBack: () => console.log('back pressed') },
};
