import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@hum/ui-components';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Press me',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {};
export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};
export const Large: Story = { args: { size: 'lg', children: 'Large Button' } };
