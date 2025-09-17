import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CallsScreen, mockCalls } from '@hum/ui-screens';
import { ThemeProvider, OverlayProvider } from '@hum/ui-components';

const meta: Meta<typeof CallsScreen> = {
  title: 'Screens/CallsScreen',
  component: CallsScreen,
  args: { calls: mockCalls },
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <OverlayProvider>
          <StoryFn />
        </OverlayProvider>
      </ThemeProvider>
    ),
  ],
};

export default meta;

export type Story = StoryObj<typeof CallsScreen>;

export const Default: Story = {};

export const Empty: Story = {
  args: { calls: [] },
};
