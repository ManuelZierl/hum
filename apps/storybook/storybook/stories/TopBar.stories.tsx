import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TopBar } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const meta: Meta<typeof TopBar> = {
  title: 'Screens/TopBar',
  component: TopBar,
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Story />
      </SafeAreaProvider>
    ),
  ],
  argTypes: {
    onMorePress: { action: 'more' },
    onCameraPress: { action: 'camera' },
    onPlusPress: { action: 'plus' },
  },
};

export default meta;

type Story = StoryObj<typeof TopBar>;

export const Basic: Story = {};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider forcedScheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
};
