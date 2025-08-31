import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TopBar } from '@hum/ui-components';

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
};

export default meta;

type Story = StoryObj<typeof TopBar>;

export const Default: Story = {};
export const WithBack: Story = { args: { backButton: true } };
export const WithTitle: Story = { args: { title: 'Title' } };
export const WithTitleIcon: Story = {
  args: { title: 'Lightning', titleIconName: 'lightning' },
};
export const WithActions: Story = {
  args: {
    backButton: true,
    leftItems: [
      { type: 'text', label: '⋯', a11yLabel: 'Menu', onPress: () => {} },
    ],
    rightItems: [
      { type: 'icon', name: 'camera', a11yLabel: 'Camera', onPress: () => {} },
      { type: 'text', label: '⋮', a11yLabel: 'More', onPress: () => {} },
    ],
  },
};
