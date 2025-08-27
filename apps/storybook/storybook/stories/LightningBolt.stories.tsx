import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LightningBolt } from '@mchat/lightning-ui';
import { ThemeProvider } from '@mchat/ui-tokens';

const meta: Meta<typeof LightningBolt> = {
  title: 'Lightning/LightningBolt',
  component: LightningBolt,
};
export default meta;

type Story = StoryObj<typeof LightningBolt>;

export const Basic: Story = {
  render: (args) => (
    <ThemeProvider>
      <LightningBolt {...args} />
    </ThemeProvider>
  ),
  args: {
    label: 'Lightning',
  },
};
