import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsScreen } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const meta: Meta<typeof SettingsScreen> = {
  title: 'Screens/SettingsScreen',
  component: SettingsScreen,
};
export default meta;

type Story = StoryObj<typeof SettingsScreen>;

export const Basic: Story = {};

export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider forcedScheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
};
