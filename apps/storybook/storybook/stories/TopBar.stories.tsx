import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TopBar, type TopBarProps } from '@hum/ui-components';

const meta: Meta<typeof TopBar> = {
  title: 'Components/TopBar',
  component: TopBar,
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <Story />
      </SafeAreaProvider>
    ),
  ],
  argTypes: {
    onMenuPress: { action: 'menu pressed' },
    onCameraPress: { action: 'camera pressed' },
    onAddPress: { action: 'add pressed' },
  },
};

export default meta;

type Story = StoryObj<typeof TopBar>;

export const Basic: Story = {};

export const WithHandlers: Story = {
  args: {
    onMenuPress: () => console.log('menu'),
    onCameraPress: () => console.log('camera'),
    onAddPress: () => console.log('add'),
  },
};
