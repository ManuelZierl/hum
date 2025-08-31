import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContactInline } from '@hum/ui-components';

const meta: Meta<typeof ContactInline> = {
  title: 'Components/ContactInline',
  component: ContactInline,
  args: {
    name: 'Alice',
  },
};

export default meta;

export type Story = StoryObj<typeof ContactInline>;

export const Default: Story = {};
export const Online: Story = { args: { online: true } };
