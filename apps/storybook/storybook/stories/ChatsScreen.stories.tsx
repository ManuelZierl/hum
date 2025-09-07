import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatsScreen, mockChats } from '@hum/ui-screens';
import { ThemeProvider } from '@hum/ui-components';

const meta: Meta<typeof ChatsScreen> = {
  title: 'Screens/ChatsScreen',
  component: ChatsScreen,
  argTypes: {
    onNavigateToChat: { action: 'navigate' },
  },
  args: {
    chats: mockChats,
  },
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};

export default meta;

export type Story = StoryObj<typeof ChatsScreen>;

export const Default: Story = {};

export const Empty: Story = {
  args: { chats: [] },
};

export const LightMode: Story = {
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="light">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
};

export const WithSearch: Story = {
  args: { showSearch: true },
};
