import type { Meta, StoryObj } from '@storybook/react-vite';
import { TopBar } from '@hum/ui-screens';

const meta: Meta<typeof TopBar> = {
  title: 'Screens/TopBar',
  component: TopBar,
  argTypes: {
    onMorePress: { action: 'morePress' },
    onCameraPress: { action: 'cameraPress' },
    onAddPress: { action: 'addPress' },
  },
};

export default meta;

type Story = StoryObj<typeof TopBar>;

export const Basic: Story = {};

export const CustomStyled: Story = {
  args: {
    style: { backgroundColor: '#EEE' },
  },
};
