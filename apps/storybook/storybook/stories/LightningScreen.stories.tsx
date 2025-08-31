import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LightningScreen } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const meta: Meta<typeof LightningScreen> = {
  title: 'Screens/LightningScreen',
  component: LightningScreen,
  argTypes: {
    onBack: { action: 'back' },
  },
};

export default meta;
export type Story = StoryObj<typeof LightningScreen>;

export const Default: Story = {};

export const WithBackButton: Story = {
  args: { onBack: () => {} },
};

export const DarkMode: Story = {
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};
