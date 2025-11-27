import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentScreen } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const stubStorage = {
  async getItem() {
    return null;
  },
  async setItem() {},
};

const meta: Meta<typeof PaymentScreen> = {
  title: 'Screens/PaymentScreen',
  component: PaymentScreen,
  argTypes: {
    onBack: { action: 'back' },
  },
  args: {
    apiKey: '',
    storage: stubStorage,
  },
};

export default meta;
export type Story = StoryObj<typeof PaymentScreen>;

export const Default: Story = {};

export const WithBackButton: Story = {
  args: { onBack: () => {} },
};

export const DarkMode: Story = {
  decorators: [
    (StoryFn: React.ComponentType) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};
